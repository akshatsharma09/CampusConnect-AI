import { useState } from 'react';

const HowItWorks = () => {
  const [expandedStep, setExpandedStep] = useState(null);

  const steps = [
    {
      id: 1,
      icon: '👤',
      title: 'Step 1: Complete Your Profile',
      description: 'Tell us your year, branch, skills, and interests',
      details: 'Campus Connect learns about your academic background and technical skills to recommend perfectly matched opportunities. This takes less than 2 minutes!'
    },
    {
      id: 2,
      icon: '🤖',
      title: 'Step 2: AI Analyzes & Ranks',
      description: 'Our AI engine finds and ranks top opportunities for you',
      details: 'Using explainable AI, we analyze thousands of opportunities against your profile. Each opportunity is ranked based on your year, branch, skills, deadlines, and campus relevance.'
    },
    {
      id: 3,
      icon: '⭐',
      title: 'Step 3: Get Personalized Recommendations',
      description: 'See why each opportunity is right for you',
      details: 'Every recommendation includes a clear explanation of why it matches you. Example: "Recommended: Matches your skills in Python & AI; deadline is near; verified for your campus."'
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🎯 How Campus Connect Works
          </h2>
          <p className="text-xl text-gray-600">
            Three simple steps to find your perfect opportunity
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 w-1 h-12 bg-indigo-300 hidden sm:block"></div>
              )}

              <div
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="bg-white border-2 border-indigo-200 rounded-lg p-6 cursor-pointer hover:shadow-lg hover:border-indigo-400 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0">{step.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                    
                    {expandedStep === step.id && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-gray-800">{step.details}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-2xl text-indigo-600 flex-shrink-0">
                    {expandedStep === step.id ? '−' : '+'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Campus Connect */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">✨ Why Campus Connect?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">🎓</div>
              <h4 className="font-bold mb-2">Campus-Focused</h4>
              <p className="text-indigo-100">
                Opportunities verified specifically for your college, year, and branch
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🔍</div>
              <h4 className="font-bold mb-2">Explainable AI</h4>
              <p className="text-indigo-100">
                Transparent ranking with clear reasons for each recommendation
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-bold mb-2">Saves Time</h4>
              <p className="text-indigo-100">
                No more scrolling through irrelevant opportunities on LinkedIn or Internshala
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
