import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { fetchOpportunities, seedDatabase } from '../services/opportunityService';
import { searchOpportunitiesWithAI, generateQuerySuggestions } from '../services/gemini';
import { fetchCampusContext, seedCampusDatabase } from '../services/campusService';
import { askCampusAssistant } from '../services/campusChatbot';
import { calculateRankingReasons, filterByCampus, sortByRelevance } from '../services/rankingEngine';
import OpportunityCard from '../components/OpportunityCard';
import CampusAssistant from '../components/CampusAssistant';
import UserProfile from '../components/UserProfile';
import HowItWorks from '../components/HowItWorks';

const Home = ({ user }) => {
  console.log('Home component rendering, user:', user);

  const [query, setQuery] = useState('');
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [displayedOpportunities, setDisplayedOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiReasons, setAiReasons] = useState({});
  const [rankingDetails, setRankingDetails] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [campusContext, setCampusContext] = useState([]);
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(true);

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

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
        setShowHowItWorks(false);
      } catch (e) {
        console.error('Error parsing saved profile:', e);
      }
    }
  }, []);

  useEffect(() => {
    const loadCampusContext = async () => {
      const context = await fetchCampusContext();
      setCampusContext(context);
      console.log('✅ Campus context loaded:', context.length, 'documents');
    };
    loadCampusContext();
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
      setRankingDetails({});
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('🚀 Calling AI search...');
      const recommendations = await searchOpportunitiesWithAI(query, allOpportunities);
      console.log('🎯 AI search results:', recommendations);

      // ✅ VALIDATION: Handle empty results cleanly
      if (!recommendations || recommendations.length === 0) {
        console.log('⚠️ No relevant opportunities found for query:', query);
        setDisplayedOpportunities([]);
        setAiReasons({});
        setRankingDetails({});
        setError(null);
        setShowSuggestions(false);
        return;
      }

      let filtered = [];
      const reasons = {};
      
      recommendations.forEach(rec => {
        const opp = allOpportunities.find(o => o.id === rec.id);
        if (opp) {
          filtered.push(opp);
          reasons[opp.id] = rec.reason;
        }
      });

      // Apply campus filtering if user has profile
      if (userProfile?.branch) {
        filtered = filterByCampus(filtered, userProfile.branch);
      }

      // Calculate detailed ranking reasons
      console.log('🎯 Calculating ranking reasons for filtered opportunities...');
      const detailedReasons = await calculateRankingReasons(filtered, userProfile, query);
      
      // Sort by relevance score
      filtered = sortByRelevance(filtered, detailedReasons);

      console.log('✅ Filtered opportunities:', filtered.length);
      setDisplayedOpportunities(filtered);
      setAiReasons(reasons);
      setRankingDetails(detailedReasons);
      setShowSuggestions(false);
    } catch (error) {
      console.error("❌ Search failed:", error);
      setError("AI search failed. Please try again.");
      setDisplayedOpportunities([]);
      setAiReasons({});
      setRankingDetails({});
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

  const handleCampusMessage = async (userMessage) => {
    setChatbotLoading(true);
    try {
      const response = await askCampusAssistant(userMessage, campusContext);
      return response;
    } catch (error) {
      console.error('Campus Assistant Error:', error);
      return {
        success: false,
        message: "Campus Assistant encountered an error.",
        refusal: false
      };
    } finally {
      setChatbotLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Enhanced Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 -z-20"></div>
      
      {/* Overlay gradient for depth */}
      <div className="fixed inset-0 bg-gradient-to-tr from-indigo-900/20 via-transparent to-blue-400/20 -z-20"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-md shadow-lg px-4 py-4 flex justify-between items-center border-b border-white/20">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white drop-shadow-md">🎓 Campus Connect</h1>
          {userProfile && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
              ✓ Profile Ready
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-100 hidden sm:block drop-shadow">{user.displayName}</span>
          <button 
            onClick={() => setShowProfileModal(true)}
            className="text-sm text-white font-medium bg-indigo-600/80 hover:bg-indigo-700 px-3 py-2 rounded-lg transition-all"
          >
            {userProfile ? '👤 Profile' : '➕ Add Profile'}
          </button>
          <button 
            onClick={() => signOut(auth).catch(console.error)} 
            className="text-sm text-white font-medium bg-red-500/80 hover:bg-red-600 px-4 py-2 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfile 
          onProfileSubmit={(profile) => {
            setUserProfile(profile);
            setShowHowItWorks(false);
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* How It Works Section */}
      {showHowItWorks && <HowItWorks />}

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        {!showHowItWorks && (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white drop-shadow-md">
                🎯 Find Your Next Opportunity
              </h2>
              <p className="mt-2 text-blue-100 drop-shadow">
                {userProfile 
                  ? `Personalized recommendations for ${userProfile.year} year ${userProfile.branch} students`
                  : 'Add your profile to get personalized recommendations'}
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-12">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  className="w-full px-6 py-4 rounded-full border border-white/30 shadow-lg focus:ring-2 focus:ring-white outline-none text-lg bg-white/95 placeholder-gray-500"
                  placeholder={userProfile 
                    ? "e.g., 'AI internships' or 'Python hackathons'"
                    : "e.g., 'Internships for 3rd year CS students'"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 bg-white text-indigo-600 px-6 rounded-full font-medium hover:bg-blue-50 disabled:bg-gray-300 transition-all shadow-md"
                >
                  {loading ? 'Searching...' : 'Ask AI'}
                </button>
              </form>

              {/* Sample Queries */}
              {suggestions.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={toggleSuggestions}
                    className="text-sm text-white hover:text-blue-100 underline drop-shadow font-medium"
                  >
                    {showSuggestions ? 'Hide' : 'Show'} sample queries
                  </button>
                  {showSuggestions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm text-white transition-all backdrop-blur-sm border border-white/30"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Dev Buttons */}
              <div className="mt-4 text-center space-y-1">
                <button 
                  onClick={seedDatabase} 
                  className="block mx-auto text-xs text-white/70 underline hover:text-white/90 transition"
                >
                  (Dev: Seed Opportunities)
                </button>
                <button 
                  onClick={seedCampusDatabase} 
                  className="block mx-auto text-xs text-white/70 underline hover:text-white/90 transition"
                >
                  (Dev: Seed Campus Info)
                </button>
              </div>
            </div>

            {/* Results Section */}
            {initialLoading && (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="mt-2 text-white drop-shadow">Loading opportunities...</p>
              </div>
            )}

            {!initialLoading && query.trim() && displayedOpportunities.length === 0 && !error && (
              <div className="text-center py-10">
                <p className="text-white/90 drop-shadow font-semibold">
                  No relevant opportunities found for "{query}"
                </p>
                <p className="mt-2 text-blue-100 drop-shadow text-sm">
                  Try adjusting your search or view all opportunities by clearing the search.
                </p>
                <button 
                  onClick={() => { 
                    setQuery(''); 
                    setDisplayedOpportunities(allOpportunities); 
                    setAiReasons({}); 
                    setRankingDetails({});
                  }}
                  className="mt-4 bg-white text-indigo-600 px-4 py-2 rounded font-medium hover:bg-blue-50 transition-all"
                >
                  Clear Search
                </button>
              </div>
            )}

            {error && (
              <div className="text-center py-10">
                <p className="text-white/90 mb-4 drop-shadow font-semibold">{error}</p>
                <button 
                  onClick={() => { 
                    setError(null); 
                    setQuery(''); 
                    setDisplayedOpportunities(allOpportunities); 
                    setRankingDetails({});
                  }}
                  className="bg-white text-indigo-600 px-4 py-2 rounded font-medium hover:bg-blue-50 transition-all"
                >
                  Clear Error
                </button>
              </div>
            )}

            {/* Opportunities Grid */}
            {displayedOpportunities.length > 0 && (
              <>
                <div className="mb-6 text-white drop-shadow">
                  <p className="font-semibold">
                    Found {displayedOpportunities.length} opportunity(ies) {userProfile && `for your profile`}
                  </p>
                  {rankingDetails && Object.keys(rankingDetails).length > 0 && (
                    <p className="text-sm text-blue-100 mt-1">
                      ✨ Ranked by relevance using AI analysis
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {displayedOpportunities.map((opp) => (
                    <OpportunityCard 
                      key={opp.id} 
                      opportunity={opp} 
                      reason={aiReasons[opp.id] || rankingDetails[opp.id]?.reason}
                      rankingDetails={rankingDetails[opp.id]}
                    />
                  ))}
                </div>
              </>
            )}

            {!initialLoading && !query.trim() && displayedOpportunities.length === 0 && (
              <div className="text-center py-10">
                <p className="text-white/90 drop-shadow font-semibold text-lg">
                  👀 Start searching to find opportunities
                </p>
                <p className="mt-2 text-blue-100 drop-shadow">
                  {userProfile 
                    ? 'Use the search bar above to find internships, hackathons, and workshops tailored to you'
                    : 'Complete your profile first to get personalized recommendations'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Campus Assistant Chatbot */}
      <CampusAssistant onSendMessage={handleCampusMessage} loading={chatbotLoading} />
    </div>
  );
};

export default Home;