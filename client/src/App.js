import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import PlanteleDetail from './pages/PlanteleDetail';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' o 'detail'
  const [selectedPlantel, setSelectedPlantel] = useState(null);

  const handlePlanteleSelect = (plantel) => {
    setSelectedPlantel(plantel);
    setView('detail');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedPlantel(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">CEaP Tracker</h1>
          <p className="app-subtitle">Sistema de Seguimiento CEaP - DGETI Guanajuato</p>
        </div>
      </header>

      <main className="app-main">
        {view === 'dashboard' ? (
          <Dashboard onPlanteleSelect={handlePlanteleSelect} />
        ) : (
          <PlanteleDetail plantel={selectedPlantel} onBack={handleBack} />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2026 DGETI Guanajuato - Sistema de Seguimiento CEaP</p>
      </footer>
    </div>
  );
}

export default App;
