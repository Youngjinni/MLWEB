import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';

function Signup() {
  const [id, setId]       = useState('');
  const [pw, setPw]       = useState('');
  const [nm, setNm]       = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await signup(id, pw, nm, email);
      alert(response.data);
      navigate('/login');  // 수정: '/Login' → '/login' (대소문자 버그)
    } catch (error) {
      console.error(error);
      alert('회원가입 실패!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>회원가입</h2>
        <p className="auth-sub">새 계정을 만들어보세요</p>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="signup-id">아이디</label>
            <input id="signup-id" className="form-control" type="text" placeholder="아이디" value={id} onChange={(e) => setId(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="signup-pw">비밀번호</label>
            <input id="signup-pw" className="form-control" type="password" placeholder="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="signup-nm">이름 (닉네임)</label>
            <input id="signup-nm" className="form-control" type="text" placeholder="이름" value={nm} onChange={(e) => setNm(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="signup-email">이메일</label>
            <input id="signup-email" className="form-control" type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="primary-button full" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? '처리 중...' : '가입하기'}
          </button>
        </form>

        <p className="auth-footer">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
