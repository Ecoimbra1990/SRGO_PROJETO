// Arquivo: frontend/src/api.js

import axios from 'axios';

// Cria uma instância do axios com a configuração base
const api = axios.create({
  // A variável de ambiente REACT_APP_API_URL é fornecida pela Render
  // e contém a URL do seu backend (ex: https://srgo-app.onrender.com)
  baseURL: `${process.env.REACT_APP_API_URL}/api/`
});

export default api;