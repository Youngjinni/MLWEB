import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

function App() {
  // 로그인 여부 확인 (토큰 존재 유무)
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      {/* 모든 페이지 상단에 공통으로 노출되는 헤더 */}
      <Header />

      <div style={{ padding: '20px' }}>
        <Routes>
          {/* 메인 페이지 (추후 주식 예측 차트 등을 넣으실 공간) */}
          <Route path="/" element={<h1>J-Capstone 주식 예측 플랫폼</h1>} />

          {/* 로그인/회원가입: 로그인 된 상태라면 메인으로 리다이렉트 */}
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />

          {/* 마이페이지: 로그인 안 된 상태라면 로그인 페이지로 보냄 */}
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;