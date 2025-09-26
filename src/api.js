import axios from "axios";

const API = axios.create({
  baseURL: "https://dp-c-backend.onrender.com/api",
});

export default API;
