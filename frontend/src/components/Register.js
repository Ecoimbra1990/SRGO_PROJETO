import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';

const Register = () => {
    const [matricula, setMatricula] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            // Enviamos a matrícula e a password
            await registerUser({ matricula, password });
            setSuccess('Utilizador registado com sucesso! Você será redirecionado para o login.');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            // Mostra a mensagem de erro vinda da API
            const errorMessage = err.response?.data?.matricula?.[0] || 'Falha no registro. Verifique a matrícula.';
            setError(errorMessage);
            console.error(err);
        }
    };

    return (
        <div className="auth-container">
            <h2>Registro de Novo Usuário</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Matrícula:</label>
                    <input
                        type="text"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Senha:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <button type="submit" className="auth-button">Registrar</button>
            </form>
            <p>
                Já tem uma conta? <Link to="/login">Faça o login</Link>
            </p>
        </div>
    );
};

export default Register;
