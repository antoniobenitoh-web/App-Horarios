/* eslint-disable */
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
  const [viewMode, setViewMode] = useState('monthly');
  const [activeMonth, setActiveMonth] = useState(null);
  const [horarioMes, setHorarioMes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const todayIso = new Date().toISOString().split('T')[0];
  const getIsoFromDateString = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) return dateStr;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return '';
  };
  const [confirmedWeeks, setConfirmedWeeks] = useState(() => {
    try {
      const stored = localStorage.getItem(`confirmed_v2_${user.name}`);
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
          
          // Sync confirmaciones back from the backend
          const backendConfirms = {};
          data.schedule.forEach(m => {
            m.semanas.forEach(s => {
              if (s.confirmado) {
                backendConfirms[s.id] = s.fechaConfirmacion || new Date().toISOString();
              }
            });
          });
          
          setConfirmedWeeks(prev => {
            const merged = { ...prev, ...backendConfirms };
            // Ensure any local confirm that doesn't exist in backend is REMOVED! (reset sync)
            const trueSynced = { ...backendConfirms };
            // Wait, to allow true reset: ONLY trust backend if backend sends confirmed
            // Actually, if we just use backendConfirms it will correctly RESET if deleted from sheets!
            localStorage.setItem(`confirmed_v2_${user.name}`, JSON.stringify(trueSynced));
            return trueSynced;
          });

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
    setConfirmedWeeks(prev => {
      const updated = { ...prev, [activeTab]: new Date().toISOString() };
      localStorage.setItem(`confirmed_v2_${user.name}`, JSON.stringify(updated));
      return updated;
    });

    // Send to backend
    if (GAS_URL) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'confirmWeek', 
            name: user.name, 
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
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>
            <CalendarDays size={24} /> Mi Horario
          </h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Consulta tus turnos y confirma la recepción</span>
        </div>

        {user.role === 'promotor' && currentWeekData && viewMode === 'weekly' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isConfirmed ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(34,197,94,0.1)', color: 'var(--success)', padding: '0.3rem 0.8rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(34,197,94,0.3)' }}>
                <CheckCircle2 size={14} /> Confirmado
              </span>
            ) : (
              <button onClick={handleConfirm} className="glow-effect" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-full)', padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,103,0,0.3)' }}>
                <Clock size={14} /> Pendiente
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
        <div className={styles.viewToggle}>
          <button className={`${styles.viewToggleBtn} ${viewMode === 'monthly' ? styles.viewToggleBtnActive : ''}`} onClick={() => setViewMode('monthly')}>
            <Calendar size={16} /> Mensual
          </button>
          <button className={`${styles.viewToggleBtn} ${viewMode === 'weekly' ? styles.viewToggleBtnActive : ''}`} onClick={() => setViewMode('weekly')}>
            <CalendarDays size={16} /> Semanal
          </button>
        </div>
      </div>

      <div className={styles.monthSelector} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.6rem', borderRadius: 'var(--border-radius-full)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem', width: 'fit-content', margin: '0 auto 1rem auto' }}>
        <button type="button" onClick={handlePrevMonth} disabled={currentMonthIndex <= 0} style={{ background: 'transparent', border: 'none', color: currentMonthIndex <= 0 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)', cursor: currentMonthIndex <= 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-primary)', minWidth: '100px', textAlign: 'center' }}>
          {activeMonth || 'Mes Actual'}
        </span>
        <button type="button" onClick={handleNextMonth} disabled={currentMonthIndex >= horarioMes.length - 1} style={{ background: 'transparent', border: 'none', color: currentMonthIndex >= horarioMes.length - 1 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)', cursor: currentMonthIndex >= horarioMes.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {loading && <div className="card">Cargando horario desde Google Sheets...</div>}
      {error && <div className="card">Error: {error}</div>}
      {!loading && !error && horarioMes.length === 0 && <div className="card">No hay horarios planificados para este mes.</div>}

      {!loading && !error && currentMonthData.semanas.length > 0 && viewMode === 'monthly' && (
        <div className={styles.calendarContainer}>
          {user.role === 'promotor' && (
             <div className={styles.monthlyWarning}>
               Para confirmar tu horario, debes cambiar a la vista <strong>Semanal</strong> y revisar cada semana.
             </div>
          )}
          <div className={styles.calendarHeader}>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className={styles.calendarHeaderDay}>{d}</div>
            ))}
          </div>
          <div className={styles.calendarGrid}>
            {currentMonthData.semanas.map((week, wIdx) => (
              <div key={week.id} className={styles.calendarRow}>
                {week.detalle.map((shift, dIdx) => {
                  let shiftType = normalizeTurno(shift.turno);
                  if (!shiftType) { 
                    shiftType = 'Mañana';
                    if (shift.horas === 'Descanso' || shift.horas === '-') shiftType = 'Descanso';
                    else if (shift.horas.includes('/')) shiftType = 'Partido';
                    else if (shift.horas.startsWith('14') || shift.horas.startsWith('15') || shift.horas.startsWith('16')) shiftType = 'Tarde';
                  }
                  
                  const cfg = shiftConfig[shiftType] || shiftConfig['Descanso'];
                  
                  // Formatear el número del día (soportando YYYY-MM-DD y DD/MM/YYYY)
                  const isIso = shift.fecha.includes('-');
                  const dateNum = parseInt(isIso ? shift.fecha.split('-')[2] : shift.fecha.split('/')[0], 10);

                  // Detectar casos especiales (Descanso, Vacaciones, Permiso, Baja, Festivo, Day off)
                  const lowerHoras = shift.horas.toLowerCase();
                  let specialColor = null;
                  let specialLabel = shift.horas;
                  
                  if (lowerHoras.includes('festivo')) specialColor = '#0284c7';
                  else if (lowerHoras.includes('day off') || shiftType === 'Descanso' || lowerHoras.includes('descanso') || shift.horas === '-') { specialColor = '#16a34a'; specialLabel = 'Descanso'; }
                  else if (lowerHoras.includes('permiso')) specialColor = '#c026d3';
                  else if (lowerHoras.includes('vacaciones')) specialColor = '#7c3aed';
                  else if (lowerHoras.includes('baja')) specialColor = '#dc2626';

                  const isSpecial = !!specialColor;

                  const cellIso = getIsoFromDateString(shift.fecha);
                  const isPast = cellIso && cellIso < todayIso;

                  return (
                    <div key={`${wIdx}-${dIdx}`} className={`${styles.calendarCell} ${isPast ? styles.pastDay : ''}`} style={{ backgroundColor: isSpecial ? specialColor : cfg.bg }}>
                      <span className={styles.calendarDate} style={{ color: isSpecial ? '#fff' : 'var(--text-primary)' }}>{dateNum}</span>
                      {!isSpecial ? (
                        <div className={styles.calendarEvent} style={{ '--event-color': cfg.color }}>
                          <span className={styles.calendarHours}>{shift.horas}</span>
                          <span className={styles.calendarShift} style={{ color: cfg.color }}>{shiftType}</span>
                        </div>
                      ) : (
                        <div className={styles.calendarSpecial} style={{ backgroundColor: 'transparent' }}>
                          <span className={styles.calendarSpecialText}>{specialLabel}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && currentMonthData.semanas.length > 0 && viewMode === 'weekly' && (
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{currentWeekData.dias}</span>
                  <span className={styles.weekHours}>{totalHours} h esta semana</span>
                </div>
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

              const cellIso = getIsoFromDateString(shift.fecha);
              const isPast = cellIso && cellIso < todayIso;

              return (
                <div key={idx} className={`${styles.dayRow} ${isRest ? styles.dayRowRest : ''} ${isPast ? styles.pastDayRow : ''}`}>
                  <div className={styles.colDay}>
                    <div className={styles.dayLabel}>
                      <span className={`${styles.dayName} dayNameEl`}>{shift.dia}</span>
                      <span className={`${styles.dayDate} dayDateEl`}>{shift.fecha}</span>
                    </div>
                    {shift.centroAsignado && shift.centroAsignado !== user.centro && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--warning)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(234, 179, 8, 0.1)', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                        📍 {shift.centroAsignado}
                      </div>
                    )}
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
