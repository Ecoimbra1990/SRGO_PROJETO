// Arquivo: frontend/src/components/OcorrenciaForm.js

import React, { useState } from 'react';
import api from '../../src/api'; // Importa nossa configuração da API

function OcorrenciaForm() {
  // Estado para armazenar todos os dados do formulário
  const [formData, setFormData] = useState({
    tipo_ocorrencia: 'Homicidio',
    data_fato: '',
    descricao_fato: '',
    endereco_localizacao: '',
    fonte_informacao: 'PMBA',
    caderno_informativo: 'Seguranca Publica'
  });

  // Estado para mensagens de sucesso ou erro
  const [message, setMessage] = useState('');

  // Função para atualizar o estado quando um campo do formulário muda
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Função que será chamada quando o formulário for enviado
  // Dentro do arquivo OcorrenciaForm.js

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Enviando ocorrência...');

    try {
      // A linha abaixo agora está ATIVA e irá enviar os dados de verdade!
      const response = await api.post('ocorrencias/', formData);

      console.log("Resposta da API:", response.data);
      setMessage('Ocorrência registrada com sucesso!');

      // Limpar o formulário após o sucesso
      setFormData({
        tipo_ocorrencia: 'Homicidio',
        data_fato: '',
        descricao_fato: '',
        endereco_localizacao: '',
        fonte_informacao: 'PMBA',
        caderno_informativo: 'Seguranca Publica'
      });

    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error.response.data);
      setMessage('Falha ao registrar ocorrência. Verifique o console.');
    }
  };

  return (
    <div className="form-container">
      <h2>Registrar Nova Ocorrência</h2>

      {/* Exibe a mensagem de status */}
      {message && <p className="status-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tipo_ocorrencia">Tipo de Ocorrência:</label>
          <select
            id="tipo_ocorrencia"
            name="tipo_ocorrencia" // Adicionado o atributo 'name'
            value={formData.tipo_ocorrencia}
            onChange={handleChange}
          >
            <option value="Homicidio">Homicídio Doloso (CVLI)</option>
            <option value="Resistencia">Auto de Resistência</option>
            <option value="Refem">Crise com Refém</option>
            <option value="Banco">Assalto a Banco</option>
            <option value="Produtividade">Ação de Produtividade</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="data_fato">Data e Hora do Fato:</label>
          <input
            type="datetime-local"
            id="data_fato"
            name="data_fato" // Adicionado o atributo 'name'
            value={formData.data_fato}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descricao_fato">Descrição do Fato:</label>
          <textarea
            id="descricao_fato"
            name="descricao_fato" // Adicionado o atributo 'name'
            rows="5"
            value={formData.descricao_fato}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="endereco_localizacao">Endereço/Localidade:</label>
          <input
            type="text"
            id="endereco_localizacao"
            name="endereco_localizacao"
            value={formData.endereco_localizacao}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn">Salvar Ocorrência</button>
      </form>
    </div>
  );
}

export default OcorrenciaForm;