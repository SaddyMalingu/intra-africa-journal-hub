// src/api/axios.js
import axios from "axios";

// Base URL will use environment variable if available, otherwise fallback to localhost:5000
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",  // ⬅️ VERY IMPORTANT for file uploads
  },
});

export default instance;
