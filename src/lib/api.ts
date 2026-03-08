import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const AUTH_TOKEN_KEY = 'niter_access_token';
export const REFRESH_TOKEN_KEY = 'niter_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request
axiosInstance.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Unwrap axios error message
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearTokens();
      // Only redirect if not already on login/landing page to avoid loops
      if (!window.location.pathname.startsWith('/login') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      'Request failed';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  }
);

type Params = Record<string, string | number | boolean | string[] | undefined | null>;

export const api = {
  get: <T>(path: string, params?: Params) =>
    axiosInstance.get<T>(path, { params }).then(r => r.data),

  post: <T>(path: string, body?: unknown, params?: Params) =>
    axiosInstance.post<T>(path, body, { params }).then(r => r.data),

  put: <T>(path: string, body?: unknown) =>
    axiosInstance.put<T>(path, body).then(r => r.data),

  patch: <T>(path: string, body?: unknown) =>
    axiosInstance.patch<T>(path, body).then(r => r.data),

  delete: <T>(path: string) =>
    axiosInstance.delete<T>(path).then(r => r.data),
};
