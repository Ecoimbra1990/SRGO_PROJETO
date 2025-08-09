import React, { useState, useEffect } from 'react';
import { getOcorrencias, getOPMs, getTiposOcorrencia, gerarCadernoPDF, gerarCadernoPorFiltroPDF } from '../api';
import './OcorrenciaList.css';

const OcorrenciaList = ({ onSelectOcorrencia, onEditOcorrencia, refresh }) => {
    const [ocorrencias, setOcorrencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ id: '', opm_area: '', bairro: '', tipo_ocorrencia: '', ano: '', mes: '' });
    const [opms, setOpms] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [selectedOcorrencias, setSelectedOcorrencias] = useState([]);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [opmsRes, tiposRes] = await Promise.all([getOPMs(), getTiposOcorrencia()]);
                setOpms(opmsRes.data);
                setTipos(tiposRes.data);
            } catch (err) {
                console.error("Erro ao buscar dados para filtros:", err);
            }
        };
        fetchFilterData();
    }, []);

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
            // Passa o objeto de filtros atual para a API
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
                    {tipos.map(tipo => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}
                </select>
                <input type="text" name="bairro" value={filters.bairro} onChange={handleFilterChange} placeholder="Bairro" />
                <input type="number" name="ano" value={filters.ano} onChange={handleFilterChange} placeholder="Ano (ex: 2025)" />
                <input type="number" name="mes" value={filters.mes} onChange={handleFilterChange} placeholder="Mês (1-12)" min="1" max="12" />
                <button onClick={clearFilters} className="clear-button">Limpar Filtros</button>
                <button onClick={handleGerarPDF} className="pdf-button" disabled={selectedOcorrencias.length === 0}>
                    Gerar Caderno ({selectedOcorrencias.length})
                </button>
                {/* Novo botão para gerar por filtro */}
                <button onClick={handleGerarPDFPorFiltro} className="pdf-button">
                    Gerar por Filtro
                </button>
            </div>

            {loading ? <p>Carregando ocorrências...</p> : 
             error ? <p style={{ color: 'red' }}>{error}</p> :
            <table className="ocorrencia-table">
                <thead>
                    <tr>
                        <th>Sel.</th>
                        <th>Nº</th>
                        <th>Tipo</th>
                        <th>Data do Fato</th>
                        <th>Bairro</th>
                        <th>OPM da Área</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {ocorrencias.length > 0 ? ocorrencias.map(ocorrencia => (
                        <tr 
                            key={ocorrencia.id} 
                            onClick={() => onSelectOcorrencia(ocorrencia.id)}
                            className={selectedOcorrencias.includes(ocorrencia.id) ? 'selected-row' : ''}
                        >
                            <td onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="checkbox"
                                    checked={selectedOcorrencias.includes(ocorrencia.id)}
                                    onChange={() => handleSelectRow(ocorrencia.id)}
                                />
                            </td>
                            <td>{ocorrencia.id}</td>
                            <td>{ocorrencia.tipo_ocorrencia_nome}</td>
                            <td>{new Date(ocorrencia.data_fato).toLocaleDateString('pt-BR')}</td>
                            <td>{ocorrencia.bairro || 'N/A'}</td>
                            <td>{ocorrencia.opm_area_nome || 'N/A'}</td>
                            <td>
                                <button 
                                    className="edit-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditOcorrencia(ocorrencia);
                                    }}
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="7">Nenhum registro encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            }
        </div>
    );
};

export default OcorrenciaList;
