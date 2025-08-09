import React, { useState, useEffect } from 'react';
import OcorrenciaList from './OcorrenciaList';
import OcorrenciaDetail from './OcorrenciaDetail';
import OcorrenciaForm from './OcorrenciaForm';
import { getOPMs, getTiposOcorrencia, getOrganizacoes, getCadernos, getModalidadesCrime } from '../api';

const Home = () => {
    const [selectedOcorrenciaId, setSelectedOcorrenciaId] = useState(null);
    const [editingOcorrencia, setEditingOcorrencia] = useState(null);
    const [refreshList, setRefreshList] = useState(false);
    
    // Estado centralizado para os dados dos dropdowns
    const [lookupData, setLookupData] = useState({
        opms: [],
        tiposOcorrencia: [],
        organizacoes: [],
        cadernos: [],
        modalidadesCrime: [],
        loading: true
    });

    // Carrega todos os dados necessários para a aplicação uma única vez
    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const [opmsRes, tiposRes, orgsRes, cadernosRes, modalidadesRes] = await Promise.all([
                    getOPMs(),
                    getTiposOcorrencia(),
                    getOrganizacoes(),
                    getCadernos(),
                    getModalidadesCrime()
                ]);
                setLookupData({
                    opms: opmsRes.data || [],
                    tiposOcorrencia: tiposRes.data || [],
                    organizacoes: orgsRes.data || [],
                    cadernos: cadernosRes.data || [],
                    modalidadesCrime: modalidadesRes.data || [],
                    loading: false
                });
            } catch (error) {
                console.error('Erro fatal ao carregar dados da aplicação:', error);
                setLookupData(prev => ({ ...prev, loading: false }));
            }
        };
        fetchLookupData();
    }, []);

    const handleSelectOcorrencia = (id) => {
        setSelectedOcorrenciaId(id);
        setEditingOcorrencia(null);
    };

    const handleEditOcorrencia = (ocorrencia) => {
        setEditingOcorrencia(ocorrencia);
        setSelectedOcorrenciaId(null);
    };

    const handleFormSuccess = () => {
        setEditingOcorrencia(null);
        setSelectedOcorrenciaId(null);
        setRefreshList(prev => !prev);
    };

    const handleNewOcorrencia = () => {
        setEditingOcorrencia({});
        setSelectedOcorrenciaId(null);
    };

    if (lookupData.loading) {
        return <p>Carregando dados da aplicação...</p>;
    }

    return (
        <>
            <div className="content-area">
                <div className="list-container">
                    <button onClick={handleNewOcorrencia} className="new-button">
                        + Nova Ocorrência
                    </button>
                    <OcorrenciaList
                        onSelectOcorrencia={handleSelectOcorrencia}
                        onEditOcorrencia={handleEditOcorrencia}
                        refresh={refreshList}
                        opms={lookupData.opms}
                        tiposOcorrencia={lookupData.tiposOcorrencia}
                    />
                </div>
                <div className="details-container">
                    {selectedOcorrenciaId && <OcorrenciaDetail ocorrenciaId={selectedOcorrenciaId} />}
                    {editingOcorrencia && (
                        <OcorrenciaForm 
                            existingOcorrencia={editingOcorrencia} 
                            onSuccess={handleFormSuccess}
                            lookupData={lookupData}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;
