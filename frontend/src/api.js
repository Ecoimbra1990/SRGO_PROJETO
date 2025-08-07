// frontend/src/api.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(async config => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, error => Promise.reject(error));

// Autenticação
export const loginUser = (credentials) => api.post('/token/', credentials);
export const registerUser = (userData) => api.post('/register/', userData);

// Ocorrências
export const getOcorrencias = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.id) params.append('id', filters.id);
    if (filters.opm_area) params.append('opm_area', filters.opm_area);
    if (filters.bairro) params.append('bairro__icontains', filters.bairro);
    if (filters.tipo_ocorrencia) params.append('tipo_ocorrencia', filters.tipo_ocorrencia);
    if (filters.ano) params.append('data_fato__year', filters.ano);
    if (filters.mes) params.append('data_fato__month', filters.mes);
    
    return api.get('/ocorrencias/', { params });
};
export const getOcorrencia = (id) => api.get(`/ocorrencias/${id}/`);
export const createOcorrencia = (ocorrencia) => api.post('/ocorrencias/', ocorrencia);
export const updateOcorrencia = (id, ocorrencia) => api.put(`/ocorrencias/${id}/`, ocorrencia);
export const deleteOcorrencia = (id) => api.delete(`/ocorrencias/${id}/`);

// Lookups (dados de apoio)
export const getOrganizacoes = () => api.get('/organizacoes/');
export const getTiposOcorrencia = () => api.get('/tipos-ocorrencia/');
export const getCadernos = () => api.get('/cadernos/');
export const getOPMs = () => api.get('/opms/'); // <-- Adicionado

export default api;
