import React, { useState } from 'react';
import OcorrenciaList from './OcorrenciaList';
import OcorrenciaDetail from './OcorrenciaDetail';
import OcorrenciaForm from './OcorrenciaForm';

const Home = () => {
    const [selectedOcorrenciaId, setSelectedOcorrenciaId] = useState(null);
    const [editingOcorrencia, setEditingOcorrencia] = useState(null);
    const [refreshList, setRefreshList] = useState(false);

    const handleSelectOcorrencia = (id) => {
        setSelectedOcorrenciaId(id);
        setEditingOcorrencia(null); // Garante que o form não esteja em modo de edição
    };

    const handleEditOcorrencia = (ocorrencia) => {
        setEditingOcorrencia(ocorrencia);
        setSelectedOcorrenciaId(null); // Garante que a visualização de detalhes seja fechada
    };

    const handleFormSuccess = () => {
        setEditingOcorrencia(null);
        setSelectedOcorrenciaId(null);
        setRefreshList(prev => !prev); // Alterna o estado para forçar a atualização da lista
    };

    const handleNewOcorrencia = () => {
        setEditingOcorrencia({}); // Objeto vazio para indicar criação
        setSelectedOcorrenciaId(null);
    };

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
                    />
                </div>
                <div className="details-container">
                    {selectedOcorrenciaId && <OcorrenciaDetail ocorrenciaId={selectedOcorrenciaId} />}
                    {editingOcorrencia && <OcorrenciaForm existingOcorrencia={editingOcorrencia} onSuccess={handleFormSuccess} />}
                </div>
            </div>
        </>
    );
};

export default Home;
