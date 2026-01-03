import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { fetchOpportunities, seedDatabase } from '../services/opportunityService';
import { searchOpportunitiesWithAI, generateQuerySuggestions } from '../services/gemini';
import OpportunityCard from '../components/OpportunityCard';

const Home = ({ user }) => {
  console.log('Home component rendering, user:', user);

  const [query, setQuery] = useState('');
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [displayedOpportunities, setDisplayedOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiReasons, setAiReasons] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading opportunities...');
        const data = await fetchOpportunities();
        console.log('Loaded opportunities:', data);
        setAllOpportunities(data);
        setDisplayedOpportunities(data);
        setError(null);
      } catch (err) {
        console.error('Error loading opportunities:', err);
        setError('Failed to load opportunities. Please check your Firebase configuration.');
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    console.log('🔄 Opportunities updated:', allOpportunities.length);
  }, [allOpportunities]);

  useEffect(() => {
    const loadSuggestions = async () => {
      const suggs = await generateQuerySuggestions();
      setSuggestions(suggs);
    };
    loadSuggestions();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('🔎 Search initiated with query:', query);
    console.log('📋 All opportunities available:', allOpportunities.length);

    if (!query.trim()) {
      console.log('⚠️ Empty query, showing all opportunities');
      setDisplayedOpportunities(allOpportunities);
      setAiReasons({});
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Calling AI search...');
      const recommendations = await searchOpportunitiesWithAI(query, allOpportunities);
      console.log('🎯 AI search results:', recommendations);

      const filtered = [];
      const reasons = {};
      
      recommendations.forEach(rec => {
        const opp = allOpportunities.find(o => o.id === rec.id);
        if (opp) {
          filtered.push(opp);
          reasons[opp.id] = rec.reason;
        }
      });

      console.log('✅ Filtered opportunities:', filtered.length);
      setDisplayedOpportunities(filtered);
      setAiReasons(reasons);
      setShowSuggestions(false); // Hide suggestions after search
    } catch (error) {
      console.error("❌ Search failed:", error);
      setError("AI search failed. Showing all opportunities instead.");
      setDisplayedOpportunities(allOpportunities);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {console.log('Home component returning JSX')}
      <nav className="bg-white shadow-sm px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">CampusConnect AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">{user.displayName}</span>
          <button onClick={() => signOut(auth).catch(console.error)} className="text-sm text-red-600 font-medium">Sign Out</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Find Your Next Opportunity</h2>
          <p className="mt-2 text-gray-500">Ask AI to find hackathons, internships, and workshops.</p>
        </div>

        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              className="w-full px-6 py-4 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              placeholder="e.g., 'Internships for 3rd year CS students'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-full font-medium hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Searching...' : 'Ask AI'}
            </button>
          </form>

          {suggestions.length > 0 && (
            <div className="mt-4">
              <button
                onClick={toggleSuggestions}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showSuggestions ? 'Hide' : 'Show'} AI suggestions
              </button>
              {showSuggestions && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={seedDatabase} className="block mx-auto mt-4 text-xs text-gray-400 underline">(Dev: Seed Database)</button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} reason={aiReasons[opp.id]} />
          ))}
        </div>

        {initialLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading opportunities...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;