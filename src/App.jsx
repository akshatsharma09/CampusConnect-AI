import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import Login from './pages/Login';
import Home from './pages/Home';
import Landing from './pages/Landing';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('landing');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setCurrentView('home');
      } else {
        setCurrentView('landing');
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <Home user={user} />
      ) : currentView === 'login' ? (
        <Login onBackToLanding={() => setCurrentView('landing')} />
      ) : (
        <Landing onNavigateToLogin={() => setCurrentView('login')} />
      )}
    </div>
  );
}

export default App;
