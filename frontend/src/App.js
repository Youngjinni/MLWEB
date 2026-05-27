import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Community from './pages/Community';
import PostWrite from './pages/PostWrite';
import PostDetail from './pages/PostDetail';
import LstmAnalysis from './pages/LstmAnalysis';
import RfAnalysis from './pages/RfAnalysis';
import Payment from './pages/Payment';
import PaymentResult from './pages/PaymentResult';
import { tokenStorage } from './api/auth';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!tokenStorage.getAccess());

  useEffect(() => {
    const sync = () => setIsAuthenticated(!!tokenStorage.getAccess());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return (
    <Router>
      <Header onAuthChange={setIsAuthenticated} />
      <div>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/login"       element={!isAuthenticated ? <Login onLogin={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} />
          <Route path="/signup"      element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
          <Route path="/profile"     element={isAuthenticated ? <Profile />     : <Navigate to="/login" />} />
          <Route path="/posts"       element={isAuthenticated ? <Community />   : <Navigate to="/login" />} />
          <Route path="/posts/write" element={isAuthenticated ? <PostWrite />   : <Navigate to="/login" />} />
          <Route path="/posts/:id"   element={isAuthenticated ? <PostDetail />  : <Navigate to="/login" />} />
          <Route path="/analysis/lstm" element={isAuthenticated ? <LstmAnalysis /> : <Navigate to="/login" />} />
          <Route path="/analysis/rf"   element={isAuthenticated ? <RfAnalysis />   : <Navigate to="/login" />} />
          <Route path="/payment"         element={isAuthenticated ? <Payment />                  : <Navigate to="/login" />} />
          <Route path="/payment/success" element={isAuthenticated ? <PaymentResult success={true} />  : <Navigate to="/login" />} />
          <Route path="/payment/fail"    element={isAuthenticated ? <PaymentResult success={false} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
