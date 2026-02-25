import axios from "axios";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ?? process.env.BACKEND_API_URL ?? "";

export const getAxiosInstace = () =>
  axios.create({
    baseURL: BACKEND_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
