import axios from "axios";

const RAW_BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? process.env.BACKEND_API_URL ?? "";
const BACKEND_API_URL = RAW_BACKEND_API_URL.replace(/\/+$/, "");

export const getAxiosInstace = () => {
  const instance = axios.create({
    baseURL: BACKEND_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Attach the stored Bearer token to every request
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // Clear stale credentials on 401 so downstream guards can redirect
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && typeof window !== "undefined") {
        window.localStorage.removeItem("auth_token");
        window.localStorage.removeItem("auth_user");
      }
      return Promise.reject(error);
    },
  );

  return instance;
};
