import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './OcorrenciaForm.css';

const OcorrenciaForm = () => {
    const navigate = useNavigate();
    const [ocorrencia, setOcorrencia] = useState({
        numero_ocorrencia: '',
        data_ocorrencia: '',
        hora_ocorrencia: '',
        opm_area: '',
        bairro: '',
        endereco: '',
        tipo_crime: '',
        descricao: '',
        autor_id: '',
        vitima_id: '',
    });
    const [opms, setOpms] = useState([]);
    const [efetivo, setEfetivo] = useState([]);
    const [filteredEfetivo, setFilteredEfetivo] = useState([]);

    useEffect(() => {
        const fetchEfetivo = async () => {
            try {
                const response = await api.get('/efetivo/');
                setEfetivo(response.data);
                const unidades = [...new Set(response.data.map(item => item.unidade))].sort();
                setOpms(unidades);
            } catch (error) {
                console.error('Erro ao buscar efetivo:', error);
            }
        };

        fetchEfetivo();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOcorrencia({ ...ocorrencia, [name]: value });

        // Corrigido: usar 'opm_area' para filtrar
        if (name === 'opm_area') {
            const filtered = efetivo.filter(policial => policial.unidade === value);
            setFilteredEfetivo(filtered);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/ocorrencias/', ocorrencia);
            navigate('/');
        } catch (error) {
            console.error('Erro ao criar ocorrência:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Registrar Nova Ocorrência</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Número da Ocorrência</label>
                    <input type="text" name="numero_ocorrencia" value={ocorrencia.numero_ocorrencia} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Data da Ocorrência</label>
                    <input type="date" name="data_ocorrencia" value={ocorrencia.data_ocorrencia} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Hora da Ocorrência</label>
                    <input type="time" name="hora_ocorrencia" value={ocorrencia.hora_ocorrencia} onChange={handleInputChange} required />
                </div>
                
                <h3>Endereço</h3>
                <div className="form-group">
                    {/* Corrigido: name e value para 'opm_area' */}
                    <label>OPM da Área</label>
                    <select name="opm_area" value={ocorrencia.opm_area} onChange={handleInputChange} required>
                        <option value="">-- Selecione a OPM da Área --</option>
                        {opms.map(opm => (
                            <option key={opm} value={opm}>{opm}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Bairro</label>
                    <input type="text" name="bairro" value={ocorrencia.bairro} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Endereço</label>
                    <input type="text" name="endereco" value={ocorrencia.endereco} onChange={handleInputChange} required />
                </div>

                <h3>Detalhes do Crime</h3>
                <div className="form-group">
                    <label>Tipo de Crime</label>
                    <input type="text" name="tipo_crime" value={ocorrencia.tipo_crime} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Descrição</label>
                    <textarea name="descricao" value={ocorrencia.descricao} onChange={handleInputChange} required></textarea>
                </div>

                <h3>Envolvidos</h3>
                <div className="form-group">
                    <label>Autor</label>
                    <select name="autor_id" value={ocorrencia.autor_id} onChange={handleInputChange}>
                        <option value="">-- Selecione o Policial (Autor) --</option>
                        {filteredEfetivo.map(policial => (
                            <option key={policial.id} value={policial.id}>{policial.nome_guerra} - {policial.mat}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Vítima</label>
                     <select name="vitima_id" value={ocorrencia.vitima_id} onChange={handleInputChange}>
                        <option value="">-- Selecione o Policial (Vítima) --</option>
                        {filteredEfetivo.map(policial => (
                            <option key={policial.id} value={policial.id}>{policial.nome_guerra} - {policial.mat}</option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="submit-btn">Registrar</button>
            </form>
        </div>
    );
};

export default OcorrenciaForm;
