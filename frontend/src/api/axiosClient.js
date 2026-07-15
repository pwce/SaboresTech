// axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

axiosClient.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem("sabores_carolina_session");
  if (raw) {
    const { token } = JSON.parse(raw);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
