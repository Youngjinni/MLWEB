import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 페이지가 로드될 때나 토큰이 바뀔 때 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // 토큰 삭제
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    window.location.href = '/';
    navigate('/'); // 메인으로 이동
  };

  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <Link href="/">홈</Link> |

      {isLoggedIn ? (
        // 로그인 되었을 때 보여줄 메뉴
        <>
          <Link to="/profile" style={{ marginLeft: '10px' }}>마이페이지</Link>
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>로그아웃</button>
        </>
      ) : (
        // 로그인 안 되었을 때 보여줄 메뉴
        <>
          <Link to="/login" style={{ marginLeft: '10px' }}>로그인</Link>
          <Link to="/signup" style={{ marginLeft: '10px' }}>회원가입</Link>
        </>
      )}
    </nav>
  );
};

export default Header;