import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './ControlHoras.module.css';
import { TrendingUp, TrendingDown, Minus, Clock, BarChart3, CalendarDays, Search, User, MapPin, Users } from 'lucide-react';

const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};

// Obtiene las semanas ISO que caen dentro del mes en curso
const getCurrentMonthWeeks = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const weeks = [];
  const numDays = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= numDays; d++) {
    const date = new Date(year, month, d);
    const week = getISOWeek(date);
    if (!weeks.includes(week)) {
      weeks.push(week);
    }
  }
  return weeks;
};

export default function ControlHoras() {
  const { user } = useAuth();
  
  const [team, setTeam] = useState([]);
  const [semanasRaw, setSemanasRaw] = useState([]); // Todas las semanas
  const [semanas, setSemanas] = useState([]); // Semanas filtradas por mes
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedPromotor, setSelectedPromotor] = useState(user.role === 'promotor' ? user.name : null);
  const [busqueda, setBusqueda] = useState(''); // Por si quieren buscar entre los botones

  const GAS_URL = import.meta.env.VITE_GAS_URL;

  // 1. Cargar equipo
  useEffect(() => {
    const fetchTeam = async () => {
      if (user.role === 'promotor' || !GAS_URL) return;
      try {
        const res = await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
        const data = await res.json();
        if (data.success) {
          const myTeam = data.users.filter(u => 
            u.role === 'promotor' && 
            (u.manager.gpv === user.name || u.manager.am === user.name || user.role === 'coordinadora')
          );
          setTeam(myTeam);
          // Auto-seleccionar el primero si no hay ninguno
          if (myTeam.length > 0 && !selectedPromotor) {
            setSelectedPromotor(myTeam[0].name);
          }
        }
      } catch (err) {
        console.error("Error loading team", err);
      }
    };
    fetchTeam();
  }, [user, GAS_URL]);

  // 2. Fetch Control Horas
  useEffect(() => {
    const fetchHours = async () => {
      if (!GAS_URL || !selectedPromotor) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          // Mandamos `names` como array de 1 elemento para reusar el nuevo backend, o `name` si el antiguo sigue ahí
          body: JSON.stringify({ action: 'getControlHoras', name: selectedPromotor, names: [selectedPromotor] })
        });
        const data = await res.json();
        
        if (data.success) {
          setSemanasRaw(data.semanas || []);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHours();
  }, [selectedPromotor, GAS_URL]);

  // 3. Filtrar semanas automáticamente por el mes en curso usando ISO Weeks
  useEffect(() => {
    const currentWeeks = getCurrentMonthWeeks();
    const filtered = semanasRaw.filter(s => {
      const numParsed = parseInt(String(s.num).replace(/\D/g, ''), 10);
      return currentWeeks.includes(numParsed);
    });
    setSemanas(filtered);
  }, [semanasRaw]);

  const getBadge = (diff) => {
    if (diff === 0) return { cls: styles.balanceNeutro, icon: <Minus size={14} />, label: '0 h — Compensado' };
    if (diff > 0) return { cls: styles.balancePositivo, icon: <TrendingUp size={14} />, label: `+${diff} h — Exceso` };
    return { cls: styles.balanceNegativo, icon: <TrendingDown size={14} />, label: `${diff} h — Déficit` };
  };

  const balanceAcumulado = semanas.reduce((acc, s) => acc + (s.cobertura - s.planificadas), 0);
  const acumBadge = getBadge(balanceAcumulado);

  // Filtrado de la lista de botones
  const b = busqueda.toLowerCase();
  const filteredTeam = team.filter(p => 
    p.name.toLowerCase().includes(b) || (p.centro && p.centro.toLowerCase().includes(b))
  );

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Control de Horas</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Balance del mes actual</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          {user.role === 'promotor' && (
            <div className={`${styles.acumBadge} ${acumBadge.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-full)' }}>
              <BarChart3 size={18} />
              <span>Balance del mes: <strong>{acumBadge.label}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Lista vertical de Promotores (Solo Managers) */}
      {user.role !== 'promotor' && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <div className={styles.promotorHeader}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light-primary)', margin: 0 }}>Promotor</h3>
            <div className={styles.promotorSearch}>
              <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-light-primary)', padding: '0.35rem 0.5rem 0.35rem 1.8rem', borderRadius: 'var(--border-radius-md)', fontSize: '0.8rem', outline: 'none' }}
                type="text"
                placeholder="Buscar..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredTeam.map((p) => {
              const isSelected = selectedPromotor === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => setSelectedPromotor(p.name)}
                  className={styles.promotorBtn}
                  style={{
                    background: isSelected ? 'rgba(255,103,0,0.1)' : 'var(--bg-tertiary)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  }}
                  onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                  onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)' }}
                >
                  <span className={styles.promotorName} style={{ fontWeight: isSelected ? '600' : '400', color: isSelected ? 'var(--accent-primary)' : 'var(--text-light-primary)' }}>
                    <User size={14} /> {p.name}
                  </span>
                  <span className={styles.promotorCenter}>
                    <MapPin size={12} /> {p.centro || 'Sin asignar'}
                  </span>
                </button>
              );
            })}
            {filteredTeam.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '1rem' }}>No se encontraron promotores.</p>
            )}
          </div>
        </div>
      )}

      {/* Resumen Cards del Promotor Seleccionado */}
      <div className={styles.statsRow}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className={styles.statIcon} style={{ background: 'rgba(255,103,0,0.12)', color: 'var(--accent-primary)' }}>
            <Clock size={28} />
          </div>
          <p className={styles.statLabel}>Horas Planificadas (Mes)</p>
          <p className={styles.statValue}>
            {semanas.reduce((acc, s) => acc + s.planificadas, 0)} h
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className={styles.statIcon} style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--info)' }}>
            <CalendarDays size={28} />
          </div>
          <p className={styles.statLabel}>Semanas del Mes</p>
          <p className={styles.statValue}>{semanas.length}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className={`${styles.statIcon}`}
            style={{ background: balanceAcumulado === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: balanceAcumulado === 0 ? 'var(--success)' : 'var(--danger)' }}>
            {balanceAcumulado === 0 ? <Minus size={28} /> : balanceAcumulado > 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
          </div>
          <p className={styles.statLabel}>Balance del Mes</p>
          <p className={styles.statValue} style={{ color: balanceAcumulado === 0 ? 'var(--success)' : 'var(--danger)' }}>
            {balanceAcumulado > 0 ? `+${balanceAcumulado}` : balanceAcumulado} h
          </p>
        </div>
      </div>

      {/* Tabla de semanas */}
      <div className="card">
        <h3 className={styles.tableTitle}>
          Histórico Semanal ({new Date().toLocaleString('es-ES', { month: 'long' })})
        </h3>
        {loading ? (
          <p>Cargando datos desde Google Sheets...</p>
        ) : error ? (
          <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
        ) : semanas.length === 0 ? (
          <p>No hay registro de horas para el mes en curso.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
            <thead>
              <tr>
                <th>Semana</th>
                <th>Período</th>
                <th>Cobertura habitual</th>
                <th>Horas planificadas</th>
                <th>Diferencia</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {semanas.map((s, i) => {
                const diff = s.cobertura - s.planificadas;
                const badge = getBadge(diff);
                const displayNum = String(s.num).toLowerCase().includes('semana') ? s.num : `Semana ${s.num}`;
                return (
                  <tr key={i}>
                    <td><strong>{displayNum}</strong></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.dias}</td>
                    <td>{s.cobertura} h</td>
                    <td>{s.planificadas} h</td>
                    <td>
                      <span className={`${styles.diffBadge} ${badge.cls}`}>
                        {badge.icon} {diff > 0 ? `+${diff}` : diff} h
                      </span>
                    </td>
                    <td>
                      <div className={styles.barWrapper}>
                        <div className={styles.bar} style={{
                          width: `${Math.min(Math.abs(diff) / 10 * 100, 100)}%`,
                          background: diff === 0 ? 'var(--success)' : diff > 0 ? 'var(--warning)' : 'var(--danger)',
                          marginLeft: diff < 0 ? 'auto' : '0'
                        }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}

        {/* Leyenda */}
        <div className={styles.leyenda}>
          <span className={`${styles.leyendaItem} ${styles.balanceNeutro}`}><Minus size={12} /> 0 h — Compensado</span>
          <span className={`${styles.leyendaItem} ${styles.balancePositivo}`}><TrendingUp size={12} /> Exceso de horas</span>
          <span className={`${styles.leyendaItem} ${styles.balanceNegativo}`}><TrendingDown size={12} /> Déficit de horas</span>
        </div>
      </div>
    </div>
  );
}
