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

            <div className="detail-card">
                <h3>Informações Gerais</h3>
                <p><strong>Tipo:</strong> {ocorrencia.tipo_ocorrencia_nome}</p>
                <p><strong>Data do Fato:</strong> {new Date(ocorrencia.data_fato).toLocaleString('pt-BR')}</p>
                <p><strong>Descrição:</strong> {ocorrencia.descricao_fato}</p>
                <p><strong>Evolução:</strong> {ocorrencia.evolucao_ocorrencia}</p>
                <p><strong>Fonte:</strong> {ocorrencia.fonte_informacao}</p>
                <p><strong>Caderno:</strong> {ocorrencia.caderno_informativo_nome || 'N/A'}</p>
                <p><strong>Registrado por:</strong> {ocorrencia.usuario_registro_nome_completo}</p>
            </div>

            <div className="detail-card">
                <h3>Localização</h3>
                <p><strong>OPM da Área:</strong> {ocorrencia.opm_area_nome || 'N/A'}</p>
                <p><strong>CEP:</strong> {ocorrencia.cep}</p>
                <p><strong>Logradouro:</strong> {ocorrencia.logradouro}</p>
                <p><strong>Bairro:</strong> {ocorrencia.bairro}</p>
                <p><strong>Cidade/UF:</strong> {ocorrencia.cidade}/{ocorrencia.uf}</p>
                <p><strong>Coordenadas:</strong> Lat: {ocorrencia.latitude}, Lon: {ocorrencia.longitude}</p>
            </div>

            <div className="detail-card">
                <h3>Pessoas Envolvidas</h3>
                {ocorrencia.envolvidos?.length > 0 ? (
                    ocorrencia.envolvidos.map((pessoa, index) => (
                        <div key={index} className="pessoa-card">
                            <p><strong>Nome:</strong> {pessoa.nome}</p>
                            <p><strong>Envolvimento:</strong> {pessoa.tipo_envolvimento}</p>
                            <p><strong>Organização Criminosa:</strong> {pessoa.organizacao_criminosa_nome || 'Nenhuma'}</p>
                            <p><strong>Documento:</strong> {pessoa.documento}</p>
                            <p><strong>Observações:</strong> {pessoa.observacoes}</p>
                            
                            {pessoa.procedimentos?.length > 0 && (
                                <div className="procedimento-section">
                                    <h4>Procedimentos Penais</h4>
                                    {pessoa.procedimentos.map((proc, pIndex) => (
                                        <div key={pIndex} className="procedimento-card">
                                            <p><strong>Nº Processo:</strong> {proc.numero_processo}</p>
                                            <p><strong>Vara/Tribunal:</strong> {proc.vara_tribunal}</p>
                                            <p><strong>Status:</strong> {proc.status}</p>
                                            <p><strong>Detalhes:</strong> {proc.detalhes}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Nenhuma pessoa envolvida registrada.</p>
                )}
            </div>
        </div>
    );
};

export default OcorrenciaDetail;
