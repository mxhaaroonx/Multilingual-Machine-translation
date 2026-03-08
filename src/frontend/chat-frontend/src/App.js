import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Chat from './components/Chat';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') document.body.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className={`App ${theme}`}>
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <Chat currentUser={user} onLogout={handleLogout} onUpdateUser={setUser} theme={theme} toggleTheme={toggleTheme} />
      )}
    </div>
  );
}

export default App;