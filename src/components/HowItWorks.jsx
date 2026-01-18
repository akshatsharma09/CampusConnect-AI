const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: '👤',
      label: 'Complete Profile'
    },
    {
      id: 2,
      icon: '🤖',
      label: 'AI Matches Opportunities'
    },
    {
      id: 3,
      icon: '🚀',
      label: 'Apply & Track'
    }
  ];

  return (
    <div className="py-16 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div className="bg-slate-800 rounded-xl p-4 mb-4">
                <div className="text-2xl">{step.icon}</div>
              </div>
              <div className="text-slate-300 text-sm font-medium">{step.label}</div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute mt-8 ml-24 text-slate-400 text-xl">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
