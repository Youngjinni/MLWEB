import React, { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(id, pw);
      const token = response.data; // 서버에서 return한 JwtToken

      // 브라우저 저장소에 'token'이라는 이름으로 저장
      localStorage.setItem('token', token);

      alert("로그인 성공!");
      window.location.href = '/';
      navigate('/'); // 메인 페이지나 대시보드로 이동
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("아이디 또는 비밀번호를 확인하세요.");
    }
  };

  return (
    <form onSubmit={handleLogin}>
    <h2>로그인</h2>
      <input type="text" placeholder="아이디" onChange={(e) => setId(e.target.value)} />
      <input type="password" placeholder="비밀번호" onChange={(e) => setPw(e.target.value)} />
      <button type="submit">로그인</button>
    </form>
  );
};

export default LoginPage;