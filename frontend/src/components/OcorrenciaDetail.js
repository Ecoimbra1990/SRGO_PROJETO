// Arquivo: frontend/src/components/OcorrenciaDetail.js

import React, { useState, useEffect } from 'react';
import api from '../api';

// O componente recebe o ID da ocorrência como uma propriedade (prop)
function OcorrenciaDetail({ ocorrenciaId, onVoltarClick }) {
  const [ocorrencia, setOcorrencia] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOcorrencia = async () => {
      try {
        // Usa a nova rota da API para buscar os detalhes da ocorrência específica
        const response = await api.get(`ocorrencias/${ocorrenciaId}/`);
        setOcorrencia(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar detalhes da ocorrência:", error);
        setLoading(false);
      }
    };

    fetchOcorrencia();
  }, [ocorrenciaId]); // Roda o efeito sempre que o ID da ocorrência mudar

  if (loading) {
    return <p>A carregar detalhes da ocorrência...</p>;
  }

  if (!ocorrencia) {
    return <p>Ocorrência não encontrada.</p>;
  }

  return (
    <div className="detail-container">
      {/* Botão para voltar à lista principal */}
      <button onClick={onVoltarClick} className="back-btn">← Voltar para a lista</button>

      <h2>Detalhes da Ocorrência: {ocorrencia.tipo_ocorrencia.replace(/([A-Z])/g, ' $1').trim()}</h2>
      <p><strong>Data do Fato:</strong> {new Date(ocorrencia.data_fato).toLocaleString('pt-BR')}</p>
      <p><strong>Descrição:</strong> {ocorrencia.descricao_fato}</p>
      <p><strong>Localidade:</strong> {ocorrencia.endereco_localizacao}</p>

      <hr className="divider" />

      <h3>Pessoas Envolvidas</h3>
      {ocorrencia.pessoas_envolvidas.length === 0 ? (
        <p>Nenhuma pessoa envolvida registada para esta ocorrência.</p>
      ) : (
        <ul>
          {ocorrencia.pessoas_envolvidas.map(pessoa => (
            <li key={pessoa.id}>
              <strong>{pessoa.nome_completo}</strong> - {pessoa.tipo_envolvimento}
            </li>
          ))}
        </ul>
      )}
      {/* Futuramente, aqui virá o formulário para adicionar novas pessoas */}
    </div>
  );
}

export default OcorrenciaDetail;