import React, { useState, useEffect } from 'react';
import api, { getModelosArma, getLocalidadePorNome, patchOcorrencia } from '../api';
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
    // ... outros states que não são para dados de lookup
    
    // Desestrutura os dados recebidos por props para facilitar o uso
    const { opms, tiposOcorrencia, organizacoes, cadernos, modalidadesCrime } = lookupData;

    useEffect(() => {
        if (existingOcorrencia && existingOcorrencia.id) {
            setOcorrencia({
                ...initialOcorrenciaState,
                ...existingOcorrencia,
                data_fato: existingOcorrencia.data_fato ? new Date(existingOcorrencia.data_fato).toISOString().slice(0, 16) : '',
                envolvidos: existingOcorrencia.envolvidos || [],
                armas_apreendidas: existingOcorrencia.armas_apreendidas || []
            });
        } else {
            setOcorrencia(initialOcorrenciaState);
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
    
    // A verificação de 'loading' foi removida, pois o Home.js já a faz.
    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form" autoComplete="off">
            <h2>{ocorrencia.id ? 'Editar Ocorrência' : 'Registrar Nova Ocorrência'}</h2>
            <div className="form-section">
                <h3>Informações Gerais</h3>
                <input type="datetime-local" name="data_fato" value={ocorrencia.data_fato} onChange={handleInputChange} required />
                <select name="tipo_ocorrencia" value={ocorrencia.tipo_ocorrencia || ''} onChange={handleInputChange} required>
                    <option value="">Selecione o Tipo</option>
                    {tiposOcorrencia.map(tipo => (<option key={tipo.id} value={tipo.id}>{tipo.nome}</option>))}
                </select>
                {isHomicidio && (
                    <select name="tipo_homicidio" value={ocorrencia.tipo_homicidio || ''} onChange={handleInputChange}>
                        <option value="">Selecione a Modalidade</option>
                        {modalidadesCrime.map(m => (<option key={m.id} value={m.id}>{m.nome}</option>))}
                    </select>
                )}
                {/* O resto do seu JSX do formulário, que usará as variáveis desestruturadas de lookupData */}
            </div>
            <button type="submit">Salvar</button>
        </form>
    );
};

export default OcorrenciaForm;
