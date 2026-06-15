import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Clock, Users, CalendarClock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const GAS_URL = import.meta.env.VITE_GAS_URL;
  
  const [nextShift, setNextShift] = useState({ loading: true, data: null });
  const [managerStats, setManagerStats] = useState({ teamSize: 0, pendingRequests: 0, loading: true });

  useEffect(() => {
    const fetchNextShift = async () => {
      if (user.role !== 'promotor' || !GAS_URL) return;
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getSchedule', username: user.username })
        });
        const data = await res.json();
        if (data.success && data.schedule) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let found = null;
          // Buscar el próximo turno
          for (const week of data.schedule) {
            for (const shift of week.detalle) {
              const shiftDate = new Date(shift.fecha);
              shiftDate.setHours(0,0,0,0);
              
              const isRest = (shift.turno || '').toLowerCase() === 'descanso' || (shift.horas || '').toLowerCase().includes('descanso');
              
              if (shiftDate > today && !isRest) {
                found = {
                  dia: shift.dia,
                  fecha: shift.fecha,
                  horas: shift.horas,
                  turno: shift.turno || 'Mañana'
                };
                break;
              }
            }
            if (found) break;
          }
          setNextShift({ loading: false, data: found });
        }
      } catch (err) {
        setNextShift({ loading: false, data: null });
      }
    };

    const fetchManagerData = async () => {
      if ((user.role !== 'gpv' && user.role !== 'am' && user.role !== 'coordinadora' && user.role !== 'trainer') || !GAS_URL) return;
      try {
        // Fetch usuarios
        const resUsers = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getUsers' })
        });
        const dataUsers = await resUsers.json();
        let tSize = 0;
        if (dataUsers.success) {
          tSize = dataUsers.users.filter(u => 
            u.role === 'promotor' && 
            (u.manager.gpv === user.name || u.manager.am === user.name || user.role === 'coordinadora' || user.role === 'trainer')
          ).length;
        }

        // Fetch solicitudes
        const resSols = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getSolicitudes', username: user.username, role: user.role, name: user.name })
        });
        const dataSols = await resSols.json();
        let pending = 0;
        if (dataSols.success) {
          pending = dataSols.solicitudes.filter(s => s.estado === 'pendiente').length;
        }

        setManagerStats({ teamSize: tSize, pendingRequests: pending, loading: false });
      } catch (err) {
        setManagerStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchNextShift();
    fetchManagerData();
  }, [user, GAS_URL]);

  return (
    <div>
      {/* Saludo */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#1a1a1a', fontSize: '1.6rem' }}>Hola, {user.name} 👋</h2>
        <p style={{ color: '#555555', marginTop: '0.25rem' }}>Bienvenido al portal de promotores. Aquí tienes el resumen de tu actividad.</p>
      </div>

      {/* Panel de Coordinación - siempre primero para promotores */}
      {user.role === 'promotor' && user.manager && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', fontSize: '1rem' }}>
            👥 Mi Equipo de Coordinación
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {[
              { rol: 'GPV', nombre: user.manager.gpv },
              { rol: 'Area Manager', nombre: user.manager.am },
              { rol: 'Coordinadora', nombre: user.manager.coordinadora },
            ].map(({ rol, nombre }) => (
              <div key={rol} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{rol}</p>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{nombre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tarjetas de acceso rápido */}
      {user.role === 'promotor' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Próximo turno */}
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/horario')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--accent-light)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                <CalendarDays size={28} />
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Próximo Turno</p>
            {nextShift.loading ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Cargando turno...</p>
            ) : nextShift.data ? (
              <p style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{nextShift.data.dia}, {nextShift.data.horas}</p>
            ) : (
              <p style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Sin turnos programados</p>
            )}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>📍 {user.centro || 'Centro no asignado'}</p>
          </div>

          {/* Balance de horas */}
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/horas')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.12)', borderRadius: '10px', color: 'var(--success)' }}>
                <Clock size={28} />
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Balance de Horas</p>
            <p style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', marginBottom: '0.25rem' }}>0 h</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>✓ Mes actual compensado</p>
          </div>

          {/* Estado horario */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.12)', borderRadius: '10px', color: 'var(--warning)' }}>
                <AlertCircle size={28} />
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Horario Junio</p>
            <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--warning)', marginBottom: '0.5rem' }}>⏳ Pendiente de confirmar</p>
            <button className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '0.4rem 0.875rem' }}
              onClick={() => navigate('/horario')}>
              <CheckCircle2 size={14} /> Confirmar lectura
            </button>
          </div>
        </div>
      )}

      {/* Dashboard para GPV/AM/Coordinadora/Trainer */}
      {(user.role === 'gpv' || user.role === 'am' || user.role === 'coordinadora' || user.role === 'trainer') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/equipo')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--accent-light)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                <Users size={28} />
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Mi Equipo</p>
            <p style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {managerStats.loading ? '...' : managerStats.teamSize}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Promotores asignados</p>
          </div>

          {user.role !== 'trainer' && (
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/solicitudes')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.12)', borderRadius: '10px', color: 'var(--warning)' }}>
                <CalendarClock size={28} />
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Solicitudes Pendientes</p>
            <p style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--warning)', marginBottom: '0.25rem' }}>
              {managerStats.loading ? '...' : managerStats.pendingRequests}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Requieren atención</p>
            </div>
          )}

          {user.role !== 'trainer' && (
            <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/horas')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.12)', borderRadius: '10px', color: 'var(--info)' }}>
                <CalendarDays size={28} />
              </div>
              <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Mes Actual</p>
            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
              {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Ver horarios de tu equipo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
