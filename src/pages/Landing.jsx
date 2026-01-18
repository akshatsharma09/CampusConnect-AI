import { useState } from 'react';
import MagicSearchBar from '../components/MagicSearchBar';
import OpportunityCard from '../components/OpportunityCard';
import CampusAssistant from '../components/CampusAssistant';
import { askCampusAssistant } from '../services/campusChatbot';

const Landing = ({ onNavigateToLogin }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions] = useState(['Internships', 'Hackathons by Campus', 'Workshops', 'Tech Events']);

  // Mock featured opportunities for before login
  const featuredOpportunities = [
    {
      id: 1,
      title: 'Summer Internship Program',
      type: 'Internship',
      domain: 'Software Development',
      description: 'Join our summer internship program and gain real-world experience in software development.',
      eligibleYear: '2nd Year & Above',
      deadline: '2024-06-30',
      link: '#',
      campusVerified: true
    },
    {
      id: 2,
      title: 'Hackathon 2024',
      type: 'Hackathon',
      domain: 'AI/ML',
      description: 'Compete in our annual hackathon focused on AI and machine learning solutions.',
      eligibleYear: 'All Years',
      deadline: '2024-05-15',
      link: '#',
      campusVerified: true
    },
    {
      id: 3,
      title: 'Web Development Workshop',
      type: 'Workshop',
      domain: 'Web Development',
      description: 'Learn modern web development techniques with hands-on projects.',
      eligibleYear: '1st Year & Above',
      deadline: '2024-04-20',
      link: '#',
      campusVerified: false
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // For demo, perhaps show a toast or navigate to login
    alert('Please sign in to search for opportunities.');
    onNavigateToLogin();
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
  };

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
        <button
          onClick={onNavigateToLogin}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign-In
        </button>
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

        {/* Featured Cards */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Featured Opportunities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer with ChatBot */}
      <CampusAssistant onSendMessage={askCampusAssistant} />
    </div>
  );
};

export default Landing;
