import React, { useState, useEffect } from 'react';
import { getOcorrencias, gerarCadernoPDF, gerarCadernoPorFiltroPDF } from '../api';
import './OcorrenciaList.css';

// O componente agora recebe 'opms' e 'tiposOcorrencia' como props
const OcorrenciaList = ({ onSelectOcorrencia, onEditOcorrencia, refresh, opms, tiposOcorrencia }) => {
    const [ocorrencias, setOcorrencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ id: '', opm_area: '', bairro: '', tipo_ocorrencia: '', ano: '', mes: '' });
    const [selectedOcorrencias, setSelectedOcorrencias] = useState([]);

    // O useEffect que buscava os dados dos filtros foi removido, pois agora eles vêm por props.

    useEffect(() => {
        const fetchOcorrencias = async () => {
            try {
                setLoading(true);
                const response = await getOcorrencias(filters);
                setOcorrencias(response.data);
                setError('');
            } catch (err) {
                console.error("Erro ao buscar ocorrências:", err);
                setError('Não foi possível carregar as ocorrências.');
            } finally {
                setLoading(false);
            }
        };
        fetchOcorrencias();
    }, [filters, refresh]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({ id: '', opm_area: '', bairro: '', tipo_ocorrencia: '', ano: '', mes: '' });
    };

    const handleSelectRow = (id) => {
        setSelectedOcorrencias(prevSelected => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter(item => item !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };
    
    const handleGerarPDF = async () => {
        if (selectedOcorrencias.length === 0) {
            alert("Por favor, selecione pelo menos uma ocorrência para gerar o caderno.");
            return;
        }
        try {
            const response = await gerarCadernoPDF(selectedOcorrencias);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'caderno_informativo.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Erro ao gerar PDF:", err);
            setError("Não foi possível gerar o PDF.");
        }
    };

    const handleGerarPDFPorFiltro = async () => {
        try {
            const response = await gerarCadernoPorFiltroPDF(filters);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'caderno_informativo_filtrado.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Erro ao gerar PDF por filtro:", err);
            setError("Não foi possível gerar o PDF com os filtros atuais.");
        }
    };

    return (
        <div className="ocorrencia-list-container">
            <h3>Registros de Ocorrências</h3>
            <div className="filter-bar">
                <input type="number" name="id" value={filters.id} onChange={handleFilterChange} placeholder="Nº da Ocorrência" />
                <select name="opm_area" value={filters.opm_area} onChange={handleFilterChange}>
                    <option value="">Todas as OPMs</option>
                    {opms.map(opm => <option key={opm.id} value={opm.id}>{opm.nome}</option>)}
                </select>
                <select name="tipo_ocorrencia" value={filters.tipo_ocorrencia} onChange={handleFilterChange}>
                    <option value="">Todos os Tipos</option>
                    {tiposOcorrencia.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}
                </select>
                <input type="text" name="bairro" value={filters.bairro} onChange={handleFilterChange} placeholder="Bairro" />
                <input type="number" name="ano" value={filters.ano} onChange={handleFilterChange} placeholder="Ano (ex: 2025)" />
                <input type="number" name="mes" value={filters.mes} onChange={handleFilterChange} placeholder="Mês (1-12)" min="1" max="12" />
                <button onClick={clearFilters} className="clear-button">Limpar Filtros</button>
                <button onClick={handleGerarPDF} className="pdf-button" disabled={selectedOcorrencias.length === 0}>
                    Gerar Caderno ({selectedOcorrencias.length})
                </button>
                <button onClick={handleGerarPDFPorFiltro} className="pdf-button">
                    Gerar por Filtro
                </button>
            </div>

            {loading ? <p>Carregando ocorrências...</p> : 
             error ? <p style={{ color: 'red' }}>{error}</p> :
            <table className="ocorrencia-table">
                {/* ... (o resto do seu JSX da tabela permanece igual) ... */}
            </table>
            }
        </div>
    );
};

export default OcorrenciaList;
