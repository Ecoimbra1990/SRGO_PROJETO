import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async config => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, error => Promise.reject(error));

// Auth
export const loginUser = (credentials) => api.post('/token/', credentials);
export const registerUser = (userData) => api.post('/register/', userData);

// Ocorrências
export const getOcorrencias = () => api.get('/ocorrencias/');
export const getOcorrencia = (id) => api.get(`/ocorrencias/${id}/`);
export const createOcorrencia = (ocorrencia) => api.post('/ocorrencias/', ocorrencia);
export const updateOcorrencia = (id, ocorrencia) => api.put(`/ocorrencias/${id}/`, ocorrencia);
export const deleteOcorrencia = (id) => api.delete(`/ocorrencias/${id}/`);

// Organizações Criminosas
export const getOrganizacoes = () => api.get('/organizacoes/');

// Tipos de Ocorrência
export const getTiposOcorrencia = () => api.get('/tipos-ocorrencia/');
export const createTipoOcorrencia = (tipo) => api.post('/tipos-ocorrencia/', tipo);

export default api;
