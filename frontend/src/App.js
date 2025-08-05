import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import './App.css';

// Componente para proteger rotas
const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('accessToken');
    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
    };

    return (
        <Router>
            <div className="App">
                <header className="App-header">
                    <img src="/coppm.png" alt="logo" className="logo" />
                    <h1>SRGO - Sistema de Registro e Gestão de Ocorrências</h1>
                    {isAuthenticated && (
                         <button onClick={handleLogout} className="logout-button">Logout</button>
                    )}
                </header>
                <main>
                    <Routes>
                        <Route path="/login" element={<Login onLogin={handleLogin} />} />
                        <Route path="/register" element={<Register />} />
                        <Route 
                            path="/" 
                            element={
                                <PrivateRoute>
                                    <Home />
                                </PrivateRoute>
                            } 
                        />
                        {/* Redireciona para a home se a rota não for encontrada e estiver logado */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
