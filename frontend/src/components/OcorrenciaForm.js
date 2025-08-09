// Apenas a função handleSubmit precisa de ser alterada, mas para garantir, substitua o ficheiro completo.
import React, { useState, useEffect } from 'react';
import api, {
    getOPMs,
    getTiposOcorrencia,
    getOrganizacoes,
    getCadernos,
    getModelosArma,
    getLocalidadePorNome,
    getModalidadesCrime,
    patchOcorrencia // Importar a nova função
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
    // ... (resto dos seus 'useState' hooks)

    // ... (todos os seus 'useEffect' hooks permanecem iguais)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    // ... (outras funções auxiliares que não mudam)

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Monta o FormData apenas com os campos que serão enviados
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
                // CORREÇÃO: Usar a função patchOcorrencia em vez de api.put
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

    if (loading) return <p>Carregando formulário...</p>;
    
    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form" autoComplete="off">
            {/* O JSX do seu formulário permanece exatamente o mesmo */}
            {/* O importante é que o input de ficheiro tenha o nome 'foto_ocorrencia' */}
             <div style={{marginTop: '10px'}}>
                <label>Foto da Ocorrência (opcional):</label>
                <input type="file" name="foto_ocorrencia" onChange={handleFileChange} />
            </div>
            {/* ... resto do formulário ... */}
        </form>
    );
};

export default OcorrenciaForm;
