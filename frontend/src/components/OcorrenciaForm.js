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

// O componente agora recebe 'lookupData' com todos os dados necessários
const OcorrenciaForm = ({ existingOcorrencia, onSuccess, lookupData }) => {
    // REMOVIDO: O estado de 'loading' já não é necessário aqui.
    const [ocorrencia, setOcorrencia] = useState(initialOcorrenciaState);
    const [fotoFile, setFotoFile] = useState(null);
    const [isHomicidio, setIsHomicidio] = useState(false);
    // ... (outros states que não são para dados de lookup)
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [mostrarSecaoArmas, setMostrarSecaoArmas] = useState(false);
    const [armaSearchTerm, setArmaSearchTerm] = useState('');
    const [armaSuggestions, setArmaSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
    const [areaSugerida, setAreaSugerida] = useState(null);

    // Desestrutura os dados recebidos por props para facilitar o uso
    const { opms, tiposOcorrencia, organizacoes, cadernos, modalidadesCrime } = lookupData;

    // REMOVIDO: O useEffect que buscava os dados foi completamente removido.

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
        setIsHomicidio(tipoSelecionado && tipoSelecionado.nome.toUpperCase().includes('HOMICÍDIO DOLOSO'));
        if (!isHomicidio) {
            setOcorrencia(prev => ({ ...prev, tipo_homicidio: null }));
        }
    }, [ocorrencia.tipo_ocorrencia, tiposOcorrencia, isHomicidio]);

    // ... (outros useEffects que não foram alterados)

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

    // REMOVIDO: O 'if (loading)' já não é necessário.

    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form" autoComplete="off">
            <h2>{ocorrencia.id ? 'Editar Ocorrência' : 'Registrar Nova Ocorrência'}</h2>

            <div className="form-section">
                <h3>Informações Gerais</h3>
                {/* ... (resto do seu JSX do formulário, sem alterações) ... */}
            </div>
            {/* ... (outras seções do formulário) ... */}
        </form>
    );
};

export default OcorrenciaForm;
