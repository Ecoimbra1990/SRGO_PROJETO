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

    useEffect(() => {
        if (armaSearchTerm.length < 2) {
            setArmaSuggestions([]);
            return;
        }
        const handler = setTimeout(async () => {
            try {
                const response = await getModelosArma(armaSearchTerm);
                setArmaSuggestions(response.data || []);
            } catch (error) {
                console.error("Erro ao buscar modelos de arma:", error);
                setArmaSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [armaSearchTerm]);

    const handleToggleSecaoArmas = (e) => {
        const { checked } = e.target;
        setMostrarSecaoArmas(checked);
        if (!checked) {
            setOcorrencia(prev => ({ ...prev, armas_apreendidas: [] }));
        }
    };

    const handleArmaChange = (index, e) => {
        const { name, value } = e.target;
        const novasArmas = [...ocorrencia.armas_apreendidas];
        novasArmas[index][name] = value;
        setOcorrencia(prev => ({ ...prev, armas_apreendidas: novasArmas }));
        if (name === 'modelo') {
            setArmaSearchTerm(value);
            setActiveSuggestionIndex(index);
        }
    };

    const handleArmaSuggestionClick = (suggestion) => {
        const novasArmas = [...ocorrencia.armas_apreendidas];
        const armaAtual = novasArmas[activeSuggestionIndex];
        
        novasArmas[activeSuggestionIndex] = {
            ...armaAtual,
            modelo_catalogado: suggestion.id,
            modelo: suggestion.modelo,
            tipo: suggestion.tipo,
            marca: suggestion.marca,
            calibre: suggestion.calibre,
        };
        setOcorrencia(prev => ({ ...prev, armas_apreendidas: novasArmas }));
        setArmaSuggestions([]);
        setActiveSuggestionIndex(null);
        setArmaSearchTerm('');
    };

    const adicionarArma = () => {
        setOcorrencia(prev => ({
            ...prev,
            armas_apreendidas: [...prev.armas_apreendidas, { tipo: 'FOGO', marca: '', modelo: '', calibre: '', numero_serie: '', observacoes: '' }]
        }));
    };

    const removerArma = (index) => {
        const novasArmas = [...ocorrencia.armas_apreendidas];
        novasArmas.splice(index, 1);
        setOcorrencia(prev => ({ ...prev, armas_apreendidas: novasArmas }));
    };

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
    
    // ... (outros handlers como handleCepBlur, handleSuggestionClick, etc.)

    if (loading) {
        return <p>Carregando formulário...</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form" autoComplete="off">
            <h2>{ocorrencia.id ? 'Editar Ocorrência' : 'Registrar Nova Ocorrência'}</h2>

            {/* Secção de Informações Gerais */}
            <div className="form-section">
                <h3>Informações Gerais</h3>
                {/* ... (campos de data, tipo, caderno, etc.) ... */}
            </div>

            {/* Secção de Localização */}
            <div className="form-section">
                <h3>Localização</h3>
                {/* ... (campos de UF, cidade, logradouro, CEP, lat/lon, etc.) ... */}
            </div>

            {/* Secção de Armas Condicional */}
            <div className="form-section">
                <div className="toggle-section">
                    <label htmlFor="toggle-armas">Houve apreensão de armas?</label>
                    <input 
                        type="checkbox" 
                        id="toggle-armas"
                        checked={mostrarSecaoArmas}
                        onChange={handleToggleSecaoArmas}
                    />
                </div>

                {mostrarSecaoArmas && (
                    <div className="conditional-content">
                        <h3>Armas Apreendidas</h3>
                        {ocorrencia.armas_apreendidas.map((arma, index) => (
                            <div key={index} className="dynamic-list-item">
                                <div className="autocomplete-container">
                                    <input type="text" name="modelo" value={arma.modelo} onChange={(e) => handleArmaChange(index, e)} placeholder="Modelo da Arma (digite para buscar)" required />
                                    {armaSuggestions.length > 0 && activeSuggestionIndex === index && (
                                        <ul className="suggestions-list">
                                            {armaSuggestions.map((sug) => (
                                                <li key={sug.id} onClick={() => handleArmaSuggestionClick(sug)}>
                                                    <strong>{sug.modelo}</strong> ({sug.marca || 'N/A'} - {sug.calibre || 'N/A'})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                    <select name="tipo" value={arma.tipo} onChange={(e) => handleArmaChange(index, e)}>
                                        <option value="FOGO">Arma de Fogo</option>
                                        <option value="BRANCA">Arma Branca</option>
                                        <option value="SIMULACRO">Simulacro</option>
                                        <option value="ARTESANAL">Artesanal</option>
                                        <option value="OUTRO">Outro</option>
                                    </select>
                                    <input type="text" name="marca" value={arma.marca} onChange={(e) => handleArmaChange(index, e)} placeholder="Marca" />
                                    <input type="text" name="calibre" value={arma.calibre} onChange={(e) => handleArmaChange(index, e)} placeholder="Calibre" />
                                </div>
                                <input type="text" name="numero_serie" value={arma.numero_serie} onChange={(e) => handleArmaChange(index, e)} placeholder="Número de Série" style={{marginTop: '10px'}} />
                                <textarea name="observacoes" value={arma.observacoes} onChange={(e) => handleArmaChange(index, e)} placeholder="Observações" />
                                <button type="button" className="remove-button" onClick={() => removerArma(index)}>Remover Arma</button>
                            </div>
                        ))}
                        <button type="button" className="add-button" onClick={adicionarArma}>+ Adicionar Arma</button>
                    </div>
                )}
            </div>

            {/* Secção de Pessoas Envolvidas */}
            <div className="form-section">
                <h3>Pessoas Envolvidas</h3>
                {/* ... (código para adicionar/remover pessoas) ... */}
            </div>

            <button type="submit" className="submit-button">Salvar Ocorrência</button>
        </form>
    );
};

export default OcorrenciaForm;
