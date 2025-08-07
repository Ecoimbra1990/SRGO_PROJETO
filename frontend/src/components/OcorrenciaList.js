// frontend/src/components/OcorrenciaList.js

import React, { useState, useEffect } from 'react';
import { getOcorrencias, getOPMs, getTiposOcorrencia } from '../api';
import './OcorrenciaList.css';

const OcorrenciaList = ({ onSelectOcorrencia, onEditOcorrencia, refresh }) => {
    const [ocorrencias, setOcorrencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para os filtros
    const [filters, setFilters] = useState({
        id: '', opm_area: '', bairro: '', tipo_ocorrencia: '', ano: '', mes: ''
    });
    const [opms, setOpms] = useState([]);
    const [tipos, setTipos] = useState([]);

    // Busca os dados para os dropdowns dos filtros
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

    // Busca as ocorrências sempre que os filtros ou o sinal de refresh mudam
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

    return (
        <div className="ocorrencia-list-container">
            <h3>Registros de Ocorrências</h3>

            {/* Formulário de Filtros */}
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
            </div>

            {loading ? <p>Carregando ocorrências...</p> : 
             error ? <p style={{ color: 'red' }}>{error}</p> :
            <table className="ocorrencia-table">
                <thead>
                    <tr>
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
                        <tr key={ocorrencia.id} onClick={() => onSelectOcorrencia(ocorrencia.id)}>
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
                            <td colSpan="6">Nenhum registro encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            }
        </div>
    );
};

export default OcorrenciaList;
