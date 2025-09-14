import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
// import Router from "next/router";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// console.log(process.env.PUBLIC_API_BASE_URL);

export default api;
