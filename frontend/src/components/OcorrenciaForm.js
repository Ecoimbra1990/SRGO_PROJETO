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

const initialOcorrenciaState = { /* ... */ }; // (Omitido, sem alterações)

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    const [loading, setLoading] = useState(true);
    const [ocorrencia, setOcorrencia] = useState(initialOcorrenciaState);
    const [fotoFile, setFotoFile] = useState(null);
    const [opms, setOpms] = useState([]);
    const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
    const [isHomicidio, setIsHomicidio] = useState(false);
    const [organizacoes, setOrganizacoes] = useState([]);
    const [cadernos, setCadernos] = useState([]);
    const [modalidadesCrime, setModalidadesCrime] = useState([]); // NOVO ESTADO

    // ... (outros estados)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [opmsRes, tiposRes, orgsRes, cadernosRes, modalidadesRes] = await Promise.all([
                    getOPMs(),
                    getTiposOcorrencia(),
                    getOrganizacoes(),
                    getCadernos(),
                    api.get('/api/modalidades-crime/') // NOVA CHAMADA À API
                ]);
                setOpms(opmsRes.data || []);
                setTiposOcorrencia(tiposRes.data || []);
                setOrganizacoes(orgsRes.data || []);
                setCadernos(cadernosRes.data || []);
                setModalidadesCrime(modalidadesRes.data || []); // GUARDA AS MODALIDADES
            } catch (error) {
                console.error('Erro ao carregar dados para o formulário:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    // ... (restante do código do formulário - sem alterações)

    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form" autoComplete="off">
            {/* ... */}
            
            {isHomicidio && (
                <div style={{marginTop: '10px'}}>
                    <label>Tipo do Crime:</label>
                    <select name="tipo_homicidio" value={ocorrencia.tipo_homicidio || ''} onChange={handleInputChange}>
                        <option value="">Selecione a Modalidade...</option>
                        {/* --- DROPDOWN POPULADO DINAMICAMENTE --- */}
                        {modalidadesCrime.map(modalidade => (
                            <option key={modalidade.id} value={modalidade.id}>
                                {modalidade.nome}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            
            {/* ... (restante do JSX do formulário) ... */}
        </form>
    );
};

export default OcorrenciaForm;
