import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getGeminiResponse } from '../services/gemini';
import { fetchOpportunities } from '../services/opportunityService';
import SearchBar from '../components/SearchBar';
import OpportunityCard from '../components/OpportunityCard';

const Home = ({ user }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Fetch opportunities from Firestore
      const opportunities = await fetchOpportunities();

      // Send to Gemini for filtering
      const geminiResults = await getGeminiResponse(query, opportunities);
      setResults(geminiResults);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">CampusConnect AI</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.displayName}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Opportunities</h2>
            <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} loading={loading} />
          </div>

          {results.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Opportunities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((item, index) => (
                  <OpportunityCard key={index} opportunity={item.opportunity} reason={item.reason} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;