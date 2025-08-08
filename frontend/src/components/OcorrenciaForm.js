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
    envolvidos: [], armas_apreendidas: [], tipo_homicidio: null
};

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [ocorrencia, setOcorrencia] = useState(initialOcorrenciaState);
    const [fotoFile, setFotoFile] = useState(null);
    const [opms, setOpms] = useState([]);
    const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
    const [isHomicidio, setIsHomicidio] = useState(false);
    const [organizacoes, setOrganizacoes] = useState([]);
    const [cadernos, setCadernos] = useState([]);
    const [modalidadesCrime, setModalidadesCrime] = useState([]);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [mostrarSecaoArmas, setMostrarSecaoArmas] = useState(false);
    const [armaSearchTerm, setArmaSearchTerm] = useState('');
    const [armaSuggestions, setArmaSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
    const [areaSugerida, setAreaSugerida] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [opmsRes, tiposRes, orgsRes, cadernosRes, modalidadesRes] = await Promise.all([
                    getOPMs(),
                    getTiposOcorrencia(),
                    getOrganizacoes(),
                    getCadernos(),
                    api.get('/api/modalidades-crime/')
                ]);
                setOpms(opmsRes.data || []);
                setTiposOcorrencia(tiposRes.data || []);
                setOrganizacoes(orgsRes.data || []);
                setCadernos(cadernosRes.data || []);
                setModalidadesCrime(modalidadesRes.data || []);
            } catch (error) {
                console.error('Erro ao carregar dados para o formulário:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    useEffect(() => {
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
        const tipoSelecionado = tiposOcorrencia.find(t => t.id === parseInt(ocorrencia.tipo_ocorrencia));
        if (tipoSelecionado && tipoSelecionado.nome.toUpperCase().includes('HOMICÍDIO DOLOSO')) {
            setIsHomicidio(true);
        } else {
            setIsHomicidio(false);
            setOcorrencia(prev => ({ ...prev, tipo_homicidio: null }));
        }
    }, [ocorrencia.tipo_ocorrencia, tiposOcorrencia]);

    useEffect(() => {
        const termoBusca = ocorrencia.bairro || ocorrencia.cidade;
        if (termoBusca.length < 3) {
            setAreaSugerida(null);
            return;
        }
        const handler = setTimeout(async () => {
            try {
                const response = await getLocalidadePorNome(termoBusca);
                if (response.data && response.data.length > 0) {
                    const localidadeEncontrada = response.data[0];
                    setAreaSugerida(localidadeEncontrada);
                    setOcorrencia(prev => ({ ...prev, opm_area: localidadeEncontrada.opm }));
                } else {
                    setAreaSugerida(null);
                }
            } catch (error) {
                console.error('Erro ao buscar área policial:', error);
                setAreaSugerida(null);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [ocorrencia.bairro, ocorrencia.cidade]);

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

    const fetchCoordinates = async (address) => {
        const apiKey = process.env.REACT_APP_Maps_API_KEY;
        if (!apiKey) {
            console.error("A chave da API do Google Maps não foi definida.");
            return { lat: 'Chave não configurada', lon: 'Chave não configurada' };
        }
        try {
            const addressQuery = `${address.logradouro}, ${address.cidade}, ${address.uf}`;
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}&key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'OK' && data.results[0]) {
                const location = data.results[0].geometry.location;
                return { lat: location.lat, lon: location.lng };
            }
        } catch (error) {
            console.error('Erro ao obter coordenadas:', error);
        }
        return { lat: '', lon: '' };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    const handleSuggestionClick = async (suggestion) => {
        const addressData = {
            logradouro: suggestion.logradouro,
            bairro: suggestion.bairro,
            cep: suggestion.cep.replace(/\D/g, ''),
            cidade: suggestion.localidade,
            uf: suggestion.uf,
        };
        setOcorrencia(prev => ({ ...prev, ...addressData, latitude: 'A procurar...', longitude: 'A procurar...' }));
        setAddressSuggestions([]);
        const { lat, lon } = await fetchCoordinates(addressData);
        setOcorrencia(prev => ({ ...prev, ...addressData, latitude: lat, longitude: lon }));
    };

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    const addressData = { logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf };
                    setOcorrencia(prev => ({ ...prev, ...addressData, latitude: 'A procurar...', longitude: 'A procurar...' }));
                    const { lat, lon } = await fetchCoordinates(addressData);
                    setOcorrencia(prev => ({ ...prev, ...addressData, latitude: lat, longitude: lon }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
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
            envolvidos: [...prev.envolvidos, { 
                nome: '', tipo_envolvimento: 'SUSPEITO', observacoes: '', 
                organizacao_criminosa: null, procedimentos: [],
                status: 'NAO_APLICAVEL', tipo_documento: 'CPF', documento: '',
                sexo: 'I'
            }]
        }));
    };

    const removerEnvolvido = (index) => {
        const novosEnvolvidos = [...ocorrencia.envolvidos];
        novosEnvolvidos.splice(index, 1);
        setOcorrencia(prev => ({ ...prev, envolvidos: novosEnvolvidos }));
    };

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
        const armaAtual = { ...novasArmas[index] };
        armaAtual[name] = value.toUpperCase();
        
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
        novasArmas[index] = {
            ...novasArmas[index],
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
        const formData = new FormData();

        Object.keys(ocorrencia).forEach(key => {
            if (!['envolvidos', 'armas_apreendidas'].includes(key)) {
                if (ocorrencia[key] !== null && ocorrencia[key] !== undefined) {
                    formData.append(key, ocorrencia[key]);
                }
            }
        });
        
        formData.append('envolvidos', JSON.stringify(ocorrencia.envolvidos));
        formData.append('armas_apreendidas', JSON.stringify(ocorrencia.armas_apreendidas));

        if (fotoFile) {
            formData.append('foto_ocorrencia', fotoFile);
        }
        
        try {
            if (ocorrencia.id) {
                await api.put(`/api/ocorrencias/${ocorrencia.id}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/api/ocorrencias/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
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
                <select name="tipo_ocorrencia" value={ocorrencia.tipo_ocorrencia || ''} onChange={handleInputChange} required>
                    <option value="">Selecione o Tipo de Ocorrência</option>
                    {tiposOcorrencia.map(tipo => (<option key={tipo.id} value={tipo.id}>{tipo.nome}</option>))}
                </select>

                {isHomicidio && (
                    <div style={{marginTop: '10px'}}>
                        <label>Tipo do Crime:</label>
                        <select name="tipo_homicidio" value={ocorrencia.tipo_homicidio || ''} onChange={handleInputChange}>
                            <option value="">Selecione a Modalidade...</option>
                            {modalidadesCrime.map(modalidade => (
                                <option key={modalidade.id} value={modalidade.id}>
                                    {modalidade.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                
                <select name="caderno_informativo" value={ocorrencia.caderno_informativo || ''} onChange={handleInputChange}>
                    <option value="">Selecione o Caderno</option>
                    {cadernos.map(caderno => (<option key={caderno.id} value={caderno.id}>{caderno.nome}</option>))}
                </select>
                <textarea name="descricao_fato" value={ocorrencia.descricao_fato} onChange={handleInputChange} placeholder="Descrição do Fato" required />
                <textarea name="evolucao_ocorrencia" value={ocorrencia.evolucao_ocorrencia} onChange={handleInputChange} placeholder="Evolução da Ocorrência" />
                <input type="text" name="fonte_informacao" value={ocorrencia.fonte_informacao} onChange={handleInputChange} placeholder="Fonte da Informação" />
                
                <div style={{marginTop: '10px'}}>
                    <label>Foto da Ocorrência (opcional):</label>
                    <input type="file" name="foto_ocorrencia" onChange={handleFileChange} />
                </div>
            </div>

            <div className="form-section">
                <h3>Localização</h3>
                <p className="form-note">Preencha UF e Cidade para habilitar a busca por logradouro.</p>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input style={{flex: 1}} type="text" name="uf" value={ocorrencia.uf} onChange={handleInputChange} placeholder="UF" maxLength="2" />
                    <input style={{flex: 3}} type="text" name="cidade" value={ocorrencia.cidade} onChange={handleInputChange} placeholder="Cidade" />
                </div>
                <div className="autocomplete-container">
                    <input type="text" name="logradouro" value={ocorrencia.logradouro || ''} onChange={handleInputChange} placeholder="Digite o Logradouro para buscar..." disabled={!ocorrencia.uf || !ocorrencia.cidade} />
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
                <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                    <input style={{flex: 1}} type="text" name="latitude" value={ocorrencia.latitude} onChange={handleInputChange} placeholder="Latitude" />
                    <input style={{flex: 1}} type="text" name="longitude" value={ocorrencia.longitude} onChange={handleInputChange} placeholder="Longitude" />
                </div>

                {areaSugerida && (
                    <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e7f3fe', border: '1px solid #bde5f8', borderRadius: '4px', textAlign: 'left' }}>
                        <h4 style={{ marginTop: 0 }}>Área Policial Sugerida:</h4>
                        <p><strong>RISP:</strong> {areaSugerida.risp_nome}</p>
                        <p><strong>AISP:</strong> {areaSugerida.aisp_nome}</p>
                        <p><strong>OPM:</strong> {areaSugerida.opm_nome}</p>
                    </div>
                )}

                <select name="opm_area" value={ocorrencia.opm_area || ''} onChange={handleInputChange} style={{marginTop: '10px'}}>
                    <option value="">Selecione a OPM da Área</option>
                    {opms.map(opm => (<option key={opm.id} value={opm.id}>{opm.nome}</option>))}
                </select>
            </div>
            
            <div className="form-section">
                <h3>Pessoas Envolvidas</h3>
                {ocorrencia.envolvidos.map((envolvido, index) => (
                    <div key={index} className="dynamic-list-item">
                        <input type="text" name="nome" value={envolvido.nome} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Nome Completo" required />
                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                            <select name="sexo" value={envolvido.sexo} onChange={(e) => handleEnvolvidoChange(index, e)}>
                                <option value="I">Sexo (Indefinido)</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                            </select>
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
                <div className="toggle-section">
                    <label htmlFor="toggle-armas">Houve apreensão de armas?</label>
                    <input type="checkbox" id="toggle-armas" checked={mostrarSecaoArmas} onChange={handleToggleSecaoArmas} />
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
