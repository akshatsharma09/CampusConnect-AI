import { Search } from 'lucide-react';

const MagicSearchBar = ({
  query,
  setQuery,
  onSubmit,
  suggestions = [],
  onSuggestionClick,
  loading = false,
  showSuggestions = false
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      onSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all duration-200">
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search opportunities or ask AI…"
            className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
            disabled={loading}
          />
          <button
            onClick={onSubmit}
            disabled={loading || !query.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 text-white px-4 py-2 rounded-xl transition-all duration-200 font-medium"
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
