import axios from 'axios';

// Define a URL base da API. Altere se o seu backend estiver em outro endereço.
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(async config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Funções de Autenticação
export const loginUser = (credentials) => {
    return axios.post(`${API_URL}/token/`, credentials);
};

export const registerUser = (userData) => {
    return axios.post(`${API_URL}/register/`, userData);
};


// Funções para Ocorrências
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
