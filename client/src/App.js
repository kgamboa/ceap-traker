
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
          <div className="app-header-left">
            <h1 className="app-title">CEAP Tracker</h1>
            <p className="app-subtitle">Sistema de Seguimiento CEAP - DGETI Guanajuato</p>
            <p className="app-version" style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>v. 1.2.1</p>
          </div>
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
        <p>© 2026 DGETI Guanajuato - Sistema de Seguimiento CEAP</p>
      </footer>
    </div>
  );
}

export default App;
