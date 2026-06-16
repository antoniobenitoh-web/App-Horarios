import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Schedule.module.css';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar, MapPin, Clock, Sun, Moon, Coffee, CalendarDays } from 'lucide-react';

const shiftConfig = {
  'Mañana':  { icon: <Sun size={15} />,     color: 'var(--warning)',        bg: 'rgba(245,158,11,0.12)'  },
  'Tarde':   { icon: <Moon size={15} />,    color: 'var(--accent-primary)', bg: 'rgba(255,103,0,0.12)'   },
  'Partido': { icon: <Clock size={15} />,   color: 'var(--info)',           bg: 'rgba(59,130,246,0.12)'  },
  'Descanso':{ icon: <Coffee size={15} />,  color: 'var(--success)',        bg: 'rgba(34,197,94,0.1)'    },
};

const normalizeTurno = (t) => {
  if (!t) return null;
  const l = t.toLowerCase().trim();
  if (l.includes('mañana') || l.includes('manana')) return 'Mañana';
  if (l.includes('tarde')) return 'Tarde';
  if (l.includes('partido')) return 'Partido';
  if (l.includes('descanso')) return 'Descanso';
  return null;
};

export default function Schedule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [horarioMes, setHorarioMes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmedWeeks, setConfirmedWeeks] = useState(() => {
    try {
      const stored = localStorage.getItem(`confirmed_${user.username}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const GAS_URL = import.meta.env.VITE_GAS_URL;

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        if (!GAS_URL) throw new Error("Base de datos no configurada");
        
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getSchedule', name: user.name })
        });
        const data = await res.json();
        
        if (data.success) {
          setHorarioMes(data.schedule);
          if (data.schedule.length > 0) setActiveTab(data.schedule[0].id);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user.name, GAS_URL]);

  const handleConfirm = () => {
    const now = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    setConfirmedWeeks(prev => {
      const updated = { ...prev, [activeTab]: now };
      localStorage.setItem(`confirmed_${user.username}`, JSON.stringify(updated));
      return updated;
    });
  };

  const isConfirmed = !!confirmedWeeks[activeTab];
  const confirmDate = confirmedWeeks[activeTab];

  const currentWeekData = horarioMes.find(s => s.id === activeTab);
  const totalHours = currentWeekData ? currentWeekData.detalle.reduce((acc, s) => acc + s.total, 0) : 0;

  return (
    <div className={styles.container}>

      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Mi Horario</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Consulta tus turnos y confirma la recepción</span>
        </div>
        {user.role === 'promotor' && (
          <div className={styles.confirmationBox}>
            <div className={styles.status}>
              <span className={styles.statusDot} style={{ backgroundColor: isConfirmed ? 'var(--success)' : 'var(--warning)' }} />
              {isConfirmed ? 'Horario confirmado' : 'Pendiente de confirmar'}
            </div>
            {!isConfirmed ? (
              <button className="btn btn-primary" onClick={handleConfirm}>
                <CheckCircle2 size={16} /> He revisado mi horario
              </button>
            ) : (
              <div className={styles.confirmedInfo}>
                <CheckCircle2 size={16} />
                <span>Leído: {confirmDate}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.monthSelector} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={styles.currentMonth}>Mes Actual</span>
        <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarDays size={16} /> Ver otro mes
        </button>
      </div>

      {loading && <div className="card">Cargando horario desde Google Sheets...</div>}
      {error && <div className="card">Error: {error}</div>}
      {!loading && !error && horarioMes.length === 0 && <div className="card">No hay horarios planificados para este mes.</div>}

      {!loading && !error && horarioMes.length > 0 && (
        <>
          <div className={styles.weekTabs}>
            {horarioMes.map((week) => (
              <button
                key={week.id}
                className={`${styles.weekTab} ${activeTab === week.id ? styles.weekTabActive : ''}`}
                onClick={() => setActiveTab(week.id)}
              >
                <span className={styles.weekTabLabel}>Semana {week.semana}</span>
                <span className={styles.weekTabRange}>{week.dias}</span>
              </button>
            ))}
          </div>

          <div className={styles.monthNav}>
            <button className={styles.navBtn}><ChevronLeft size={18} /></button>
            <div className={styles.monthInfo}>
              <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
              <h3 className={styles.monthTitle}>Semana {currentWeekData?.semana}</h3>
              {currentWeekData && (
                <span className={styles.weekHours}>{totalHours} h esta semana</span>
              )}
            </div>
            <button className={styles.navBtn}><ChevronRight size={18} /></button>
          </div>

          <div className={styles.daysList}>
            <div className={styles.daysHeader}>
              <span className={styles.colDay}>Día</span>
              <span className={styles.colHours}>Horario</span>
              <span className={styles.colShift}>Turno</span>
              <span className={styles.colTotal}>Horas</span>
            </div>

            {currentWeekData && currentWeekData.detalle.map((shift, idx) => {
              // Determinar turno visual
              let shiftType = normalizeTurno(shift.turno);
              if (!shiftType) { // Fallback por si hay filas antiguas
                shiftType = 'Mañana';
                if (shift.horas === 'Descanso' || shift.horas === '-') shiftType = 'Descanso';
                else if (shift.horas.includes('/')) shiftType = 'Partido';
                else if (shift.horas.startsWith('14') || shift.horas.startsWith('15') || shift.horas.startsWith('16')) shiftType = 'Tarde';
              }
              
              const cfg = shiftConfig[shiftType] || shiftConfig['Descanso'];
              const isRest = shiftType === 'Descanso' || shift.horas.toLowerCase().includes('descanso');

              let horasStyle = { color: 'white', fontWeight: 'bold' };
              const lowerHoras = shift.horas.toLowerCase();
              if (lowerHoras.includes('festivo')) horasStyle = { color: '#0ea5e9', fontWeight: 'bold' };
              else if (lowerHoras.includes('day off')) horasStyle = { color: '#22c55e', fontWeight: 'bold' };
              else if (lowerHoras.includes('permiso')) horasStyle = { color: '#d946ef', fontWeight: 'bold' };
              else if (lowerHoras.includes('vacaciones')) horasStyle = { color: '#8b5cf6', fontWeight: 'bold' };
              else if (lowerHoras.includes('baja')) horasStyle = { color: '#ef4444', fontWeight: 'bold' };

              return (
                <div key={idx} className={`${styles.dayRow} ${isRest ? styles.dayRowRest : ''}`}>
                  <div className={styles.colDay}>
                    <div className={styles.dayLabel}>
                      <span className={styles.dayName}>{shift.dia}</span>
                      <span className={styles.dayDate}>{shift.fecha}</span>
                    </div>
                  </div>

                  <div className={styles.colHours}>
                    {isRest && Object.keys(horasStyle).length === 0 ? (
                      <span className={styles.restLabel}>— Descanso —</span>
                    ) : (
                      <div className={styles.hoursCell} style={horasStyle}>
                        <Clock size={14} style={{ color: horasStyle.color ? 'inherit' : 'var(--text-tertiary)', flexShrink: 0 }} />
                        <span>{shift.horas}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.colShift}>
                    <span className={styles.shiftBadge} style={{ color: cfg.color, background: cfg.bg }}>
                      {cfg.icon} {shiftType}
                    </span>
                  </div>

                  <div className={styles.colTotal}>
                    {shift.total > 0 ? (
                      <span className={styles.totalHours}>{shift.total} h</span>
                    ) : (
                      <span className={styles.totalRest}>—</span>
                    )}
                  </div>
                </div>
              );
            })}

            {currentWeekData && (
              <div className={styles.daysFooter}>
                <span>Total semana</span>
                <span className={styles.footerTotal}>{totalHours} horas</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
