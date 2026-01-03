import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { fetchOpportunities, seedDatabase } from '../services/opportunityService';
import { searchOpportunitiesWithAI } from '../services/geminiService';
import OpportunityCard from '../components/OpportunityCard';

const Home = ({ user }) => {
  const [query, setQuery] = useState('');
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [displayedOpportunities, setDisplayedOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiReasons, setAiReasons] = useState({});

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchOpportunities();
      setAllOpportunities(data);
      setDisplayedOpportunities(data);
    };
    loadData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setDisplayedOpportunities(allOpportunities);
      setAiReasons({});
      return;
    }

    setLoading(true);
    try {
      const recommendations = await searchOpportunitiesWithAI(query, allOpportunities);
      const filtered = [];
      const reasons = {};
      
      recommendations.forEach(rec => {
        const opp = allOpportunities.find(o => o.id === rec.id);
        if (opp) {
          filtered.push(opp);
          reasons[opp.id] = rec.reason;
        }
      });

      setDisplayedOpportunities(filtered);
      setAiReasons(reasons);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">CampusConnect AI</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">{user.displayName}</span>
          <button onClick={() => signOut(auth)} className="text-sm text-red-600 font-medium">Sign Out</button>
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
          <button onClick={seedDatabase} className="block mx-auto mt-2 text-xs text-gray-400 underline">(Dev: Seed Database)</button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedOpportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} reason={aiReasons[opp.id]} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;