import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import PlanteleDetail from './pages/PlanteleDetail';
import { useRole } from './hooks/useRole';
import './App.css';

function App() {
  const { role, setRole } = useRole();
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

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    // Recargar la página para que React actualice el hook
    window.location.reload();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-left">
            <h1 className="app-title">CEAP Tracker</h1>
            <p className="app-subtitle">Sistema de Seguimiento CEAP - DGETI Guanajuato</p>
          </div>
          <div className="app-header-right">
            <div className="role-selector">
              <label>Rol:</label>
              <select value={role} onChange={(e) => handleRoleChange(e.target.value)}>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
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
