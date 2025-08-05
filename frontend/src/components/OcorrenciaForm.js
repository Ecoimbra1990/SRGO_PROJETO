// Arquivo: frontend/src/components/OcorrenciaForm.js
// VERSÃO CORRIGIDA E SINCRONIZADA

import React, { useState } from 'react';
import api from '../api';

function OcorrenciaForm({ onOcorrenciaSalva }) { // Recebe a função como propriedade
  const [formData, setFormData] = useState({
    tipo_ocorrencia: 'Homicidio',
    data_fato: '',
    descricao_fato: '',
    endereco_localizacao: '',
    fonte_informacao: 'PMBA',
    caderno_informativo: 'Seguranca Publica'
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('A enviar ocorrência...');
    try {
      const response = await api.post('ocorrencias/', formData);
      console.log("Resposta da API:", response.data);
      setMessage('Ocorrência registada com sucesso!');
      onOcorrenciaSalva(); // <<< CHAMA A FUNÇÃO PARA ATUALIZAR A LISTA

      // Limpa o formulário
      setFormData({
        tipo_ocorrencia: 'Homicidio', data_fato: '', descricao_fato: '',
        endereco_localizacao: '', fonte_informacao: 'PMBA', caderno_informativo: 'Seguranca Publica'
      });
    } catch (error) {
      console.error("Erro ao registar ocorrência:", error.response?.data || error.message);
      setMessage('Falha ao registar ocorrência. Verifique o console.');
    }
  };

  return (
    <div className="form-container">
      <h2>Registar Nova Ocorrência</h2>
      {message && <p className="status-message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tipo_ocorrencia">Tipo de Ocorrência:</label>
          <select id="tipo_ocorrencia" name="tipo_ocorrencia" value={formData.tipo_ocorrencia} onChange={handleChange}>
            <option value="Homicidio">Homicídio Doloso (CVLI)</option>
            <option value="Resistencia">Auto de Resistência</option>
            <option value="Refem">Crise com Refém</option>
            <option value="Banco">Assalto a Banco</option>
            <option value="Produtividade">Ação de Produtividade</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="data_fato">Data e Hora do Fato:</label>
          <input type="datetime-local" id="data_fato" name="data_fato" value={formData.data_fato} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="descricao_fato">Descrição do Fato:</label>
          <textarea id="descricao_fato" name="descricao_fato" rows="5" value={formData.descricao_fato} onChange={handleChange} required></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="endereco_localizacao">Endereço/Localidade:</label>
          <input type="text" id="endereco_localizacao" name="endereco_localizacao" value={formData.endereco_localizacao} onChange={handleChange} />
        </div>
        <button type="submit" className="submit-btn">Salvar Ocorrência</button>
      </form>
    </div>
  );
}

export default OcorrenciaForm;