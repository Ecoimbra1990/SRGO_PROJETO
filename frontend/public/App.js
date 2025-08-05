// Arquivo: frontend/src/App.js

import React from 'react';
import OcorrenciaForm from './components/OcorrenciaForm';
import OcorrenciaList from './components/OcorrenciaList'; // Importa o novo componente
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src="/logo_coppm.png" alt="Logo COPPM" className="App-logo" />
        <h1>SRGO - Sistema de Registo e Gestão de Ocorrências</h1>
      </header>
      <main>
        {/* O formulário de registo */}
        <OcorrenciaForm />

        {/* Divisor visual */}
        <hr className="divider" />

        {/* A nova lista de ocorrências */}
        <OcorrenciaList />
      </main>
    </div>
  );
}

export default App;