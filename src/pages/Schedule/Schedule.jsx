/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Schedule.module.css';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar, MapPin, Clock, Sun, Moon, Coffee, CalendarDays, AlertTriangle } from 'lucide-react';

const shiftConfig = {
  'Mañanas':  { icon: <Sun size={15} />,     color: '#f97316', bg: 'rgba(249,115,22,0.15)'   },
  'Tardes':   { icon: <Moon size={15} />,    color: '#3b82f6', bg: 'rgba(59,130,246,0.15)'   },
  'Partido':  { icon: <Clock size={15} />,   color: '#a855f7', bg: 'rgba(168,85,247,0.15)'   },
  'Day off': { icon: <Coffee size={15} />,  color: '#22c55e', bg: 'rgba(34,197,94,0.15)'   },
  'Sábado calidad': { icon: <Coffee size={15} />, color: 'var(--accent-primary)', bg: 'var(--accent-light)' },
  'Vacaciones': { icon: <Sun size={15} />, color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.15)' }
};

const normalizeTurno = (t) => {
  if (!t) return null;
  const l = t.toLowerCase().trim();
  if (l.includes('mañana')) return 'Mañanas';
  if (l.includes('tarde')) return 'Tardes';
  if (l.includes('partido')) return 'Partido';
  if (l.includes('day off') || l.includes('descanso')) return 'Day off';
  if (l.includes('sábado calidad') || l.includes('sabado calidad')) return 'Sábado calidad';
  return null;
};

