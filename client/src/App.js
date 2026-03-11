import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PlanteleDetail from './pages/PlanteleDetail';
import { useRole } from './hooks/useRole';
import './App.css';

function App() {
  const { role, setRole } = useRole();

  const [showLogin, setShowLogin] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorText, setErrorText] = React.useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    window.location.reload();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'AdminRoot') {
      handleRoleChange('admin');
    } else {
      setErrorText('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    handleRoleChange('user');
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
                {role === 'admin' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'white' }}>Administrador</span>
                    <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.25rem 0.5rem', fontSize: '14px' }}>
                      Cerrar sesión
                    </button>
                  </div>
                ) : showLogin ? (
                  <form onSubmit={handleLogin} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: '0.25rem' }} />
                    <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '0.25rem' }} />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Entrar</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowLogin(false)} style={{ padding: '0.25rem 0.5rem' }}>Cancelar</button>
                    {errorText && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errorText}</span>}
                  </form>
                ) : (
                  <button className="btn btn-primary" onClick={() => setShowLogin(true)}>
                    Iniciar sesión
                  </button>
                )}
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
