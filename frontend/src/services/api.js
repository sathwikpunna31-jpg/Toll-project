import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Enables cookies (JWT token) to be sent automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
