import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import AuthPage from './components/AuthPage';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <>
      {isAuthenticated ? (
        <Layout theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />
      ) : (
        <AuthPage theme={theme} toggleTheme={toggleTheme} onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </>
  );
}

export default App;
