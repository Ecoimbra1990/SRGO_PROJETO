// Importa os módulos necessários do React
import React, { useState } from 'react';

// Este é um componente de formulário para registrar uma nova ocorrência
function OcorrenciaForm() {
  // Estados para armazenar os valores dos campos do formulário
  const [tipoOcorrencia, setTipoOcorrencia] = useState('Homicidio');
  const [dataFato, setDataFato] = useState('');
  const [descricao, setDescricao] = useState('');
  
  // Função que será chamada quando o formulário for enviado
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = { tipoOcorrencia, dataFato, descricao };
    console.log("Enviando dados para a API:", formData);
    // Aqui viria a lógica para enviar os dados para a API do backend
  };

  return (
    <div className="form-container">
      <h2>Registrar Nova Ocorrência</h2>
      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label htmlFor="tipo_ocorrencia">Tipo de Ocorrência:</label>
          <select 
            id="tipo_ocorrencia" 
            value={tipoOcorrencia} 
            onChange={(e) => setTipoOcorrencia(e.target.value)}
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
            value={dataFato}
            onChange={(e) => setDataFato(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição do Fato:</label>
          <textarea 
            id="descricao"
            rows="5"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          ></textarea>
        </div>
        
        {/* Aqui seriam adicionadas as seções para adicionar Pessoas Envolvidas, etc. */}
        
        <button type="submit" className="submit-btn">Salvar Ocorrência</button>
      </form>
    </div>
  );
}

export default OcorrenciaForm;