export default function Schedule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Semana 1');
  const [viewMode, setViewMode] = useState('monthly');
  const [showPointAnimation, setShowPointAnimation] = useState(false);
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
            const trueSynced = { ...backendConfirms };
            localStorage.setItem(`confirmed_v2_${user.name}`, JSON.stringify(trueSynced));
            return trueSynced;
          });

          if (data.schedule.length > 0) {
            const todayDate = new Date();
            const d = new Date(Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            const currentWeekNum = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
            const currentWeekStr = `Semana ${currentWeekNum}`;
            
            const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            const currentMonthStr = `${mesesNombres[todayDate.getMonth()]} ${todayDate.getFullYear()}`;
            
            const targetMonthObj = data.schedule.find(m => m.mes.toLowerCase() === currentMonthStr.toLowerCase()) || data.schedule[0];
            setActiveMonth(targetMonthObj.mes);
            
            if (targetMonthObj.semanas.length > 0) {
              const targetWeekObj = targetMonthObj.semanas.find(s => s.semana.toString() === currentWeekNum.toString() || s.id.toLowerCase() === currentWeekStr.toLowerCase()) || targetMonthObj.semanas[0];
              setActiveTab(targetWeekObj.id);
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

  const triggerAnimationIfNeeded = (mode, tab) => {
    if (mode === 'weekly' && !confirmedWeeks[tab]) {
      setShowPointAnimation(false);
      setTimeout(() => setShowPointAnimation(true), 50);
      setTimeout(() => setShowPointAnimation(false), 5000);
    } else {
      setShowPointAnimation(false);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    triggerAnimationIfNeeded(mode, activeTab);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    triggerAnimationIfNeeded(viewMode, tab);
  };

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
              <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} /> Confirmado
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {showPointAnimation && (
                  <span className={styles.bouncePoint}>👉</span>
                )}
                <button onClick={handleConfirm} className="glow-effect" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-full)', padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,103,0,0.3)' }}>
                  Confirmar semana
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
        <div className={styles.viewToggleGroup}>
          <button className={`${styles.viewToggleBtn} ${viewMode === 'monthly' ? styles.viewToggleBtnActive : ''}`} onClick={() => handleViewModeChange('monthly')}>
            <Calendar size={14} /> Mensual
          </button>
          <button className={`${styles.viewToggleBtn} ${viewMode === 'weekly' ? styles.viewToggleBtnActive : ''}`} onClick={() => handleViewModeChange('weekly')}>
            <CalendarDays size={14} /> Semanal
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
               <AlertTriangle size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
               <span>Para confirmar tu horario, debes cambiar a la vista <strong>Semanal</strong> y revisar cada semana.</span>
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
                    shiftType = 'Mañanas';
                    if (shift.horas === 'Day off' || shift.horas === '-' || shift.horas === 'Descanso') shiftType = 'Day off';
                    if (shift.horas.toLowerCase().includes('sábado calidad')) shiftType = 'Sábado calidad';
                  }
                  
                  const cfg = shiftConfig[shiftType] || shiftConfig['Day off'];
                  
                  const isIso = shift.fecha.includes('-');
                  const dateNum = parseInt(isIso ? shift.fecha.split('-')[2] : shift.fecha.split('/')[0], 10);

                  const lowerHoras = shift.horas.toLowerCase();
                  let specialColor = null;
                  let specialBg = null;
                  let specialLabel = shift.horas;
                  
                  if (lowerHoras.includes('festivo')) { specialColor = '#0ea5e9'; specialBg = 'rgba(14,165,233,0.15)'; specialLabel = 'Festivo'; }
                  else if (lowerHoras.includes('sábado calidad') || shiftType === 'Sábado calidad') { specialColor = 'var(--accent-primary)'; specialBg = 'var(--accent-light)'; specialLabel = 'Sábado Calidad'; }
                  else if (lowerHoras.includes('day off') || shiftType === 'Day off' || lowerHoras.includes('descanso') || shift.horas === '-') { specialColor = '#22c55e'; specialBg = 'rgba(34,197,94,0.15)'; specialLabel = 'Day off'; }
                  else if (lowerHoras.includes('permiso')) { specialColor = '#9f1239'; specialBg = 'rgba(159,18,57,0.15)'; }
                  else if (lowerHoras.includes('vacaciones')) { specialColor = '#7c3aed'; specialBg = 'rgba(124,58,237,0.15)'; }
                  else if (lowerHoras.includes('baja')) { specialColor = '#dc2626'; specialBg = 'rgba(220,38,38,0.15)'; }

                  const isSpecial = !!specialColor;

                  const cellIso = getIsoFromDateString(shift.fecha);
                  const isPast = cellIso && cellIso < todayIso;

                  return (
                    <div key={`${wIdx}-${dIdx}`} className={`${styles.calendarCell} ${isPast ? styles.pastDay : ''}`} style={{ backgroundColor: isSpecial ? specialBg : cfg.bg }}>
                      <span className={styles.calendarDate} style={{ color: isSpecial ? specialColor : 'var(--text-primary)' }}>{dateNum}</span>
                      {!isSpecial ? (
                        <div className={styles.calendarEvent} style={{ '--event-color': cfg.color }}>
                          <span className={styles.calendarHours}>{shift.horas}</span>
                          <span className={styles.calendarShift} style={{ color: cfg.color }}>{shiftType}</span>
                        </div>
                      ) : (
                        <div className={styles.calendarSpecial} style={{ backgroundColor: 'transparent' }}>
                          <span className={styles.calendarSpecialText} style={{ color: specialColor, fontWeight: 'bold' }}>{specialLabel}</span>
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
            {currentMonthData.semanas.map(week => (
              <button 
                key={week.id} 
                className={`${styles.weekTab} ${activeTab === week.id ? styles.weekTabActive : ''}`}
                onClick={() => handleTabChange(week.id)}
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
              let shiftType = normalizeTurno(shift.turno);
              if (!shiftType) { 
                shiftType = 'Mañanas';
                if (shift.horas === 'Day off' || shift.horas === '-' || shift.horas === 'Descanso') shiftType = 'Day off';
                if (shift.horas.toLowerCase().includes('sábado calidad')) shiftType = 'Sábado calidad';
              }
              
              const cfg = shiftConfig[shiftType] || shiftConfig['Day off'];
              const isRest = shiftType === 'Day off' || shiftType === 'Sábado calidad' || shift.horas.toLowerCase().includes('day off') || shift.horas.toLowerCase().includes('descanso');

              let horasStyle = { fontWeight: 'bold' };
              let rowBg = cfg.bg;
              
              const lowerHoras = shift.horas.toLowerCase();
              if (lowerHoras.includes('festivo')) { horasStyle.color = '#1d4ed8'; rowBg = 'rgba(29,78,216,0.15)'; }
              else if (lowerHoras.includes('day off')) { horasStyle.color = '#22c55e'; rowBg = 'rgba(34,197,94,0.15)'; }
              else if (lowerHoras.includes('permiso')) { horasStyle.color = '#9f1239'; rowBg = 'rgba(159,18,57,0.15)'; }
              else if (lowerHoras.includes('vacaciones')) { horasStyle.color = '#7c3aed'; rowBg = 'rgba(124,58,237,0.15)'; }
              else if (lowerHoras.includes('baja')) { horasStyle.color = '#dc2626'; rowBg = 'rgba(220,38,38,0.15)'; }
              else if (isRest) { horasStyle.color = '#22c55e'; rowBg = 'rgba(34,197,94,0.15)'; }

              const cellIso = getIsoFromDateString(shift.fecha);
              const isPast = cellIso && cellIso < todayIso;

              return (
                <div key={idx} className={`${styles.dayRow} ${isRest ? styles.dayRowRest : ''} ${isPast ? styles.pastDayRow : ''}`} style={{ backgroundColor: rowBg }}>
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
                    {isRest ? (
                      <span className={`${styles.restLabel} restLabelEl`}>{shiftType === 'Sábado calidad' ? '— Sábado calidad —' : '— Day off —'}</span>
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
