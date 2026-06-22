/* eslint-disable */
import React from 'react';
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
            <Route path="horas" element={<ErrorBoundary><ControlHoras /></ErrorBoundary>} />
            <Route path="usuarios" element={<UserManagement />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
