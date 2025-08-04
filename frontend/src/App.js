import React from 'react';
import OcorrenciaForm from './components/OcorrenciaForm';
import './App.css'; // Vamos criar este arquivo a seguir

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SRGO - Registro de Ocorrência</h1>
      </header>
      <main>
        <OcorrenciaForm />
      </main>
    </div>
  );
}

export default App;