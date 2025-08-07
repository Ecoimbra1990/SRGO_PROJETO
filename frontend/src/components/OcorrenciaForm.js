import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getOPMs, getTiposOcorrencia, getOrganizacoes } from '../api';
import './OcorrenciaForm.css';

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    const navigate = useNavigate();
    const [ocorrencia, setOcorrencia] = useState({
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
        envolvidos: []
    });

    const [opms, setOpms] = useState([]);
    const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
    const [organizacoes, setOrganizacoes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
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
            }
        };
        fetchData();

        if (existingOcorrencia) {
            setOcorrencia({
                ...existingOcorrencia,
                data_fato: existingOcorrencia.data_fato ? new Date(existingOcorrencia.data_fato).toISOString().slice(0, 16) : ''
            });
        }
    }, [existingOcorrencia]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
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
                    setOcorrencia(prev => ({
                        ...prev,
                        logradouro: data.logradouro,
                        bairro: data.bairro,
                        cidade: data.localidade,
                        uf: data.uf
                    }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (ocorrencia.id) {
                await api.put(`/ocorrencias/${ocorrencia.id}/`, ocorrencia);
            } else {
                await api.post('/ocorrencias/', ocorrencia);
            }
            onSuccess();
        } catch (error) {
            console.error('Erro ao salvar ocorrência:', error.response?.data || error);
        }
    };


    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form">
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
                <textarea name="descricao_fato" value={ocorrencia.descricao_fato} onChange={handleInputChange} placeholder="Descrição do Fato" required />
                <textarea name="evolucao_ocorrencia" value={ocorrencia.evolucao_ocorrencia} onChange={handleInputChange} placeholder="Evolução da Ocorrência" />
                <input type="text" name="fonte_informacao" value={ocorrencia.fonte_informacao} onChange={handleInputChange} placeholder="Fonte da Informação" />
            </div>

            <div className="form-section">
                <h3>Localização</h3>
                <input type="text" name="cep" value={ocorrencia.cep} onChange={handleInputChange} onBlur={handleCepBlur} placeholder="CEP" />
                <input type="text" name="logradouro" value={ocorrencia.logradouro} onChange={handleInputChange} placeholder="Logradouro" />
                <input type="text" name="bairro" value={ocorrencia.bairro} onChange={handleInputChange} placeholder="Bairro" />
                <input type="text" name="cidade" value={ocorrencia.cidade} onChange={handleInputChange} placeholder="Cidade" />
                <input type="text" name="uf" value={ocorrencia.uf} onChange={handleInputChange} placeholder="UF" />
                 <select name="opm_area" value={ocorrencia.opm_area} onChange={handleInputChange}>
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