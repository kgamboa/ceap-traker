import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PlanteleDetail from './pages/PlanteleDetail';
import { useRole } from './hooks/useRole';
import './App.css';

function App() {
  const { role, setRole } = useRole();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    // Recargar la página para que React actualice el hook
    window.location.reload();
  };

  return (
    <Router>
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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/:plantelCodigo" element={<PlanteleDetail />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© 2026 DGETI Guanajuato - Sistema de Seguimiento CEAP</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
