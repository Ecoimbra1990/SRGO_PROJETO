import React, { useState, useEffect } from 'react';
import api from '../api';
import './OcorrenciaForm.css';

const initialOcorrenciaState = { /* ... */ }; // (Omitido para brevidade, sem alterações)

const OcorrenciaForm = ({ existingOcorrencia, onSuccess }) => {
    const [ocorrencia, setOcorrencia] = useState(initialOcorrenciaState);
    const [fotoFile, setFotoFile] = useState(null); // Novo estado para o ficheiro da foto
    const [tiposOcorrencia, setTiposOcorrencia] = useState([]);
    const [isHomicidio, setIsHomicidio] = useState(false); // Novo estado para controlar o dropdown condicional
    // ... (outros estados como opms, cadernos, etc.)

    useEffect(() => {
        // ... (lógica para carregar dados iniciais - sem alterações)
    }, []);
    
    // Efeito para verificar se a ocorrência é um homicídio
    useEffect(() => {
        const tipoSelecionado = tiposOcorrencia.find(t => t.id === parseInt(ocorrencia.tipo_ocorrencia));
        if (tipoSelecionado && tipoSelecionado.nome.toUpperCase().includes('HOMICÍDIO DOLOSO')) {
            setIsHomicidio(true);
        } else {
            setIsHomicidio(false);
            // Limpa o campo se deixar de ser um homicídio
            setOcorrencia(prev => ({ ...prev, tipo_homicidio: null }));
        }
    }, [ocorrencia.tipo_ocorrencia, tiposOcorrencia]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // FormData é necessário para enviar ficheiros
        const formData = new FormData();

        // Adiciona todos os campos da ocorrência ao FormData
        Object.keys(ocorrencia).forEach(key => {
            // Não adiciona os campos de array diretamente
            if (!['envolvidos', 'armas_apreendidas'].includes(key)) {
                if (ocorrencia[key] !== null && ocorrencia[key] !== undefined) {
                    formData.append(key, ocorrencia[key]);
                }
            }
        });
        
        // Adiciona os arrays como JSON stringificado
        formData.append('envolvidos', JSON.stringify(ocorrencia.envolvidos));
        formData.append('armas_apreendidas', JSON.stringify(ocorrencia.armas_apreendidas));

        // Adiciona o ficheiro da foto se existir
        if (fotoFile) {
            formData.append('foto_ocorrencia', fotoFile);
        }
        
        try {
            if (ocorrencia.id) {
                // Para PUT, a API do DRF espera os dados de formulário
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

    // ... (restante da lógica do formulário: adicionar/remover pessoas, armas, etc.)

    return (
        <form onSubmit={handleSubmit} className="ocorrencia-form" autoComplete="off">
            <h2>{ocorrencia.id ? 'Editar Ocorrência' : 'Registrar Nova Ocorrência'}</h2>

            <div className="form-section">
                <h3>Informações Gerais</h3>
                {/* ... (outros campos) ... */}
                <select name="tipo_ocorrencia" value={ocorrencia.tipo_ocorrencia || ''} onChange={handleInputChange} required>
                    <option value="">Selecione o Tipo de Ocorrência</option>
                    {tiposOcorrencia.map(tipo => (<option key={tipo.id} value={tipo.id}>{tipo.nome}</option>))}
                </select>

                {/* --- DROPDOWN CONDICIONAL --- */}
                {isHomicidio && (
                    <div style={{marginTop: '10px'}}>
                        <label>Tipo do Crime:</label>
                        <select name="tipo_homicidio" value={ocorrencia.tipo_homicidio || ''} onChange={handleInputChange}>
                            <option value="">Selecione...</option>
                            <option value="MASCULINA">Vítima Masculina</option>
                            <option value="FEMININA">Vítima Feminina (Feminicídio)</option>
                            <option value="CONFRONTO">Oposição à Intervenção Policial</option>
                            <option value="OUTRO">Outro</option>
                        </select>
                    </div>
                )}
                
                {/* --- CAMPO DE UPLOAD DE FOTO --- */}
                <div style={{marginTop: '10px'}}>
                    <label>Foto da Ocorrência (opcional):</label>
                    <input type="file" name="foto_ocorrencia" onChange={handleFileChange} />
                </div>

                {/* ... (restante dos campos da secção) ... */}
            </div>

            {/* ... (outras secções do formulário: Localização, Pessoas, Armas) ... */}
            
            <button type="submit" className="submit-button">Salvar Ocorrência</button>
        </form>
    );
};

export default OcorrenciaForm;
