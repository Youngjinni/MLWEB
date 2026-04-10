import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // 👈 페이지 이동을 감지하기 위해 추가

  // 페이지 이동이 일어날 때마다 토큰 확인 (로그인 직후 반영을 위해)
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]); // 👈 경로가 바뀔 때마다 체크합니다.

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      alert("로그아웃 되었습니다.");
      // location.href 보다는 navigate를 쓰고 상태를 바꾸는 게 리액트답지만,
      // 확실한 초기화를 위해 href를 쓰신다면 유지해도 좋습니다.
      window.location.href = '/';
    }
  };

  return (
      <nav style={{ padding: '15px 20px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to="/" style={{ fontSize: '1.2rem', fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>ML Web</Link>

        <div style={{ flex: 1 }}>
          <Link to="/posts" style={{ marginLeft: '10px', textDecoration: 'none', color: '#666' }}>커뮤니티</Link>
        </div>

        {isLoggedIn ? (
            <>
              {/* 분석 메뉴: 로그인 시에만 노출 */}
              <Link to="/analysis/lstm" style={{ fontWeight: 'bold', color: '#4a90e2', textDecoration: 'none' }}>
                📈 LSTM 분석
              </Link>
              <Link to="/analysis/rf" style={{ fontWeight: 'bold', color: '#2ecc71', textDecoration: 'none' }}>
                🌲 RF 분석
              </Link>
              <Link to="/profile" style={{ textDecoration: 'none', color: '#666' }}>마이페이지</Link>
              <button
                  onClick={handleLogout}
                  style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff' }}
              >
                로그아웃
              </button>
            </>
        ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: '#666' }}>로그인</Link>
              <Link to="/signup" style={{ textDecoration: 'none', color: '#666' }}>회원가입</Link>
            </>
        )}
      </nav>
  );
};

export default Header;