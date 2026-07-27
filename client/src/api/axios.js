import axios from "axios";

export const API_URL = import.meta.env.PROD
  ? "https://ahsin-dev-backend.onrender.com"
  : "http://localhost:5000";

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
