import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createOcorrencia, updateOcorrencia, getOrganizacoes, getTiposOcorrencia, createTipoOcorrencia, getCadernos, createCaderno, getOPMs } from '../api';
import './OcorrenciaForm.css';

const initialState = {
    tipo_ocorrencia: '', data_fato: '', descricao_fato: '',
    fonte_informacao: '', caderno_informativo: '', evolucao_ocorrencia: '',
    opm_area: '', cep: '', logradouro: '', bairro: '', cidade: '', uf: '',
    latitude: '', longitude: '', envolvidos: [],
};

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    const [formData, setFormData] = useState(initialState);
    const [cepLoading, setCepLoading] = useState(false);
    const [organizacoes, setOrganizacoes] = useState([]);
    const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
    const [cadernos, setCadernos] = useState([]);
    const [opms, setOpms] = useState([]);
    
    const [showNovoTipo, setShowNovoTipo] = useState(false);
    const [novoTipoNome, setNovoTipoNome] = useState("");
    const [showNovoCaderno, setShowNovoCaderno] = useState(false);
    const [novoCadernoNome, setNovoCadernoNome] = useState("");

    useEffect(() => {
        if (existingOcorrencia && existingOcorrencia.id) {
            setFormData({
                ...initialState,
                ...existingOcorrencia,
                tipo_ocorrencia: existingOcorrencia.tipo_ocorrencia || '',
                caderno_informativo: existingOcorrencia.caderno_informativo || '',
                opm_area: existingOcorrencia.opm_area || '',
                data_fato: existingOcorrencia.data_fato ? existingOcorrencia.data_fato.substring(0, 16) : '',
                envolvidos: existingOcorrencia.envolvidos?.map(e => ({...e, organizacao_criminosa: e.organizacao_criminosa || null })) || [],
            });
        } else {
            setFormData(initialState);
        }
    }, [existingOcorrencia]);

    const fetchLookups = async () => {
        try {
            const [orgsRes, tiposRes, cadernosRes, opmsRes] = await Promise.all([getOrganizacoes(), getTiposOcorrencia(), getCadernos(), getOPMs()]);
            setOrganizacoes(orgsRes.data);
            setTiposOcorrencia(tiposRes.data);
            setCadernos(cadernosRes.data);
            setOpms(opmsRes.data);
        } catch (error) { console.error("Erro ao buscar dados iniciais:", error); }
    };

    useEffect(() => {
        fetchLookups();
    }, []);

    const handleCreateLookup = async (createFn, name, setNameFn, setShowFn, fetchFn) => {
        if (name.trim() === "") return;
        try {
            await createFn({ nome: name });
            setNameFn("");
            setShowFn(false);
            fetchFn();
        } catch (error) {
            console.error("Erro ao criar novo item:", error);
            alert("Falha ao criar novo item.");
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        setCepLoading(true);
        try {
            const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            setFormData(p => ({ ...p, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }));
        } catch (error) { alert("CEP não encontrado."); } 
        finally { setCepLoading(false); }
    };

    const addEnvolvido = () => setFormData(p => ({ ...p, envolvidos: [...p.envolvidos, { nome: '', documento: '', tipo_envolvimento: 'VITIMA', observacoes: '', organizacao_criminosa: null, procedimentos: [] }] }));
    const removeEnvolvido = (index) => setFormData(p => ({ ...p, envolvidos: p.envolvidos.filter((_, i) => i !== index) }));
    const handleEnvolvidoChange = (index, e) => {
        const { name, value } = e.target;
        const novosEnvolvidos = [...formData.envolvidos];
        novosEnvolvidos[index][name] = value === '' ? null : value;
        setFormData({ ...formData, envolvidos: novosEnvolvidos });
    };

    const addProcedimento = (eIndex) => {
        const novosEnvolvidos = [...formData.envolvidos];
        novosEnvolvidos[eIndex].procedimentos.push({ numero_processo: '', vara_tribunal: '', status: 'EM_INVESTIGACAO', detalhes: '' });
        setFormData({ ...formData, envolvidos: novosEnvolvidos });
    };
    const removeProcedimento = (eIndex, pIndex) => {
        const novosEnvolvidos = [...formData.envolvidos];
        novosEnvolvidos[eIndex].procedimentos = novosEnvolvidos[eIndex].procedimentos.filter((_, i) => i !== pIndex);
        setFormData({ ...formData, envolvidos: novosEnvolvidos });
    };
    const handleProcedimentoChange = (eIndex, pIndex, e) => {
        const { name, value } = e.target;
        const novosEnvolvidos = [...formData.envolvidos];
        novosEnvolvidos[eIndex].procedimentos[pIndex][name] = value;
        setFormData({ ...formData, envolvidos: novosEnvolvidos });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.tipo_ocorrencia) {
                alert("Por favor, selecione um tipo de ocorrência.");
                return;
            }
            if (formData.id) await updateOcorrencia(formData.id, payload);
            else await createOcorrencia(payload);
            onSuccess();
        } catch (error) {
            console.error("Erro ao salvar ocorrência:", error.response?.data);
            alert("Falha ao salvar a ocorrência.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form">
            <h2>{formData.id ? 'Editar Ocorrência' : 'Nova Ocorrência'}</h2>
            
            <div className="form-section">
                <h3>Dados da Ocorrência</h3>
                <select name="tipo_ocorrencia" value={formData.tipo_ocorrencia} onChange={handleInputChange} required>
                    <option value="">-- Selecione o Tipo --</option>
                    {tiposOcorrencia.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}
                </select>
                <button type="button" onClick={() => setShowNovoTipo(!showNovoTipo)} className="add-button-inline">{showNovoTipo ? 'Cancelar' : '+ Novo Tipo'}</button>
                {showNovoTipo && (
                    <div className="inline-add-form">
                        <input value={novoTipoNome} onChange={(e) => setNovoTipoNome(e.target.value)} placeholder="Nome do novo tipo" />
                        <button type="button" onClick={() => handleCreateLookup(createTipoOcorrencia, novoTipoNome, setNovoTipoNome, setShowNovoTipo, fetchLookups)}>Salvar</button>
                    </div>
                )}

                <select name="caderno_informativo" value={formData.caderno_informativo} onChange={handleInputChange}>
                    <option value="">-- Selecione o Caderno --</option>
                    {cadernos.map(cad => <option key={cad.id} value={cad.id}>{cad.nome}</option>)}
                </select>
                <button type="button" onClick={() => setShowNovoCaderno(!showNovoCaderno)} className="add-button-inline">{showNovoCaderno ? 'Cancelar' : '+ Novo Caderno'}</button>
                {showNovoCaderno && (
                    <div className="inline-add-form">
                        <input value={novoCadernoNome} onChange={(e) => setNovoCadernoNome(e.target.value)} placeholder="Nome do novo caderno" />
                        <button type="button" onClick={() => handleCreateLookup(createCaderno, novoCadernoNome, setNovoCadernoNome, setShowNovoCaderno, fetchLookups)}>Salvar</button>
                    </div>
                )}

                <input name="data_fato" value={formData.data_fato} onChange={handleInputChange} type="datetime-local" required />
                <textarea name="descricao_fato" value={formData.descricao_fato} onChange={handleInputChange} placeholder="Descrição do Fato" required />
                <input name="fonte_informacao" value={formData.fonte_informacao} onChange={handleInputChange} placeholder="Fonte da Informação" />
                <textarea name="evolucao_ocorrencia" value={formData.evolucao_ocorrencia} onChange={handleInputChange} placeholder="Evolução da Ocorrência" />
            </div>

            <div className="form-section">
                <h3>Endereço</h3>
                <select name="opm_area" value={formData.opm_area} onChange={handleInputChange}>
                    <option value="">-- Selecione a OPM da Área --</option>
                    {opms.map(opm => <option key={opm.id} value={opm.id}>{opm.nome}</option>)}
                </select>
                <input name="cep" value={formData.cep} onChange={handleInputChange} onBlur={handleCepBlur} placeholder="CEP" />
                {cepLoading && <p>Buscando CEP...</p>}
                <input name="logradouro" value={formData.logradouro} onChange={handleInputChange} placeholder="Logradouro" />
                <input name="bairro" value={formData.bairro} onChange={handleInputChange} placeholder="Bairro" />
                <input name="cidade" value={formData.cidade} onChange={handleInputChange} placeholder="Cidade" />
                <input name="uf" value={formData.uf} onChange={handleInputChange} placeholder="UF" />
                <input name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="Latitude" />
                <input name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="Longitude" />
            </div>

            <div className="form-section">
                <h3>Pessoas Envolvidas</h3>
                {formData.envolvidos.map((envolvido, index) => (
                    <div key={index} className="dynamic-list-item">
                        <h4>Pessoa {index + 1}</h4>
                        <input name="nome" value={envolvido.nome} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Nome Completo" required />
                        <input name="documento" value={envolvido.documento} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Documento (RG/CPF)" />
                        <select name="tipo_envolvimento" value={envolvido.tipo_envolvimento} onChange={(e) => handleEnvolvidoChange(index, e)}>
                            <option value="VITIMA">Vítima</option>
                            <option value="TESTEMUNHA">Testemunha</option>
                            <option value="SUSPEITO">Suspeito</option>
                            <option value="AUTOR">Autor</option>
                            <option value="OUTRO">Outro</option>
                        </select>
                        <select name="organizacao_criminosa" value={envolvido.organizacao_criminosa || ''} onChange={(e) => handleEnvolvidoChange(index, e)}>
                            <option value="">Nenhuma Organização</option>
                            {organizacoes.map(org => <option key={org.id} value={org.id}>{org.nome}</option>)}
                        </select>
                        <textarea name="observacoes" value={envolvido.observacoes} onChange={(e) => handleEnvolvidoChange(index, e)} placeholder="Observações" />
                        
                        <div className="procedimentos-container">
                            <h5>Procedimentos Penais</h5>
                            {envolvido.procedimentos.map((proc, pIndex) => (
                                <div key={pIndex} className="dynamic-list-item nested">
                                    <input name="numero_processo" value={proc.numero_processo} onChange={(e) => handleProcedimentoChange(index, pIndex, e)} placeholder="Nº do Processo" />
                                    <input name="vara_tribunal" value={proc.vara_tribunal} onChange={(e) => handleProcedimentoChange(index, pIndex, e)} placeholder="Vara/Tribunal" />
                                    <select name="status" value={proc.status} onChange={(e) => handleProcedimentoChange(index, pIndex, e)}>
                                        <option value="EM_INVESTIGACAO">Em Investigação</option>
                                        <option value="EM_ANDAMENTO">Em Andamento</option>
                                        <option value="CONCLUIDO">Concluído</option>
                                        <option value="ARQUIVADO">Arquivado</option>
                                    </select>
                                    <textarea name="detalhes" value={proc.detalhes} onChange={(e) => handleProcedimentoChange(index, pIndex, e)} placeholder="Detalhes do Procedimento" />
                                    <button type="button" onClick={() => removeProcedimento(index, pIndex)} className="remove-button nested-remove">Remover Procedimento</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addProcedimento(index)} className="add-button">Adicionar Procedimento</button>
                        </div>
                        <button type="button" onClick={() => removeEnvolvido(index)} className="remove-button">Remover Pessoa</button>
                    </div>
                ))}
                <button type="button" onClick={addEnvolvido} className="add-button">Adicionar Pessoa Envolvida</button>
            </div>

            <button type="submit" className="submit-button">Salvar Ocorrência</button>
        </form>
    );
};

export default OcorrenciaForm;
