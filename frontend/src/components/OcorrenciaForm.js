import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createOcorrencia, updateOcorrencia } from '../api';
import './OcorrenciaForm.css';

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    const initialState = {
        tipo_ocorrencia: '',
        data_fato: '',
        descricao_fato: '',
        fonte_informacao: '',
        caderno_informativo: '',
        evolucao_ocorrencia: '',
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        uf: '',
        latitude: '',
        longitude: '',
        envolvidos: [],
    };

    const [formData, setFormData] = useState(initialState);
    const [cepLoading, setCepLoading] = useState(false);

    useEffect(() => {
        if (existingOcorrencia && existingOcorrencia.id) {
            setFormData({
                ...initialState,
                ...existingOcorrencia,
                data_fato: existingOcorrencia.data_fato ? existingOcorrencia.data_fato.substring(0, 16) : '',
                envolvidos: existingOcorrencia.envolvidos || [],
            });
        } else {
            setFormData(initialState);
        }
    }, [existingOcorrencia]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            setCepLoading(true);
            try {
                const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
                const { logradouro, bairro, localidade, uf } = response.data;
                setFormData(prev => ({ ...prev, logradouro, bairro, cidade: localidade, uf }));
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
                alert("CEP não encontrado.");
            } finally {
                setCepLoading(false);
            }
        }
    };

    // --- Funções para Pessoas Envolvidas ---
    const addEnvolvido = () => {
        setFormData(prev => ({
            ...prev,
            envolvidos: [...prev.envolvidos, { nome: '', documento: '', tipo_envolvimento: 'VITIMA', observacoes: '', procedimentos: [] }]
        }));
    };

    const removeEnvolvido = (index) => {
        setFormData(prev => ({
            ...prev,
            envolvidos: prev.envolvidos.filter((_, i) => i !== index)
        }));
    };

    const handleEnvolvidoChange = (index, e) => {
        const { name, value } = e.target;
        const novosEnvolvidos = [...formData.envolvidos];
        novosEnvolvidos[index][name] = value;
        setFormData({ ...formData, envolvidos: novosEnvolvidos });
    };

    // --- Funções para Procedimentos Penais ---
    const addProcedimento = (envolvidoIndex) => {
        const novosEnvolvidos = [...formData.envolvidos];
        novosEnvolvidos[envolvidoIndex].procedimentos.push({ numero_processo: '', vara_tribunal: '', status: 'EM_INVESTIGACAO', detalhes: '' });
        setFormData({ ...formData, envolvidos: novosEnvolvidos });
    };

    const removeProcedimento = (envolvidoIndex, procIndex) => {
        const novosEnvolvidos = [...formData.envolvidos];
        novosEnvolvidos[envolvidoIndex].procedimentos = novosEnvolvidos[envolvidoIndex].procedimentos.filter((_, i) => i !== procIndex);
        setFormData({ ...formData, envolvidos: novosEnvolvidos });
    };

    const handleProcedimentoChange = (envolvidoIndex, procIndex, e) => {
        const { name, value } = e.target;
        const novosEnvolvidos = [...formData.envolvidos];
        novosEnvolvidos[envolvidoIndex].procedimentos[procIndex][name] = value;
        setFormData({ ...formData, envolvidos: novosEnvolvidos });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                await updateOcorrencia(formData.id, formData);
            } else {
                await createOcorrencia(formData);
            }
            onSuccess();
        } catch (error) {
            console.error("Erro ao salvar ocorrência:", error);
            alert("Falha ao salvar a ocorrência.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form">
            <h2>{formData.id ? 'Editar Ocorrência' : 'Nova Ocorrência'}</h2>
            
            <div className="form-section">
                <h3>Dados da Ocorrência</h3>
                <input name="tipo_ocorrencia" value={formData.tipo_ocorrencia} onChange={handleInputChange} placeholder="Tipo da Ocorrência" required />
                <input name="data_fato" value={formData.data_fato} onChange={handleInputChange} type="datetime-local" required />
                <textarea name="descricao_fato" value={formData.descricao_fato} onChange={handleInputChange} placeholder="Descrição do Fato" required />
                <input name="fonte_informacao" value={formData.fonte_informacao} onChange={handleInputChange} placeholder="Fonte da Informação" />
                <input name="caderno_informativo" value={formData.caderno_informativo} onChange={handleInputChange} placeholder="Caderno Informativo" />
                <textarea name="evolucao_ocorrencia" value={formData.evolucao_ocorrencia} onChange={handleInputChange} placeholder="Evolução da Ocorrência" />
            </div>

            <div className="form-section">
                <h3>Endereço</h3>
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
