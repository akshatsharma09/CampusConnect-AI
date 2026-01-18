import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import toast, { Toaster } from 'react-hot-toast';
import HeroBackground from './HeroBackground';

const Hero = () => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('Sign-in successful');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(`Sign-in failed: ${error.message}`);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Enhanced Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/20 via-transparent to-blue-400/20"></div>
      
      {/* AI Network Background */}
      <div className="absolute inset-0">
        <HeroBackground isDarkMode={false} />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Logo/Branding */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl font-bold text-white drop-shadow-lg">
            Campus Connect
          </h1>
        </div>

        {/* Hero Headline */}
        <div className="mb-10 animate-fade-in-delay">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white drop-shadow-md">
            Find Your Next Opportunity
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 drop-shadow-md">
            AI-powered search for internships, hackathons, and workshops tailored to you
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col gap-4 justify-center mb-10 animate-fade-in-delay-2">
          <button
            onClick={handleGoogleSignIn}
            className="bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl text-lg font-bold"
          >
            Sign in with Google
          </button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-3 animate-fade-in-delay-3">
          {['✨ AI-Powered', '🎓 For Students', '🚀 Free', '⚡ Instant Results'].map((feature) => (
            <span
              key={feature}
              className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default Hero;
