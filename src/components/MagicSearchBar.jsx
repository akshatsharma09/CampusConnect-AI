import { useState, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';

const MagicSearchBar = ({
  query,
  setQuery,
  onSubmit,
  suggestions = [],
  onSuggestionClick,
  loading = false,
  showSuggestions = false
}) => {
  const placeholders = [
    "2nd year CSE internships",
    "AI hackathons in January",
    "Backend roles for 3rd year"
  ];
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      onSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* AI Badge */}
      <div className="flex justify-center mb-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          AI-Powered
        </span>
      </div>

      {/* Search Input */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 focus-within:ring-4 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 hover:border-slate-600 transition-all duration-300 shadow-lg hover:shadow-xl">
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[currentPlaceholder]}
            className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none transition-all duration-200"
            disabled={loading}
          />
          <button
            onClick={onSubmit}
            disabled={loading || !query.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium hover:shadow-lg active:scale-95"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
      </div>

      {/* AI Subtext */}
      <p className="text-center text-slate-400 text-sm mt-2">
        AI-powered search understands skills, year & eligibility.
      </p>

      {/* Live Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg overflow-hidden">
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-slate-200">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MagicSearchBar;
