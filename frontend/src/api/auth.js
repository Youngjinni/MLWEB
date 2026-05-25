import axios from 'axios';

/**
 * 로컬 개발: http://localhost:8080 (게이트웨이 직접)
 * Docker(nginx): '' (상대경로 → nginx가 게이트웨이로 프록시)
 *
 * .env 파일로 환경별 분기:
 *   .env.development → REACT_APP_API_URL=http://localhost:8080
 *   .env.production  → REACT_APP_API_URL=   (비워두면 상대경로)
 */
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

// 응답 interceptor: Access Token 만료 시 자동 재발급
let isRefreshing = false;
let pendingQueue = [];

const processPending = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  pendingQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
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
  try {
    await API.post('/auth/logout');
  } finally {
    tokenStorage.clear();
  }
};

export const getMyInfo = () => API.get('/auth/me');
