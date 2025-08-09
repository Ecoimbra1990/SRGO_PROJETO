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
                <textarea name="descricao_fato" value={ocorrencia.descricao_fato} onChange={handleInputChange} rows="6" required></textarea>
                
                <label>Evolução da Ocorrência</label>
                <textarea name="evolucao_ocorrencia" value={ocorrencia.evolucao_ocorrencia} onChange={handleInputChange} rows="3"></textarea>
                
                <label>Fonte da Informação</label>
                <input type="text" name="fonte_informacao" value={ocorrencia.fonte_informacao} onChange={handleInputChange} />

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

            {/* Seções de Envolvidos e Armas podem ser adicionadas aqui conforme a lógica existente */}

            <button type="submit" className="submit-button">{ocorrencia.id ? 'Atualizar' : 'Salvar'}</button>
        </form>
    );
};

export default OcorrenciaForm;
