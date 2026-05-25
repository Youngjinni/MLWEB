import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

const LoginPage = ({ onLogin }) => {
  const [id, setId]         = useState('');
  const [pw, setPw]         = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(id, pw);          // 내부에서 tokenStorage.save() 호출
      if (onLogin) onLogin();
      navigate('/');
    } catch (error) {
      console.error('로그인 실패:', error);
      alert('아이디 또는 비밀번호를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>로그인</h2>
        <p className="auth-sub">계정 정보를 입력하세요</p>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-id">아이디</label>
            <input id="login-id" className="form-control" type="text"
              placeholder="아이디" value={id} onChange={(e) => setId(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="login-pw">비밀번호</label>
            <input id="login-pw" className="form-control" type="password"
              placeholder="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} required />
          </div>
          <button className="primary-button full" type="submit"
            disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="auth-footer">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
