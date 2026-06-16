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
  const [activeTab, setActiveTab] = useState('Semana 1');
  const [activeMonth, setActiveMonth] = useState(null);
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
          if (data.schedule.length > 0) {
            setActiveMonth(data.schedule[0].mes);
            if (data.schedule[0].semanas.length > 0) {
              setActiveTab(data.schedule[0].semanas[0].id);
            }
          }
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

  const handleConfirm = async () => {
    const now = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    
    // Save locally
    setConfirmedWeeks(prev => {
      const updated = { ...prev, [activeTab]: now };
      localStorage.setItem(`confirmed_${user.username}`, JSON.stringify(updated));
      return updated;
    });

    // Send to backend
    if (GAS_URL) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'confirmWeek', 
            username: user.username, 
            weekId: activeTab,
            month: activeMonth
          })
        });
      } catch (err) {
        console.error("Error al sincronizar confirmación:", err);
      }
    }
  };

  const isConfirmed = !!confirmedWeeks[activeTab];
  const confirmDate = confirmedWeeks[activeTab];

  const currentMonthData = horarioMes.find(m => m.mes === activeMonth) || { semanas: [] };
  const currentWeekData = currentMonthData.semanas.find(s => s.id === activeTab);
  const totalHours = currentWeekData ? currentWeekData.detalle.reduce((acc, s) => acc + (Number(s.total) || 0), 0) : 0;
  
  const currentWeekIndex = currentMonthData.semanas.findIndex(s => s.id === activeTab);
  
  const handlePrevWeek = () => {
    if (currentWeekIndex > 0) setActiveTab(currentMonthData.semanas[currentWeekIndex - 1].id);
  };
  
  const handleNextWeek = () => {
    if (currentWeekIndex < currentMonthData.semanas.length - 1) setActiveTab(currentMonthData.semanas[currentWeekIndex + 1].id);
  };

  const currentMonthIndex = horarioMes.findIndex(m => m.mes === activeMonth);
  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      const newMonth = horarioMes[currentMonthIndex - 1];
      setActiveMonth(newMonth.mes);
      if (newMonth.semanas.length > 0) setActiveTab(newMonth.semanas[0].id);
    }
  };
  const handleNextMonth = () => {
    if (currentMonthIndex < horarioMes.length - 1) {
      const newMonth = horarioMes[currentMonthIndex + 1];
      setActiveMonth(newMonth.mes);
      if (newMonth.semanas.length > 0) setActiveTab(newMonth.semanas[0].id);
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Mi Horario</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Consulta tus turnos y confirma la recepción</span>
        </div>
        {user.role === 'promotor' && currentWeekData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isConfirmed ? (
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 'var(--border-radius-full)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={12} /> Confirmado
              </span>
            ) : (
              <button onClick={handleConfirm} style={{ background: 'var(--success)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-full)', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                <CheckCircle2 size={12} /> Confirmar
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.monthSelector} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', background: '#1a1a1a', padding: '0.6rem', borderRadius: 'var(--border-radius-full)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem', width: 'fit-content', margin: '0 auto 1rem auto' }}>
        <button type="button" onClick={handlePrevMonth} disabled={currentMonthIndex <= 0} style={{ background: 'transparent', border: 'none', color: currentMonthIndex <= 0 ? 'rgba(255,255,255,0.2)' : 'var(--text-primary)', cursor: currentMonthIndex <= 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-primary)', minWidth: '100px', textAlign: 'center' }}>
          {activeMonth || 'Mes Actual'}
        </span>
        <button type="button" onClick={handleNextMonth} disabled={currentMonthIndex >= horarioMes.length - 1} style={{ background: 'transparent', border: 'none', color: currentMonthIndex >= horarioMes.length - 1 ? 'rgba(255,255,255,0.2)' : 'var(--text-primary)', cursor: currentMonthIndex >= horarioMes.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {loading && <div className="card">Cargando horario desde Google Sheets...</div>}
      {error && <div className="card">Error: {error}</div>}
      {!loading && !error && horarioMes.length === 0 && <div className="card">No hay horarios planificados para este mes.</div>}

      {!loading && !error && currentMonthData.semanas.length > 0 && (
        <>
          <div className={styles.weekTabs}>
            {currentMonthData.semanas.map((week) => (
              <button
                key={week.id}
                type="button"
                className={`${styles.weekTab} ${activeTab === week.id ? styles.weekTabActive : ''}`}
                onClick={() => setActiveTab(week.id)}
              >
                <span className={styles.weekTabLabel}>Semana {week.semana}</span>
                <span className={styles.weekTabRange}>{week.dias}</span>
              </button>
            ))}
          </div>

          <div className={styles.monthNav}>
            <button type="button" className={styles.navBtn} onClick={handlePrevWeek} disabled={currentWeekIndex <= 0}>
              <ChevronLeft size={20} />
            </button>
            
            <div className={styles.monthInfo}>
              <h3 className={styles.monthTitle}>
                <Calendar size={20} style={{ color: 'var(--accent-primary)' }} />
                Semana {currentWeekData?.semana}
              </h3>
              {currentWeekData && (
                <span className={styles.weekHours}>{totalHours} h esta semana</span>
              )}
            </div>
            
            <button type="button" className={styles.navBtn} onClick={handleNextWeek} disabled={currentWeekIndex >= currentMonthData.semanas.length - 1}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.daysList}>
            <div className={styles.daysHeader}>
              <span className={styles.colDay}>Día</span>
              <span className={styles.colHours}>Horario</span>
              <span className={styles.colShift}>Turno</span>
              <span className={styles.colTotal} style={{ textAlign: 'right' }}>Total</span>
            </div>

            {currentWeekData?.detalle?.map((shift, idx) => {
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

              let horasStyle = { fontWeight: 'bold' };
              const lowerHoras = shift.horas.toLowerCase();
              if (lowerHoras.includes('festivo')) horasStyle.color = '#0284c7';
              else if (lowerHoras.includes('day off')) horasStyle.color = '#16a34a';
              else if (lowerHoras.includes('permiso')) horasStyle.color = '#c026d3';
              else if (lowerHoras.includes('vacaciones')) horasStyle.color = '#7c3aed';
              else if (lowerHoras.includes('baja')) horasStyle.color = '#dc2626';

              return (
                <div key={idx} className={`${styles.dayRow} ${isRest ? styles.dayRowRest : ''}`}>
                  <div className={styles.colDay}>
                    <div className={styles.dayLabel}>
                      <span className={`${styles.dayName} dayNameEl`}>{shift.dia}</span>
                      <span className={`${styles.dayDate} dayDateEl`}>{shift.fecha}</span>
                    </div>
                  </div>

                  <div className={styles.colHours}>
                    {isRest && Object.keys(horasStyle).length === 1 ? (
                      <span className={`${styles.restLabel} restLabelEl`}>— Descanso —</span>
                    ) : (
                      <div className={`${styles.hoursCell} hoursCellEl`} style={horasStyle}>
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
