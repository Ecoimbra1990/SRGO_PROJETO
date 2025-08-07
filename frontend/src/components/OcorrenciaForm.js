import React, { useState, useEffect } from 'react';
import api, { getOPMs, getTiposOcorrencia, getOrganizacoes } from '../api';
import './OcorrenciaForm.css';

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    // ... (nenhuma alteração no início do código)
    const [loading, setLoading] = useState(true); // Adicionar estado de loading
    const [ocorrencia, setOcorrencia] = useState({ /* ... */ });
    const [opms, setOpms] = useState([]);
    const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
    const [organizacoes, setOrganizacoes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true); // Inicia o carregamento
                const [opmsRes, tiposRes, orgsRes] = await Promise.all([
                    getOPMs(),
                    getTiposOcorrencia(),
                    getOrganizacoes()
                ]);
                setOpms(opmsRes.data);
                setTiposOcorrencia(tiposRes.data);
                setOrganizacoes(orgsRes.data);
            } catch (error) {
                console.error('Erro ao carregar dados para o formulário:', error);
            } finally {
                setLoading(false); // Finaliza o carregamento
            }
        };
        fetchData();

        if (existingOcorrencia) {
            // ...
        }
    }, [existingOcorrencia]);

    // ... (nenhuma alteração no meio do código)

    if (loading) {
        return <p>Carregando formulário...</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form">
            {/* ... o resto do formulário permanece igual */}
        </form>
    );
};

export default OcorrenciaForm;