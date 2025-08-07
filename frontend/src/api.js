import axios from 'axios';

// A URL base é definida pela variável de ambiente no Render.
// Se não estiver definida, usa o endereço local como fallback.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_BASE_URL
});

api.interceptors.request.use(async config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// --- Auth ---
// Os caminhos agora começam com /api/, que será combinado com a URL base.
export const loginUser = (credentials) => api.post('/api/token/', credentials);
export const registerUser = (userData) => api.post('/api/register/', userData);

// --- Ocorrências ---
export const getOcorrencias = (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.id) params.append('id', filters.id);
    if (filters.opm_area) params.append('opm_area', filters.opm_area);
    if (filters.bairro) params.append('search', filters.bairro); 
    if (filters.tipo_ocorrencia) params.append('tipo_ocorrencia', filters.tipo_ocorrencia);
    if (filters.ano) params.append('data_fato__year', filters.ano);
    if (filters.mes) params.append('data_fato__month', filters.mes);
    
    return api.get('/api/ocorrencias/', { params });
};
export const getOcorrencia = (id) => api.get(`/api/ocorrencias/${id}/`);
export const createOcorrencia = (ocorrencia) => api.post('/api/ocorrencias/', ocorrencia);
export const updateOcorrencia = (id, ocorrencia) => api.put(`/api/ocorrencias/${id}/`, ocorrencia);
export const deleteOcorrencia = (id) => api.delete(`/api/ocorrencias/${id}/`);

// --- Lookups (Dados de Apoio) ---
export const getOrganizacoes = () => api.get('/api/organizacoes/');
export const getTiposOcorrencia = () => api.get('/api/tipos-ocorrencia/');
export const getCadernos = () => api.get('/api/cadernos/');
export const getOPMs = () => api.get('/api/opms/');
export const getModelosArma = (search = '') => api.get(`/api/modelos-arma/?search=${search}`);

export default api;
