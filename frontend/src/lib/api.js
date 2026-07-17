import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
export const API_BASE = `${BACKEND_URL}/api`;
export const BACKEND = BACKEND_URL;

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("haven_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401 && !window.location.pathname.startsWith("/login")) {
      localStorage.removeItem("haven_token");
      localStorage.removeItem("haven_user");
    }
    return Promise.reject(err);
  }
);

export default api;
