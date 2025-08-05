// Arquivo: frontend/src/App.js

import React, { useState } from 'react';
import OcorrenciaForm from './components/OcorrenciaForm';
import OcorrenciaList from './components/OcorrenciaList';
import OcorrenciaDetail from './components/OcorrenciaDetail'; // Importe a nova página
import './App.css';

function App() {
  const [view, setView] = useState('list'); // 'list' ou 'detail'
  const [selectedOcorrenciaId, setSelectedOcorrenciaId] = useState(null);
  const [listKey, setListKey] = useState(0);

  const handleOcorrenciaSalva = () => {
    setListKey(prevKey => prevKey + 1);
  };

  const handleOcorrenciaSelect = (id) => {
    setSelectedOcorrenciaId(id);
    setView('detail');
  };

  const handleVoltarClick = () => {
    setSelectedOcorrenciaId(null);
    setView('list');
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="/coppm.png" alt="Logo COPPM" className="App-logo" />
        <h1>SRGO - Sistema de Registo e Gestão de Ocorrências</h1>
      </header>
      <main>
        {/* Renderização condicional: mostra uma página ou outra */}
        {view === 'list' ? (
          <>
            <OcorrenciaForm onOcorrenciaSalva={handleOcorrenciaSalva} />
            <hr className="divider" />
            <OcorrenciaList key={listKey} onOcorrenciaSelect={handleOcorrenciaSelect} />
          </>
        ) : (
          <OcorrenciaDetail 
            ocorrenciaId={selectedOcorrenciaId} 
            onVoltarClick={handleVoltarClick} 
          />
        )}
      </main>
    </div>
  );
}

export default App;