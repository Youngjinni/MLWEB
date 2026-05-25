import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Community from './pages/Community';
import PostWrite from './pages/PostWrite';
import PostDetail from './pages/PostDetail';
import LstmAnalysis from './pages/LstmAnalysis';
import RfAnalysis from './pages/RfAnalysis';
import { tokenStorage } from './api/auth';
import './App.css';

function App() {
  // 수정: accessToken 기준으로 인증 상태 확인
  const [isAuthenticated, setIsAuthenticated] = useState(!!tokenStorage.getAccess());

  useEffect(() => {
    const syncAuth = () => setIsAuthenticated(!!tokenStorage.getAccess());
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  return (
    <Router>
      <Header onAuthChange={setIsAuthenticated} />
      <div>
        <Routes>
          <Route path="/" element={<h1 style={{ padding: '40px 24px', color: '#191f28' }}>mlweb</h1>} />
          <Route path="/login"    element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} />
          <Route path="/signup"   element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
          <Route path="/profile"  element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/posts"    element={isAuthenticated ? <Community /> : <Navigate to="/login" />} />
          <Route path="/posts/write"  element={isAuthenticated ? <PostWrite />   : <Navigate to="/login" />} />
          <Route path="/posts/:id"    element={isAuthenticated ? <PostDetail />  : <Navigate to="/login" />} />
          <Route path="/analysis/lstm" element={isAuthenticated ? <LstmAnalysis /> : <Navigate to="/login" />} />
          <Route path="/analysis/rf"   element={isAuthenticated ? <RfAnalysis />   : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
