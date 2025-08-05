// Arquivo: frontend/src/components/OcorrenciaList.js

import React, { useState, useEffect } from 'react';
import api from '../../src/api'; // Importa a nossa configuração do axios

function OcorrenciaList() {
  // Estado para armazenar a lista de ocorrências
  const [ocorrencias, setOcorrencias] = useState([]);
  // Estado para mensagens de carregamento ou erro
  const [loading, setLoading] = useState(true);

  // useEffect é executado quando o componente é montado
  useEffect(() => {
    // Função assíncrona para buscar os dados
    const fetchOcorrencias = async () => {
      try {
        // Usa o 'api.get' para buscar os dados do endpoint que criámos
        const response = await api.get('ocorrencias/');
        setOcorrencias(response.data); // Armazena a lista no estado
        setLoading(false); // Para de carregar
      } catch (error) {
        console.error("Erro ao buscar ocorrências:", error);
        setLoading(false); // Para de carregar mesmo se der erro
      }
    };

    fetchOcorrencias();
  }, []); // O array vazio [] significa que este efeito só roda uma vez

  // Se ainda estiver a carregar, exibe uma mensagem
  if (loading) {
    return <p>A carregar ocorrências...</p>;
  }

  return (
    <div className="list-container">
      <h2>Ocorrências Registadas</h2>
      {ocorrencias.length === 0 ? (
        <p>Nenhuma ocorrência registada.</p>
      ) : (
        <ul className="ocorrencia-list">
          {ocorrencias.map(ocorrencia => (
            <li key={ocorrencia.id} className="ocorrencia-item">
              <strong>{ocorrencia.tipo_ocorrencia.replace(/([A-Z])/g, ' $1').trim()}</strong>
              <p>{new Date(ocorrencia.data_fato).toLocaleString('pt-BR')}</p>
              <p>{ocorrencia.descricao_fato}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OcorrenciaList;