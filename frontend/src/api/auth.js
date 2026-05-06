import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
});

// 1. 매개변수에 nm과 email을 추가해야 합니다.
export const signup = (id, pw, nm, email) => {
  return API.post('/auth/signup', {
    id: id,      // 백엔드 DTO의 private String id와 매칭
    pw: pw,      // 백엔드 DTO의 private String pw와 매칭
    nm: nm,      // 백엔드 DTO의 private String nm와 매칭
    email: email // 중요! userEmail이 아니라 'email'로 맞춰야 함
  });
};

// 로그인 요청
export const login = (id, pw) => {
  return API.post('/auth/login', { id: id, pw: pw });
};

// 내 정보 가져오기
export const getMyInfo = () => {
  const token = localStorage.getItem('token');
  return API.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}` // JWT 토큰 전달
    }
  });
};