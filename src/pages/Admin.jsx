import { useState, useEffect } from 'react';
import { fetchOpportunities } from '../services/opportunityService';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">CampusConnect AI - Admin</h1>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h4 className="text-lg font-medium text-gray-900">{opp.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{opp.type} - {opp.domain}</p>
                  <p className="text-sm text-gray-600 mt-2">{opp.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Deadline: {opp.deadline}</p>
                  <p className="text-xs text-gray-500 mt-2">Eligible Year: {opp.eligibleYear}</p>
                  <a
                    href={opp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
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