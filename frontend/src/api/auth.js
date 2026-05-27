import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';

export const tokenStorage = {
  getAccess:  ()       => localStorage.getItem('accessToken'),
  getRefresh: ()       => localStorage.getItem('refreshToken'),
  save: (tokens) => {
    localStorage.setItem('accessToken',  tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

export const API = axios.create({ baseURL: BASE_URL });

// 요청 interceptor: Authorization 헤더 자동 삽입
API.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// 응답 interceptor: 401 또는 500(토큰 만료 메시지) 시 자동 재발급
let isRefreshing = false;
let pendingQueue = [];

const processPending = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  pendingQueue = [];
};

const shouldRefresh = (error) => {
  const status = error.response?.status;
  // 401: 표준 미인증
  // 500 + 만료 메시지: communityservice 등이 JwtUtil 예외를 500으로 내보내는 경우
  if (status === 401) return true;
  if (status === 500) {
    const msg = error.response?.data?.message || JSON.stringify(error.response?.data || '');
    return msg.includes('만료') || msg.includes('expired') || msg.includes('Access Token');
  }
  return false;
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (shouldRefresh(error) && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers['Authorization'] = `Bearer ${token}`;
          return API(original);
        });
      }

      isRefreshing = true;
      const refreshToken = tokenStorage.getRefresh();

      if (!refreshToken) {
        tokenStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        tokenStorage.save(data);
        processPending(null, data.accessToken);
        original.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return API(original);
      } catch (refreshError) {
        processPending(refreshError);
        tokenStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const signup  = (id, pw, nm, email) =>
  axios.post(`${BASE_URL}/auth/signup`, { id, pw, nm, email });

export const login = async (id, pw) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, { id, pw });
  tokenStorage.save(response.data);
  return response;
};

export const logout = async () => {
  try { await API.post('/auth/logout'); }
  finally { tokenStorage.clear(); }
};

export const getMyInfo = () => API.get('/auth/me');
