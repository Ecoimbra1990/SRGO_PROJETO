import React, { useState, useEffect } from 'react';
import api, {
    getOPMs,
    getTiposOcorrencia,
    getOrganizacoes,
    getCadernos,
    getModelosArma,
    getLocalidadePorNome
} from '../api';
import './OcorrenciaForm.css';

const initialOcorrenciaState = {
    tipo_ocorrencia: '', data_fato: '', descricao_fato: '', fonte_informacao: '',
    evolucao_ocorrencia: '', cep: '', logradouro: '', bairro: '', cidade: '',
    uf: '', latitude: '', longitude: '', opm_area: '', caderno_informativo: '',
    envolvidos: [], armas_apreendidas: []
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
    const [areaSugerida, setAreaSugerida] = useState(null);

    // ... (useEffect para fetchData - sem alterações)

    // Efeito para buscar modelos de arma
    useEffect(() => {
        if (armaSearchTerm.length < 2 || activeSuggestionIndex === null) {
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
    }, [armaSearchTerm, activeSuggestionIndex]);

    // LÓGICA DO FORMULÁRIO (adição e remoção de campos, etc.)
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
    };

    // --- LÓGICA PARA PESSOAS ENVOLVIDAS (ATUALIZADA) ---
    const handleEnvolvidoChange = (index, e) => {
        const { name, value } = e.target;
        const novosEnvolvidos = [...ocorrencia.envolvidos];
        novosEnvolvidos[index][name] = value;
        setOcorrencia(prev => ({ ...prev, envolvidos: novosEnvolvidos }));
    };
    
    const adicionarEnvolvido = () => {
        setOcorrencia(prev => ({
            ...prev,
            envolvidos: [...prev.envolvidos, { 
                nome: '', tipo_envolvimento: 'SUSPEITO', observacoes: '', 
                organizacao_criminosa: null, procedimentos: [],
                status: 'NAO_APLICAVEL', tipo_documento: 'CPF', documento: '' // Valores iniciais para os novos campos
            }]
        }));
    };

    const removerEnvolvido = (index) => {
        const novosEnvolvidos = [...ocorrencia.envolvidos];
        novosEnvolvidos.splice(index, 1);
        setOcorrencia(prev => ({ ...prev, envolvidos: novosEnvolvidos }));
    };

    // --- LÓGICA PARA ARMAS APREENDIDAS (ATUALIZADA) ---
    const handleArmaChange = (index, e) => {
        const { name, value } = e.target;
        const novasArmas = [...ocorrencia.armas_apreendidas];
        const armaAtual = { ...novasArmas[index] };
        armaAtual[name] = value.toUpperCase();
        
        // Se o utilizador alterar manualmente qualquer campo, removemos o link para o catálogo
        if (['modelo', 'marca', 'calibre', 'tipo', 'especie'].includes(name) && armaAtual.modelo_catalogado) {
            armaAtual.modelo_catalogado = null; 
        }
        novasArmas[index] = armaAtual;
        setOcorrencia(prev => ({ ...prev, armas_apreendidas: novasArmas }));

        if (name === 'modelo') {
            setArmaSearchTerm(value.toUpperCase());
            setActiveSuggestionIndex(index);
        }
    };
    
    const handleArmaSuggestionClick = (suggestion, index) => {
        const novasArmas = [...ocorrencia.armas_apreendidas];
        // Preenche automaticamente todos os campos com base na sugestão
        novasArmas[index] = {
            ...novasArmas[index], // Mantém número de série e observações
            modelo_catalogado: suggestion.id,
            modelo: suggestion.modelo,
            tipo: suggestion.tipo,
            especie: suggestion.especie,
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
            armas_apreendidas: [...prev.armas_apreendidas, { 
                tipo: 'FOGO', especie: 'NAO_DEFINIDA', marca: '', modelo: '', 
                calibre: '', numero_serie: '', observacoes: '' 
            }]
        }));
    };

    const removerArma = (index) => {
        const novasArmas = [...ocorrencia.armas_apreendidas];
        novasArmas.splice(index, 1);
        setOcorrencia(prev => ({ ...prev, armas_apreendidas: novasArmas }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...ocorrencia };
            // Lógica para enviar o payload para a API...
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
            {/* ... (Secções Informações Gerais e Localização - sem alterações) ... */}

            <div className="form-section">
                <h3>Pessoas Envolvidas</h3>
                {ocorrencia.envolvidos.map((envolvido, index) => (
                    <div key={index} className="dynamic-list-item">
                        <input type="text" name="nome" value={envolvido.nome} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Nome Completo" required />
                        
                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                            <select name="status" value={envolvido.status} onChange={(e) => handleEnvolvidoChange(index, e)}>
                                <option value="NAO_APLICAVEL">Status (N/A)</option>
                                <option value="MORTO">Morto</option>
                                <option value="FERIDO">Ferido</option>
                                <option value="CAPTURADO">Capturado</option>
                                <option value="ILESO">Ileso</option>
                            </select>
                            <select name="tipo_envolvimento" value={envolvido.tipo_envolvimento} onChange={(e) => handleEnvolvidoChange(index, e)}>
                                <option value="SUSPEITO">Suspeito</option>
                                <option value="VITIMA">Vítima</option>
                                <option value="TESTEMUNHA">Testemunha</option>
                                <option value="AUTOR">Autor</option>
                                <option value="OUTRO">Outro</option>
                            </select>
                        </div>
                        
                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                            <select style={{flex: 1}} name="tipo_documento" value={envolvido.tipo_documento} onChange={(e) => handleEnvolvidoChange(index, e)}>
                                <option value="CPF">CPF</option>
                                <option value="RG">RG</option>
                                <option value="OUTRO">Outro</option>
                            </select>
                            <input style={{flex: 2}} type="text" name="documento" value={envolvido.documento} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Número do Documento" />
                        </div>

                         <select name="organizacao_criminosa" value={envolvido.organizacao_criminosa || ''} onChange={(e) => handleEnvolvidoChange(index, e)} style={{marginTop: '10px'}}>
                            <option value="">Nenhuma Organização</option>
                            {organizacoes.map(org => (<option key={org.id} value={org.id}>{org.nome}</option>))}
                        </select>
                        <textarea name="observacoes" value={envolvido.observacoes} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Observações" />
                        <button type="button" className="remove-button" onClick={() => removerEnvolvido(index)}>Remover</button>
                    </div>
                ))}
                <button type="button" className="add-button" onClick={adicionarEnvolvido}>+ Adicionar Pessoa</button>
            </div>

            <div className="form-section">
                 {/* ... (Checkbox para mostrar/esconder armas) ... */}
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
                                                <li key={sug.id} onClick={() => handleArmaSuggestionClick(sug, index)}>
                                                    <strong>{sug.modelo}</strong> ({sug.marca || 'N/A'} - {sug.calibre || 'N/A'})
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                    <select name="especie" value={arma.especie} onChange={(e) => handleArmaChange(index, e)} disabled={!!arma.modelo_catalogado}>
                                        <option value="NAO_DEFINIDA">Espécie (N/D)</option>
                                        <option value="PISTOLA">Pistola</option>
                                        <option value="REVOLVER">Revólver</option>
                                        <option value="FUZIL">Fuzil</option>
                                        <option value="ESPINGARDA">Espingarda</option>
                                        <option value="METRALHADORA">Metralhadora</option>
                                        <option value="SUBMETRALHADORA">Submetralhadora</option>
                                        <option value="GRANADA">Granada</option>
                                        <option value="EXPLOSIVO">Outros Explosivos</option>
                                    </select>
                                    <input type="text" name="marca" value={arma.marca} onChange={(e) => handleArmaChange(index, e)} placeholder="Marca" disabled={!!arma.modelo_catalogado} />
                                    <input type="text" name="calibre" value={arma.calibre} onChange={(e) => handleArmaChange(index, e)} placeholder="Calibre" disabled={!!arma.modelo_catalogado} />
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

            <button type="submit" className="submit-button">Salvar Ocorrência</button>
        </form>
    );
};

export default OcorrenciaForm;
