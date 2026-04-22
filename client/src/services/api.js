import axios from "axios";

// ✅ Use environment variable ONLY (no localhost fallback in production)
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ✅ Attach token automatically if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;