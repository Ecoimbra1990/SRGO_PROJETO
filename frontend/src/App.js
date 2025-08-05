// Arquivo: frontend/src/App.js

import React, { useState } from 'react';
import OcorrenciaForm from './components/OcorrenciaForm';
import OcorrenciaList from './components/OcorrenciaList';
import './App.css';

function App() {
  const [key, setKey] = useState(0);

  const handleOcorrenciaSalva = () => {
    setKey(prevKey => prevKey + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/coppm.png" alt="Logo COPPM" className="App-logo" />
        <h1>SRGO - Sistema de Registo e Gestão de Ocorrências</h1>
      </header>
      <main>
        <OcorrenciaForm onOcorrenciaSalva={handleOcorrenciaSalva} />
        <hr className="divider" />
        <OcorrenciaList key={key} />
      </main>
    </div>
  );
}

export default App;