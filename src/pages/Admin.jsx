import { useState, useEffect } from 'react';
import { fetchOpportunities, syncRealEvents } from '../services/opportunityService';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const Admin = ({ user }) => {
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    const loadOpportunities = async () => {
      const data = await fetchOpportunities();
      setOpportunities(data);
    };

    loadOpportunities();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSyncEvents = async () => {
    try {
      await syncRealEvents();
      // Refresh opportunities list
      const data = await fetchOpportunities();
      setOpportunities(data);
    } catch (error) {
      console.error('Error syncing events:', error);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Enhanced Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 -z-20"></div>
      
      {/* Overlay gradient for depth */}
      <div className="fixed inset-0 bg-gradient-to-tr from-indigo-900/20 via-transparent to-blue-400/20 -z-20"></div>

      <header className="relative z-10 bg-white/10 backdrop-blur-md shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">Campus Connect - Admin</h1>
            <div className="flex items-center space-x-4">
              <span className="text-blue-100 font-medium drop-shadow">Welcome, {user.displayName}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">All Opportunities</h2>
            <button
              onClick={handleSyncEvents}
              className="bg-green-500/80 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md"
            >
              Sync Real Events
            </button>
          </div>

          {/* AI Metrics Dashboard */}
          <div className="mb-6 bg-white/95 rounded-lg p-6 backdrop-blur-sm border border-white/20">
            <h3 className="text-lg font-bold text-indigo-600 mb-4">AI Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{opportunities.length}</p>
                <p className="text-sm text-gray-600">Total Opportunities</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {opportunities.filter(opp => opp.campusVerified).length}
                </p>
                <p className="text-sm text-gray-600">Verified Events</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {opportunities.filter(opp => opp.type === 'Hackathon').length}
                </p>
                <p className="text-sm text-gray-600">Hackathons</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {opportunities.filter(opp => opp.type === 'Internship').length}
                </p>
                <p className="text-sm text-gray-600">Internships</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>💡 <strong>Demo Note:</strong> Precision@5 and Recall@10 metrics are calculated during AI searches and logged in console.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white/95 overflow-hidden shadow-lg rounded-lg backdrop-blur-sm hover:shadow-xl transition-all border border-white/20">
                <div className="p-6">
                  <h4 className="text-lg font-bold text-indigo-600">{opp.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 font-medium">{opp.type} - {opp.domain}</p>
                  <p className="text-sm text-gray-700 mt-2">{opp.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Deadline: {opp.deadline}</p>
                  <p className="text-xs text-gray-500 mt-2">Eligible Year: {opp.eligibleYear}</p>
                  <a
                    href={opp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  >
                    View Link
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;