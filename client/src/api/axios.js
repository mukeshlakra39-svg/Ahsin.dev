import axios from "axios";

const API_URL = import.meta.env.PROD
  ? "https://ahsin-dev-backend.onrender.com/api"
  : "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
