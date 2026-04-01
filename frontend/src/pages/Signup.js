import React, { useState } from 'react';
import { signup } from '../api/auth';

function Signup() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [nm, setNm] = useState('');      // 이름 추가
  const [email, setEmail] = useState(''); // 이메일 추가

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // 백엔드로 보낼 때 nm과 email도 포함
      const response = await signup(id, pw, nm, email);
      alert(response.data);
      window.location.href = '/Login';
    } catch (error) {
      console.error(error);
      alert("회원가입 실패!");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSignup}>
        <input type="text" placeholder="아이디" value={id} onChange={(e) => setId(e.target.value)} /><br/>
        <input type="password" placeholder="비밀번호" value={pw} onChange={(e) => setPw(e.target.value)} /><br/>
        <input type="text" placeholder="이름" value={nm} onChange={(e) => setNm(e.target.value)} /><br/>
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} /><br/>
        <button type="submit" style={{ marginTop: '10px' }}>가입하기</button>
      </form>
    </div>
  );
}

export default Signup;