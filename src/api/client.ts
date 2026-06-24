import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: inject token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap axios response, handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data as { code: number; msg: string; data: unknown };
    // Check for auth errors in the business-level response
    if (data.code === 500) {
      const authErrors = ['token已过期', '请先登录'];
      if (authErrors.some((e) => data.msg.includes(e))) {
        window.dispatchEvent(new CustomEvent('auth:token-expired'));
      }
    }
    return response;
  },
  (error) => {
    // Network errors
    return Promise.reject(error);
  }
);

export default apiClient;
