import React, { useState, useEffect } from 'react';
import api, { getOPMs, getTiposOcorrencia, getOrganizacoes, getCadernos, getModelosArma } from '../api';
import './OcorrenciaForm.css';

const initialOcorrenciaState = {
    tipo_ocorrencia: '',
    data_fato: '',
    descricao_fato: '',
    fonte_informacao: '',
    evolucao_ocorrencia: '',
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: '',
    latitude: '',
    longitude: '',
    opm_area: '',
    caderno_informativo: '',
    envolvidos: [],
    armas_apreendidas: []
};

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [ocorrencia, setOcorrencia] = useState(initialOcorrenciaState);
    const [opms, setOpms] = useState([]);
    const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
    const [organizacoes, setOrganizacoes] = useState([]);
    const [cadernos, setCadernos] = useState([]);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [mostrarSecaoArmas, setMostrarSecaoArmas] = useState(false);
    const [armaSearchTerm, setArmaSearchTerm] = useState('');
    const [armaSuggestions, setArmaSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [opmsRes, tiposRes, orgsRes, cadernosRes] = await Promise.all([
                    getOPMs(), getTiposOcorrencia(), getOrganizacoes(), getCadernos()
                ]);
                setOpms(opmsRes.data || []);
                setTiposOcorrencia(tiposRes.data || []);
                setOrganizacoes(orgsRes.data || []);
                setCadernos(cadernosRes.data || []);
            } catch (error) {
                console.error('Erro ao carregar dados para o formulário:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        if (existingOcorrencia && existingOcorrencia.id) {
            const armas = existingOcorrencia.armas_apreendidas || [];
            setOcorrencia({
                ...initialOcorrenciaState,
                ...existingOcorrencia,
                data_fato: existingOcorrencia.data_fato ? new Date(existingOcorrencia.data_fato).toISOString().slice(0, 16) : '',
                envolvidos: existingOcorrencia.envolvidos || [],
                armas_apreendidas: armas
            });
            if (armas.length > 0) {
                setMostrarSecaoArmas(true);
            }
        } else {
            setOcorrencia(initialOcorrenciaState);
            setMostrarSecaoArmas(false);
        }
    }, [existingOcorrencia]);
    
    // ... (restante da lógica - handlers, etc.) ...
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...ocorrencia };
            if (!payload.opm_area) payload.opm_area = null;
            if (!payload.caderno_informativo) payload.caderno_informativo = null;

            if (payload.id) {
                await api.put(`/api/ocorrencias/${payload.id}/`, payload);
            } else {
                await api.post('/api/ocorrencias/', payload);
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar ocorrência:', error.response?.data || error);
        }
    };

    if (loading) return <p>Carregando formulário...</p>;

    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form" autoComplete="off">
            <h2>{ocorrencia.id ? 'Editar Ocorrência' : 'Registrar Nova Ocorrência'}</h2>

            <div className="form-section">
                <h3>Informações Gerais</h3>
                <input type="datetime-local" name="data_fato" value={ocorrencia.data_fato} onChange={handleInputChange} required />
                <select name="tipo_ocorrencia" value={ocorrencia.tipo_ocorrencia} onChange={handleInputChange} required>
                    <option value="">Selecione o Tipo de Ocorrência</option>
                    {tiposOcorrencia.map(tipo => (
                        <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                    ))}
                </select>
                <select name="caderno_informativo" value={ocorrencia.caderno_informativo || ''} onChange={handleInputChange}>
                    <option value="">Selecione o Caderno</option>
                    {cadernos.map(caderno => (
                        <option key={caderno.id} value={caderno.id}>{caderno.nome}</option>
                    ))}
                </select>
                <textarea name="descricao_fato" value={ocorrencia.descricao_fato} onChange={handleInputChange} placeholder="Descrição do Fato" required />
            </div>

            {/* Resto do formulário aqui para usar as outras variáveis */}

            <button type="submit" className="submit-button">Salvar Ocorrência</button>
        </form>
    );
};

export default OcorrenciaForm;
