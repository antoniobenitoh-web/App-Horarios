/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Schedule from './pages/Schedule/Schedule';
import Solicitudes from './pages/Solicitudes/Solicitudes';
import ControlHoras from './pages/ControlHoras/ControlHoras';
import Equipo from './pages/Equipo/Equipo';
import UserManagement from './pages/Admin/UserManagement';
import { ErrorBoundary } from './ErrorBoundary';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div style={{ 
        height: '100dvh', 
        width: '100vw', 
        backgroundColor: 'var(--salesland-primary)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      }}>
        <img 
          src={import.meta.env.BASE_URL + "icon-512.png"} 
          alt="Cargando App Horarios" 
          style={{ width: '180px', height: '180px', animation: 'pulse 2s infinite', borderRadius: '36px' }} 
        />
        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.8; }
              50% { transform: scale(1.05); opacity: 1; }
              100% { transform: scale(0.95); opacity: 0.8; }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="horario" element={<Schedule />} />
            <Route path="solicitudes" element={<Solicitudes />} />
            <Route path="equipo" element={<ErrorBoundary><Equipo /></ErrorBoundary>} />
            <Route path="horas" element={<ErrorBoundary><ControlHoras /></ErrorBoundary>} />\n            <Route path="control-equipo" element={<ErrorBoundary><ControlEquipo /></ErrorBoundary>} />
            <Route path="usuarios" element={<UserManagement />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
