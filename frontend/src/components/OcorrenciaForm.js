import React, { useState, useEffect } from 'react';
import api, {
    getModelosArma,
    getLocalidadePorNome,
    patchOcorrencia
} from '../api';
import './OcorrenciaForm.css';

const initialOcorrenciaState = {
    tipo_ocorrencia: '', data_fato: '', descricao_fato: '', fonte_informacao: '',
    evolucao_ocorrencia: '', cep: '', logradouro: '', bairro: '', cidade: '',
    uf: '', latitude: '', longitude: '', opm_area: '', caderno_informativo: '',
    envolvidos: [], armas_apreendidas: [], tipo_homicidio: null
};

const OcorrenciaForm = ({ existingOcorrencia, onSuccess, lookupData }) => {
    const [ocorrencia, setOcorrencia] = useState(initialOcorrenciaState);
    const [fotoFile, setFotoFile] = useState(null);
    const [isHomicidio, setIsHomicidio] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [mostrarSecaoArmas, setMostrarSecaoArmas] = useState(false);
    const [armaSearchTerm, setArmaSearchTerm] = useState('');
    const [armaSuggestions, setArmaSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
    const [areaSugerida, setAreaSugerida] = useState(null);

    const { opms, tiposOcorrencia, organizacoes, cadernos, modalidadesCrime } = lookupData;

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
        const checkHomicidio = tipoSelecionado && tipoSelecionado.nome.toUpperCase().includes('HOMICÍDIO DOLOSO');
        setIsHomicidio(checkHomicidio);
        if (!checkHomicidio) {
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
        novasArmas[index][name] = value;
        setOcorrencia(prev => ({ ...prev, armas_apreendidas: novasArmas }));
    };

    const adicionarArma = () => {
        setOcorrencia(prev => ({
            ...prev,
            armas_apreendidas: [...prev.armas_apreendidas, { 
                tipo: 'FOGO', marca: '', modelo: '', 
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
            if (!['envolvidos', 'armas_apreendidas', 'foto_ocorrencia', 'id'].includes(key)) {
                if (ocorrencia[key] !== null && ocorrencia[key] !== undefined) {
                    formData.append(key, ocorrencia[key]);
                }
            }
        });
        formData.append('envolvidos', JSON.stringify(ocorrencia.envolvidos));
        formData.append('armas_apreendidas', JSON.stringify(ocorrencia.armas_apreendidas));
        if (fotoFile) {
            formData.append('foto_ocorrencia_upload', fotoFile);
        }
        try {
            if (ocorrencia.id) {
                await patchOcorrencia(ocorrencia.id, formData);
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
    
    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form" autoComplete="off">
            <h2>{ocorrencia.id ? `Editar Ocorrência Nº ${ocorrencia.id}` : 'Registrar Nova Ocorrência'}</h2>
            
            <div className="form-section">
                <h3>Informações Gerais</h3>
                <label>Data e Hora do Fato *</label>
                <input type="datetime-local" name="data_fato" value={ocorrencia.data_fato} onChange={handleInputChange} required />

                <label>Tipo de Ocorrência *</label>
                <select name="tipo_ocorrencia" value={ocorrencia.tipo_ocorrencia || ''} onChange={handleInputChange} required>
                    <option value="" disabled>Selecione o Tipo</option>
                    {tiposOcorrencia.map(tipo => (<option key={tipo.id} value={tipo.id}>{tipo.nome}</option>))}
                </select>

                {isHomicidio && (
                    <>
                        <label>Modalidade do Crime *</label>
                        <select name="tipo_homicidio" value={ocorrencia.tipo_homicidio || ''} onChange={handleInputChange} required>
                            <option value="" disabled>Selecione a Modalidade</option>
                            {modalidadesCrime.map(m => (<option key={m.id} value={m.id}>{m.nome}</option>))}
                        </select>
                    </>
                )}
                
                <label>Descrição do Fato *</label>
                <textarea name="descricao_fato" value={ocorrencia.descricao_fato} onChange={handleInputChange} placeholder="Descrição detalhada do que aconteceu..." rows="6" required></textarea>
                
                <label>Evolução da Ocorrência</label>
                <textarea name="evolucao_ocorrencia" value={ocorrencia.evolucao_ocorrencia} onChange={handleInputChange} placeholder="Atualizações, investigações, etc..." rows="3"></textarea>
                
                <label>Fonte da Informação</label>
                <input type="text" name="fonte_informacao" value={ocorrencia.fonte_informacao} onChange={handleInputChange} placeholder="Ex: 10ª CIPM, Informe Baiano" />

                <label>Caderno Informativo</label>
                <select name="caderno_informativo" value={ocorrencia.caderno_informativo || ''} onChange={handleInputChange}>
                    <option value="">Nenhum</option>
                    {cadernos.map(c => (<option key={c.id} value={c.id}>{c.nome}</option>))}
                </select>

                <div style={{marginTop: '10px'}}>
                    <label>Foto da Ocorrência (opcional):</label>
                    <input type="file" name="foto_ocorrencia_upload" onChange={handleFileChange} />
                    {ocorrencia.foto_ocorrencia && !fotoFile && (
                        <p>Imagem atual: <a href={ocorrencia.foto_ocorrencia} target="_blank" rel="noopener noreferrer">Ver Imagem</a></p>
                    )}
                </div>
            </div>

            <div className="form-section">
                <h3>Localização</h3>
                <input type="text" name="bairro" value={ocorrencia.bairro} onChange={handleInputChange} placeholder="Bairro" />
                <input type="text" name="cidade" value={ocorrencia.cidade} onChange={handleInputChange} placeholder="Cidade" />
                <label>OPM da Área</label>
                <select name="opm_area" value={ocorrencia.opm_area || ''} onChange={handleInputChange}>
                    <option value="">Selecione a OPM</option>
                    {opms.map(opm => (<option key={opm.id} value={opm.id}>{opm.nome}</option>))}
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
                        <button type="button" className="remove-button" onClick={() => removerEnvolvido(index)}>Remover</button>
                    </div>
                ))}
                <button type="button" className="add-button" onClick={adicionarEnvolvido}>+ Adicionar Pessoa</button>
            </div>
            
            <div className="form-section">
                 <label>
                    <input type="checkbox" checked={mostrarSecaoArmas} onChange={handleToggleSecaoArmas} />
                    Houve apreensão de armas?
                </label>
                {mostrarSecaoArmas && (
                    <>
                        <h3>Armas Apreendidas</h3>
                        {ocorrencia.armas_apreendidas.map((arma, index) => (
                            <div key={index} className="dynamic-list-item">
                                <input type="text" name="modelo" value={arma.modelo} onChange={(e) => handleArmaChange(index, e)} placeholder="Modelo da Arma" />
                                <input type="text" name="marca" value={arma.marca} onChange={(e) => handleArmaChange(index, e)} placeholder="Marca" />
                                <button type="button" className="remove-button" onClick={() => removerArma(index)}>Remover Arma</button>
                            </div>
                        ))}
                        <button type="button" className="add-button" onClick={adicionarArma}>+ Adicionar Arma</button>
                    </>
                )}
            </div>

            <button type="submit" className="submit-button">{ocorrencia.id ? 'Atualizar Ocorrência' : 'Salvar Ocorrência'}</button>
        </form>
    );
};

export default OcorrenciaForm;
