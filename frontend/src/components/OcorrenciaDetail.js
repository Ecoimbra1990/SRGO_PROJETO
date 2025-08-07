import React, { useState, useEffect } from 'react';
import { getOcorrencia } from '../api';
import './OcorrenciaDetail.css';

const OcorrenciaDetail = ({ ocorrenciaId }) => {
    const [ocorrencia, setOcorrencia] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOcorrencia = async () => {
            if (!ocorrenciaId) return;
            try {
                setLoading(true);
                const response = await getOcorrencia(ocorrenciaId);
                setOcorrencia(response.data);
            } catch (error) {
                console.error("Erro ao buscar detalhes da ocorrência:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOcorrencia();
    }, [ocorrenciaId]);

    if (loading) return <p>Carregando detalhes...</p>;
    if (!ocorrencia) return <p>Selecione uma ocorrência para ver os detalhes.</p>;

    return (
        <div className="detail-container">
            <h2>Detalhes da Ocorrência</h2>

            {/* ... (Cards de Informações Gerais e Localização) ... */}

            {ocorrencia.armas_apreendidas && ocorrencia.armas_apreendidas.length > 0 && (
                <div className="detail-card">
                    <h3>Armas Apreendidas</h3>
                    {ocorrencia.armas_apreendidas.map((arma, index) => (
                        <div key={index} className="arma-card">
                            <p><strong>Modelo:</strong> {arma.modelo}</p>
                            <p><strong>Tipo:</strong> {arma.tipo}</p>
                            <p><strong>Marca:</strong> {arma.marca || 'N/A'}</p>
                            <p><strong>Calibre:</strong> {arma.calibre || 'N/A'}</p>
                            <p><strong>Nº de Série:</strong> {arma.numero_serie || 'N/A'}</p>
                            <p><strong>Observações:</strong> {arma.observacoes || 'Nenhuma'}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="detail-card">
                <h3>Pessoas Envolvidas</h3>
                {/* ... (código para exibir Pessoas Envolvidas) ... */}
            </div>
        </div>
    );
};

export default OcorrenciaDetail;
