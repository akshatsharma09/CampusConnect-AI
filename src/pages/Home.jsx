import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { fetchOpportunities } from '../services/opportunityService';
import { askCampusAssistant } from '../services/campusChatbot';
import { searchOpportunitiesWithAI } from '../services/aiSearch';
import OpportunityCard from '../components/OpportunityCard';
import MagicSearchBar from '../components/MagicSearchBar';
import UserProfile from '../components/UserProfile';
import CampusAssistant from '../components/CampusAssistant';

const Home = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchOpportunities();
        setOpportunities(data);
        setFilteredOpportunities(data.slice(0, 3)); // Show first 3 as dynamic
      } catch (err) {
        console.error('Error loading opportunities:', err);
      } finally {
        setLoading(false);
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
      } catch (e) {
        console.error('Error parsing saved profile:', e);
      }
    }
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const aiResults = await searchOpportunitiesWithAI(searchQuery, opportunities);

      // Map AI results to full opportunity objects with additional data
      const fullOpportunities = aiResults.map(rec => {
        const opp = opportunities.find(o => o.id === rec.opportunityId);
        if (!opp) return null;

        return {
          ...opp,
          combinedScore: rec.combinedScore,
          explanation: rec.explanation
        };
      }).filter(Boolean).sort((a, b) => b.combinedScore - a.combinedScore);

      setFilteredOpportunities(fullOpportunities);
    } catch (error) {
      console.error('AI search failed:', error);
      // Fallback to basic search
      const filtered = opportunities.filter(opp =>
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOpportunities(filtered.slice(0, 5));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProfileSubmit = (profile) => {
    setUserProfile(profile);
    // Optionally refilter opportunities based on profile
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
  };

  const suggestions = ['Internships', 'Hackathons by Campus', 'Workshops', 'Tech Events'];

  return (
    <div className="min-h-screen bg-neutral">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">CampusConnect</h1>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={() => {
                  setShowProfileModal(true);
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
              >
                My Profile
              </button>
              <button
                onClick={() => signOut(auth).catch(console.error)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-red-600"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Section */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover CampusConnect – Your Gateway to Opportunities
          </h2>
          <p className="text-lg text-gray-600">
            Find internships, hackathons, workshops, and more tailored to your skills and interests.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <MagicSearchBar
            query={searchQuery}
            setQuery={setSearchQuery}
            onSubmit={handleSearchSubmit}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            loading={searchLoading}
            showSuggestions={searchQuery.length > 0}
          />
        </div>

        {/* AI Suggestions */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-500 mb-4">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(suggestion)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Cards */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Recommended for You</h3>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading opportunities...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  reason={opp.explanation}
                  rankingDetails={opp.combinedScore !== undefined ? { score: Math.round(opp.combinedScore * 100) } : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer with ChatBot */}
      <CampusAssistant onSendMessage={(message) => askCampusAssistant(message, [], opportunities)} />

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfile
          onProfileSubmit={handleProfileSubmit}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default Home;
