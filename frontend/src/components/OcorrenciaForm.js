import React, { useState, useEffect } from 'react';
import api, { getOPMs, getTiposOcorrencia, getOrganizacoes, getCadernos } from '../api';
import './OcorrenciaForm.css';

// Define o estado inicial para uma ocorrência vazia
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
    envolvidos: []
};

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [ocorrencia, setOcorrencia] = useState(initialOcorrenciaState);

    // Estados para os dados dos dropdowns
    const [opms, setOpms] = useState([]);
    const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
    const [organizacoes, setOrganizacoes] = useState([]);
    const [cadernos, setCadernos] = useState([]);
    
    const [addressSuggestions, setAddressSuggestions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [opmsRes, tiposRes, orgsRes, cadernosRes] = await Promise.all([
                    getOPMs(),
                    getTiposOcorrencia(),
                    getOrganizacoes(),
                    getCadernos()
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
            setOcorrencia({
                ...initialOcorrenciaState,
                ...existingOcorrencia,
                data_fato: existingOcorrencia.data_fato ? new Date(existingOcorrencia.data_fato).toISOString().slice(0, 16) : '',
                envolvidos: existingOcorrencia.envolvidos || []
            });
        } else {
            setOcorrencia(initialOcorrenciaState);
        }
    }, [existingOcorrencia]);

    useEffect(() => {
        const logradouro = ocorrencia.logradouro || '';
        if (logradouro.length < 3 || !ocorrencia.cidade || !ocorrencia.uf) {
            setAddressSuggestions([]);
            return;
        }

        const handler = setTimeout(async () => {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${ocorrencia.uf}/${ocorrencia.cidade}/${encodeURIComponent(logradouro)}/json/`);
                const data = await response.json();
                if (data && !data.erro && Array.isArray(data)) {
                    setAddressSuggestions(data);
                } else {
                    setAddressSuggestions([]);
                }
            } catch (error) {
                console.error('Erro ao buscar endereço:', error);
                setAddressSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [ocorrencia.logradouro, ocorrencia.cidade, ocorrencia.uf]);

    // Função para obter coordenadas a partir de um endereço
    const fetchCoordinates = async (address) => {
        try {
            const addressQuery = `${address.logradouro}, ${address.cidade}, ${address.uf}`;
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressQuery)}&format=json&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                return { lat: data[0].lat, lon: data[0].lon };
            }
        } catch (error) {
            console.error('Erro ao obter coordenadas:', error);
        }
        return { lat: 'Não encontrado', lon: 'Não encontrado' };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
    };

    const handleSuggestionClick = async (suggestion) => {
        const addressData = {
            logradouro: suggestion.logradouro,
            bairro: suggestion.bairro,
            cep: suggestion.cep.replace(/\D/g, ''),
            cidade: suggestion.localidade,
            uf: suggestion.uf,
        };
        
        setOcorrencia(prev => ({
            ...prev,
            ...addressData,
            latitude: 'A procurar...', 
            longitude: 'A procurar...'
        }));
        setAddressSuggestions([]);

        const { lat, lon } = await fetchCoordinates({ logradouro: suggestion.logradouro, cidade: suggestion.localidade, uf: suggestion.uf });
        setOcorrencia(prev => ({ ...prev, latitude: lat, longitude: lon }));
    };

    const handleEnvolvidoChange = (index, e) => {
        const { name, value } = e.target;
        const novosEnvolvidos = [...ocorrencia.envolvidos];
        novosEnvolvidos[index][name] = value;
        setOcorrencia(prev => ({ ...prev, envolvidos: novosEnvolvidos }));
    };

    const adicionarEnvolvido = () => {
        setOcorrencia(prev => ({
            ...prev,
            envolvidos: [...prev.envolvidos, { nome: '', tipo_envolvimento: 'SUSPEITO', observacoes: '', organizacao_criminosa: null, procedimentos: [] }]
        }));
    };

    const removerEnvolvido = (index) => {
        const novosEnvolvidos = [...ocorrencia.envolvidos];
        novosEnvolvidos.splice(index, 1);
        setOcorrencia(prev => ({ ...prev, envolvidos: novosEnvolvidos }));
    };

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    const addressData = {
                        logradouro: data.logradouro,
                        bairro: data.bairro,
                        cidade: data.localidade,
                        uf: data.uf
                    };
                    setOcorrencia(prev => ({ ...prev, ...addressData, latitude: 'A procurar...', longitude: 'A procurar...' }));
                    
                    const { lat, lon } = await fetchCoordinates({ logradouro: data.logradouro, cidade: data.localidade, uf: data.uf });
                    setOcorrencia(prev => ({ ...prev, latitude: lat, longitude: lon }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
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

    if (loading) {
        return <p>Carregando formulário...</p>;
    }

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
                <textarea name="evolucao_ocorrencia" value={ocorrencia.evolucao_ocorrencia} onChange={handleInputChange} placeholder="Evolução da Ocorrência" />
                <input type="text" name="fonte_informacao" value={ocorrencia.fonte_informacao} onChange={handleInputChange} placeholder="Fonte da Informação" />
            </div>

            <div className="form-section">
                <h3>Localização</h3>
                <p className="form-note">Preencha UF e Cidade para habilitar a busca por logradouro.</p>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input style={{flex: 1}} type="text" name="uf" value={ocorrencia.uf} onChange={handleInputChange} placeholder="UF" maxLength="2" />
                    <input style={{flex: 3}} type="text" name="cidade" value={ocorrencia.cidade} onChange={handleInputChange} placeholder="Cidade" />
                </div>

                <div className="autocomplete-container">
                    <input
                        type="text"
                        name="logradouro"
                        value={ocorrencia.logradouro || ''}
                        onChange={handleInputChange}
                        placeholder="Digite o Logradouro para buscar..."
                        disabled={!ocorrencia.uf || !ocorrencia.cidade}
                    />
                    {addressSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {addressSuggestions.map((suggestion, index) => (
                                <li key={`${suggestion.cep}-${index}`} onClick={() => handleSuggestionClick(suggestion)}>
                                    <strong>{suggestion.logradouro}</strong>, {suggestion.bairro} - {suggestion.localidade}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <input type="text" name="bairro" value={ocorrencia.bairro} onChange={handleInputChange} placeholder="Bairro" />
                <input type="text" name="cep" value={ocorrencia.cep} onChange={handleInputChange} onBlur={handleCepBlur} placeholder="CEP" />
                
                {/* Campos de Latitude e Longitude */}
                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <input style={{flex: 1}} type="text" name="latitude" value={ocorrencia.latitude} onChange={handleInputChange} placeholder="Latitude" />
                    <input style={{flex: 1}} type="text" name="longitude" value={ocorrencia.longitude} onChange={handleInputChange} placeholder="Longitude" />
                </div>

                 <select name="opm_area" value={ocorrencia.opm_area || ''} onChange={handleInputChange} style={{marginTop: '10px'}}>
                    <option value="">Selecione a OPM da Área</option>
                    {opms.map(opm => (
                        <option key={opm.id} value={opm.id}>{opm.nome}</option>
                    ))}
                </select>
            </div>

            <div className="form-section">
                <h3>Pessoas Envolvidas</h3>
                {ocorrencia.envolvidos.map((envolvido, index) => (
                    <div key={index} className="dynamic-list-item">
                        <input type="text" name="nome" value={envolvido.nome} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Nome Completo" required />
                        <select name="tipo_envolvimento" value={envolvido.tipo_envolvimento} onChange={(e) => handleEnvolvidoChange(index, e)}>
                            <option value="SUSPEITO">Suspeito</option>
                            <option value="VITIMA">Vítima</option>
                            <option value="TESTEMUNHA">Testemunha</option>
                            <option value="AUTOR">Autor</option>
                            <option value="OUTRO">Outro</option>
                        </select>
                         <select name="organizacao_criminosa" value={envolvido.organizacao_criminosa || ''} onChange={(e) => handleEnvolvidoChange(index, e)}>
                            <option value="">Nenhuma Organização</option>
                            {organizacoes.map(org => (
                                <option key={org.id} value={org.id}>{org.nome}</option>
                            ))}
                        </select>
                        <textarea name="observacoes" value={envolvido.observacoes} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Observações" />
                        <button type="button" className="remove-button" onClick={() => removerEnvolvido(index)}>Remover</button>
                    </div>
                ))}
                <button type="button" className="add-button" onClick={adicionarEnvolvido}>+ Adicionar Pessoa</button>
            </div>

            <button type="submit" className="submit-button">Salvar Ocorrência</button>
        </form>
    );
};

export default OcorrenciaForm;
