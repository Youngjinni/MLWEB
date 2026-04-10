import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Community from './pages/Community';
import PostWrite from './pages/PostWrite';
import PostDetail from './pages/PostDetail';
// --- ⭐ 추가된 분석 컴포넌트 임포트 ---
import LstmAnalysis from './pages/LstmAnalysis'; // 파일 경로가 pages라면 수정
import RfAnalysis from './pages/RfAnalysis';

function App() {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Router>
            <Header />

            <div style={{ padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<h1>mlweb</h1>} />

                    <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
                    <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/" />} />
                    <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="/posts" element={isAuthenticated ? <Community /> : <Navigate to="/login" />} />
                    <Route path="/posts/write" element={isAuthenticated ? <PostWrite /> : <Navigate to="/login" />} />
                    <Route path="/posts/:id" element={isAuthenticated ? <PostDetail /> : <Navigate to="/login" />} />

                    {/* --- ⭐ 여기부터 분석 경로 추가 --- */}
                    <Route
                        path="/analysis/lstm"
                        element={isAuthenticated ? <LstmAnalysis /> : <Navigate to="/login" />}
                    />
                    <Route
                        path="/analysis/rf"
                        element={isAuthenticated ? <RfAnalysis /> : <Navigate to="/login" />}
                    />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;