import React, { useState, useEffect } from 'react';
import api from '../api';
import './OcorrenciaForm.css';

const initialOcorrenciaState = {
    tipo_ocorrencia: '', data_fato: '', descricao_fato: '', fonte_informacao: '',
    evolucao_ocorrencia: '', cep: '', logradouro: '', bairro: '', cidade: '',
    uf: '', latitude: '', longitude: '', opm_area: '', caderno_informativo: '',
    envolvidos: [], armas_apreendidas: []
};

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    const [ocorrencia, setOcorrencia] = useState(initialOcorrenciaState);
    const [fotoFile, setFotoFile] = useState(null);
    const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
    const [isHomicidio, setIsHomicidio] = useState(false);
    // ... (outros estados)
    const [opms, setOpms] = useState([]);
    const [organizacoes, setOrganizacoes] = useState([]);
    const [cadernos, setCadernos] = useState([]);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [mostrarSecaoArmas, setMostrarSecaoArmas] = useState(false);
    const [armaSearchTerm, setArmaSearchTerm] = useState('');
    const [armaSuggestions, setArmaSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
    const [areaSugerida, setAreaSugerida] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [opmsRes, tiposRes, orgsRes, cadernosRes] = await Promise.all([
                    api.get('/api/opms/'), 
                    api.get('/api/tipos-ocorrencia/'), 
                    api.get('/api/organizacoes/'), 
                    api.get('/api/cadernos/')
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
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
        
        // Stringify arrays before appending
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

    const adicionarEnvolvido = () => {
        setOcorrencia(prev => ({
            ...prev,
            envolvidos: [...prev.envolvidos, { 
                nome: '', tipo_envolvimento: 'SUSPEITO', observacoes: '', 
                organizacao_criminosa: null, procedimentos: [],
                status: 'NAO_APLICAVEL', tipo_documento: 'CPF', documento: '',
                sexo: 'I' // Valor inicial para o novo campo
            }]
        }));
    };
    
    // ... (restante da lógica do formulário)

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
                            <option value="">Selecione...</option>
                            <option value="MASCULINA">Vítima Masculina</option>
                            <option value="FEMININA">Vítima Feminina (Feminicídio)</option>
                            <option value="CONFRONTO">Oposição à Intervenção Policial</option>
                            <option value="OUTRO">Outro</option>
                        </select>
                    </div>
                )}
                
                <div style={{marginTop: '10px'}}>
                    <label>Foto da Ocorrência (opcional):</label>
                    <input type="file" name="foto_ocorrencia" onChange={handleFileChange} />
                </div>
            </div>

            <div className="form-section">
                <h3>Pessoas Envolvidas</h3>
                {ocorrencia.envolvidos.map((envolvido, index) => (
                    <div key={index} className="dynamic-list-item">
                        <input type="text" name="nome" value={envolvido.nome} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Nome Completo" required />
                        
                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                            {/* --- CAMPO SEXO ADICIONADO --- */}
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
                        </div>

                        <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
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
            
            {/* ... (restante do formulário) ... */}

            <button type="submit" className="submit-button">Salvar Ocorrência</button>
        </form>
    );
};

export default OcorrenciaForm;
