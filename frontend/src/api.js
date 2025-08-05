import axios from 'axios';

// A URL base da API deve apontar para o endpoint /api.
// Certifique-se de que a variável de ambiente REACT_APP_API_URL no Render
// está definida como https://srgo-backend.onrender.com/api
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor para adicionar o token de autenticação em todas as requisições
// que usam a instância 'api'.
api.interceptors.request.use(async config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// --- Funções de Autenticação ---
// Usam a instância 'api' para herdar a baseURL correta.

export const loginUser = (credentials) => {
    // O caminho é relativo à baseURL, resultando em POST para /api/token/
    return api.post('/token/', credentials);
};

export const registerUser = (userData) => {
    // O caminho é relativo à baseURL, resultando em POST para /api/register/
    return api.post('/register/', userData);
};


// --- Funções para Ocorrências ---
// Já usavam a instância 'api' e continuam a funcionar como esperado.

export const getOcorrencias = () => {
    return api.get('/ocorrencias/');
};

export const getOcorrencia = (id) => {
    return api.get(`/ocorrencias/${id}/`);
};

export const createOcorrencia = (ocorrencia) => {
    return api.post('/ocorrencias/', ocorrencia);
};

export const updateOcorrencia = (id, ocorrencia) => {
    return api.put(`/ocorrencias/${id}/`, ocorrencia);
};

export const deleteOcorrencia = (id) => {
    return api.delete(`/ocorrencias/${id}/`);
};

export default api;
