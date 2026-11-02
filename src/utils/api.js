// Backend base URL (set VITE_API_URL in .env). The backend must allow this app's origin via CORS.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiUrl = (path) => `${API_URL}${path}`;
