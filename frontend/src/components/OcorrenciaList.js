import React, { useState, useEffect } from 'react';
import { getOcorrencias } from '../api';
import './OcorrenciaList.css'; // Precisaremos de um CSS específico

const OcorrenciaList = ({ onSelectOcorrencia, onEditOcorrencia, refresh }) => {
    const [ocorrencias, setOcorrencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOcorrencias = async () => {
            try {
                setLoading(true);
                const response = await getOcorrencias();
                setOcorrencias(response.data);
                setError('');
            } catch (err) {
                console.error("Erro ao buscar ocorrências:", err);
                setError('Não foi possível carregar as ocorrências. Verifique sua conexão e tente novamente.');
            } finally {
                setLoading(false);
            }
        };
        fetchOcorrencias();
    }, [refresh]);

    if (loading) {
        return <p>Carregando ocorrências...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="ocorrencia-list-container">
            <h3>Registros de Ocorrências</h3>
            <table className="ocorrencia-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Data do Fato</th>
                        <th>Local</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {ocorrencias.map(ocorrencia => (
                        <tr key={ocorrencia.id} onClick={() => onSelectOcorrencia(ocorrencia.id)}>
                            <td>{ocorrencia.tipo_ocorrencia}</td>
                            <td>{new Date(ocorrencia.data_fato).toLocaleDateString('pt-BR')}</td>
                            <td>{ocorrencia.bairro || 'N/A'} - {ocorrencia.cidade || 'N/A'}</td>
                            <td>
                                <button 
                                    className="edit-button"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Impede que o clique na linha seja acionado
                                        onEditOcorrencia(ocorrencia);
                                    }}
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OcorrenciaList;
