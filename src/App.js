import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import './App.css'; // Import the updated App.css
import { AuthProvider } from './AuthContext';

import FoodEntry from './FoodEntry';
import FoodShortage from './FoodShortages';
import FoodMatching from './FoodMatching';
import ProviderDashboard from './ProviderDashboard';
import Login from './Login';
import SignUp from './Signup';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="loading">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
  };

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <nav className="navbar">
            <div className="logo">
              <Link to="/">A Food Project</Link>
            </div>
            <div className="nav-links">
              <Link to="/">Home</Link>
              {user ? (
                <>
                  <Link to="/donate-food">Donate Food</Link>
                  <Link to="/request-food">Request Food</Link>
                  <Link to="/find-food">Find Food</Link>
                  <Link to="/dashboard">Dashboard</Link>
                  <button className="sign-out-btn" onClick={() => auth.signOut()}>Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Sign Up</Link>
                </>
              )}
            </div>
          </nav>

          <div className="content">
            <Routes>
              <Route path="/" element={<div className="home-page">
                
                <p>Connecting those with excess food to those in need</p>
                {!user && (
                  <div className="cta-buttons">
                    <Link to="/login" className="cta-button">Login</Link>
                    <Link to="/signup" className="cta-button">Sign Up</Link>
                  </div>
                )}
              </div>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/donate-food" element={<ProtectedRoute><FoodEntry /></ProtectedRoute>} />
              <Route path="/request-food" element={<ProtectedRoute><FoodShortage /></ProtectedRoute>} />
              <Route path="/find-food" element={<ProtectedRoute><FoodMatching /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
            </Routes>
          </div>

          <footer className="footer">
            <p>&copy; {new Date().getFullYear()} Food Sharing Platform</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;