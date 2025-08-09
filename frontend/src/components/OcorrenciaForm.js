import React, { useState, useEffect } from 'react';
import api, {
    getOPMs,
    getTiposOcorrencia,
    getOrganizacoes,
    getCadernos,
    getModelosArma,
    getLocalidadePorNome,
    getModalidadesCrime
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
                    getModalidadesCrime()
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

    // ... (resto dos useEffects que não precisam de alteração) ...

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    // ... (funções handleSuggestionClick, handleCepBlur, etc. não precisam de alteração) ...

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        Object.keys(ocorrencia).forEach(key => {
            if (!['envolvidos', 'armas_apreendidas', 'foto_ocorrencia'].includes(key)) {
                if (ocorrencia[key] !== null && ocorrencia[key] !== undefined) {
                    formData.append(key, ocorrencia[key]);
                }
            }
        });
        
        formData.append('envolvidos', JSON.stringify(ocorrencia.envolvidos));
        formData.append('armas_apreendidas', JSON.stringify(ocorrencia.armas_apreendidas));

        // CORREÇÃO: Enviar o ficheiro com o nome esperado pelo backend
        if (fotoFile) {
            formData.append('foto_ocorrencia_upload', fotoFile);
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
            {/* ... (o resto do seu JSX do formulário, sem alterações) ... */}
        </form>
    );
};

export default OcorrenciaForm;
