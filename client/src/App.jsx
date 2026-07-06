import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session parameters are stored locally
    const activeSession = localStorage.getItem("gridflow_session");
    if (activeSession) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Handle live session initialization down from Login child component
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs font-mono text-slate-500">LOADING_SYSTEM_PIPELINE...</div>;
  }

  return (
    <>
      {/* Global Toast Configuration */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#cbd5e1',
            border: '1px solid #1e293b',
            fontSize: '13px',
            borderRadius: '12px'
          },
          success: {
            iconTheme: {
              primary: '#06b6d4',
              secondary: '#0f172a',
            },
          },
        }}
      />
      
      {isAuthenticated ? (
        <Home />
      ) : (
        <Login onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  );
}

export default App;