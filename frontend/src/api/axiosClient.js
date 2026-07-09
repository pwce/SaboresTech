import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
});

// Adjunta el token de sesión (PIN validado) a cada request, si existe
axiosClient.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem("sabores_carolina_session");
  if (raw) {
    const { token } = JSON.parse(raw);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
