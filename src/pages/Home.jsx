import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { fetchOpportunities } from '../services/opportunityService';
import { askCampusAssistant } from '../services/campusChatbot';
import OpportunityCard from '../components/OpportunityCard';
import HowItWorks from '../components/HowItWorks';
import CampusAssistant from '../components/CampusAssistant';

const Home = ({ user }) => {
  const [eligibleOpportunities, setEligibleOpportunities] = useState([]);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchOpportunities();
        // For demo, assume first 8 are eligible, rest hidden
        setEligibleOpportunities(data.slice(0, 8));
        setTotalOpportunities(data.length);
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

  const profileCompleteness = userProfile ? 92 : 0; // Mock completeness

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Top Bar */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Campus Connect</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: '#64748B' }}>{profileCompleteness}% complete</span>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <button
            onClick={() => signOut(auth).catch(console.error)}
            className="text-sm px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Eligibility Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#0F172A' }}>
            You are eligible for {eligibleOpportunities.length} opportunities
          </h2>
          <p className="text-sm" style={{ color: '#64748B' }}>
            Based on your academic year, CGPA, skills & eligibility constraints
          </p>
        </div>

        {/* Opportunity Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4F46E5' }}></div>
            <p className="mt-4" style={{ color: '#64748B' }}>Loading opportunities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {eligibleOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                rankingDetails={{
                  academicYear: 85,
                  cgpa: 90,
                  skills: 75,
                  location: 100,
                  finalScore: 87
                }}
              />
            ))}
          </div>
        )}

        {/* Hidden Opportunities Insight */}
        <div className="text-center">
          <p className="text-sm" style={{ color: '#64748B' }}>
            {totalOpportunities - eligibleOpportunities.length} opportunities were hidden because you are not eligible.
          </p>
        </div>
      </main>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Campus Assistant Widget */}
      <CampusAssistant onSendMessage={askCampusAssistant} />
    </div>
  );
};

export default Home;
