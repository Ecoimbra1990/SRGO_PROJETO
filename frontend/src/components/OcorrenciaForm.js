import React, { useState, useEffect } from 'react';
import api, {
    getOPMs,
    getTiposOcorrencia,
    getOrganizacoes,
    getCadernos,
    getModelosArma,
    getLocalidadePorNome
} from '../api';
import './OcorrenciaForm.css';

const initialOcorrenciaState = {
    tipo_ocorrencia: '', data_fato: '', descricao_fato: '', fonte_informacao: '',
    evolucao_ocorrencia: '', cep: '', logradouro: '', bairro: '', cidade: '',
    uf: '', latitude: '', longitude: '', opm_area: '', caderno_informativo: '',
    envolvidos: [], armas_apreendidas: []
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
                const [opmsRes, tiposRes, orgsRes, cadernosRes] = await Promise.all([
                    getOPMs(), getTiposOcorrencia(), getOrganizacoes(), getCadernos()
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

    useEffect(() => {
        const logradouro = ocorrencia.logradouro || '';
        if (logradouro.length < 3 || !ocorrencia.cidade || !ocorrencia.uf) {
            setAddressSuggestions([]);
            return;
        }
        const handler = setTimeout(async () => {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${ocorrencia.uf}/${ocorrencia.cidade}/${encodeURIComponent(logradouro)}/json/`);
                const data = await response.json();
                if (data && !data.erro && Array.isArray(data)) {
                    setAddressSuggestions(data);
                } else {
                    setAddressSuggestions([]);
                }
            } catch (error) {
                console.error('Erro ao buscar endereço:', error);
                setAddressSuggestions([]);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [ocorrencia.logradouro, ocorrencia.cidade, ocorrencia.uf]);

    useEffect(() => {
        if (armaSearchTerm.length < 2 || activeSuggestionIndex === null) {
            setArmaSuggestions([]);
            return;
        }
        const handler = setTimeout(async () => {
            try {
                const response = await getModelosArma(armaSearchTerm);
                setArmaSuggestions(response.data || []);
            } catch (error) {
                console.error("Erro ao buscar modelos de arma:", error);
                setArmaSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [armaSearchTerm, activeSuggestionIndex]);

    const fetchCoordinates = async (address) => {
        const apiKey = process.env.REACT_APP_Maps_API_KEY;
        if (!apiKey) {
            console.error("A chave da API do Google Maps não foi definida.");
            return { lat: 'Chave não configurada', lon: 'Chave não configurada' };
        }
        try {
            const addressQuery = `${address.logradouro}, ${address.cidade}, ${address.uf}`;
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressQuery)}&key=${apiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === 'OK' && data.results[0]) {
                const location = data.results[0].geometry.location;
                return { lat: location.lat, lon: location.lng };
            }
        } catch (error) {
            console.error('Erro ao obter coordenadas:', error);
        }
        return { lat: '', lon: '' };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    const handleSuggestionClick = async (suggestion) => {
        const addressData = {
            logradouro: suggestion.logradouro,
            bairro: suggestion.bairro,
            cep: suggestion.cep.replace(/\D/g, ''),
            cidade: suggestion.localidade,
            uf: suggestion.uf,
        };
        setOcorrencia(prev => ({ ...prev, ...addressData, latitude: 'A procurar...', longitude: 'A procurar...' }));
        setAddressSuggestions([]);
        const { lat, lon } = await fetchCoordinates(addressData);
        setOcorrencia(prev => ({ ...prev, ...addressData, latitude: lat, longitude: lon }));
    };

    const handleCepBlur = async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    const addressData = { logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf };
                    setOcorrencia(prev => ({ ...prev, ...addressData, latitude: 'A procurar...', longitude: 'A procurar...' }));
                    const { lat, lon } = await fetchCoordinates(addressData);
                    setOcorrencia(prev => ({ ...prev, ...addressData, latitude: lat, longitude: lon }));
                }
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
            }
        }
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
        const armaAtual = { ...novasArmas[index] };
        armaAtual[name] = value.toUpperCase();
        
        if (['modelo', 'marca', 'calibre', 'tipo', 'especie'].includes(name) && armaAtual.modelo_catalogado) {
            armaAtual.modelo_catalogado = null; 
        }
        novasArmas[index] = armaAtual;
        setOcorrencia(prev => ({ ...prev, armas_apreendidas: novasArmas }));

        if (name === 'modelo') {
            setArmaSearchTerm(value.toUpperCase());
            setActiveSuggestionIndex(index);
        }
    };
    
    const handleArmaSuggestionClick = (suggestion, index) => {
        const novasArmas = [...ocorrencia.armas_apreendidas];
        novasArmas[index] = {
            ...novasArmas[index],
            modelo_catalogado: suggestion.id,
            modelo: suggestion.modelo,
            tipo: suggestion.tipo,
            especie: suggestion.especie,
            marca: suggestion.marca,
            calibre: suggestion.calibre,
        };
        setOcorrencia(prev => ({ ...prev, armas_apreendidas: novasArmas }));
        setArmaSuggestions([]);
        setActiveSuggestionIndex(null);
        setArmaSearchTerm('');
    };

    const adicionarArma = () => {
        setOcorrencia(prev => ({
            ...prev,
            armas_apreendidas: [...prev.armas_apreendidas, { 
                tipo: 'FOGO', especie: 'NAO_DEFINIDA', marca: '', modelo: '', 
                calibre: '', numero_serie: '', observacoes: '' 
            }]
        }));
    };

    const removerArma = (index) => {
        const novasArmas = [...ocorrencia.armas_apreendidas];
        novasArmas.splice(index, 1);
        setOcorrencia(prev => ({ ...prev, armas_apreendidas: novasArmas
