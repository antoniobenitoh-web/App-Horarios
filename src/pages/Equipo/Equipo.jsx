import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Equipo.module.css';
import { Users, MapPin, Clock, Sun, Moon, Search, Filter, Calendar } from 'lucide-react';

const turnoIcon = {
  'Mañana': <Sun size={14} color="var(--warning)" />,
  'Tarde': <Moon size={14} color="var(--accent-primary)" />,
  'Partido': <Clock size={14} color="var(--info)" />,
  'Descanso': <Sun size={14} color="var(--text-secondary)" />
};

export default function Equipo() {
  const { user } = useAuth();
  const GAS_URL = import.meta.env.VITE_GAS_URL;
  
  const getISOWeek = (dateStr) => {
    const date = new Date(dateStr);
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [centroExpanded, setCentroExpanded] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const selectedWeek = getISOWeek(selectedDate);
  
  const [equipoFetch, setEquipoFetch] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchEquipo = async () => {
      if (!GAS_URL || user.role === 'promotor') return;
      setLoading(true);
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getEquipoWeekly', weekNum: selectedWeek, role: user.role, name: user.name })
        });
        const data = await res.json();
        if (data.success) {
          setEquipoFetch(data.equipo);
        }
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipo();
  }, [user, GAS_URL, selectedWeek]);

  // Agrupar promotores por centro
  const centrosMap = {};
  for (let p of equipoFetch) {
    if (!centrosMap[p.centro]) {
      centrosMap[p.centro] = { id: p.centro, nombre: p.centro, promotores: [] };
    }
    
    // Buscar el turno de "hoy" (selectedDate)
    let turnoHoy = 'Descanso / Sin asignar';
    let iconTurnoHoy = 'Descanso';
    if (p.semana) {
      const hoyInfo = p.semana.find(d => d.fecha === selectedDate);
      if (hoyInfo) {
        turnoHoy = hoyInfo.horas;
        iconTurnoHoy = hoyInfo.iconTurno;
      }
    }

    centrosMap[p.centro].promotores.push({
      ...p,
      turnoHoy,
      iconTurnoHoy
    });
  }
  const centros = Object.values(centrosMap);

  const [year, month, day] = selectedDate.split('-');
  const displayDate = new Date(year, month - 1, day).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const displayDateCap = displayDate.charAt(0).toUpperCase() + displayDate.slice(1);

  const centrosFiltrados = centros.map(c => ({
    ...c,
    promotores: c.promotores.filter(p => {
      const coincideBusqueda = p.name.toLowerCase().includes(busqueda.toLowerCase());
      const coincideTurno = filtroTurno === 'todos' || p.iconTurnoHoy === filtroTurno;
      return coincideBusqueda && coincideTurno;
    })
  })).filter(c => c.promotores.length > 0);

  const totalPromotores = equipoFetch.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 style={{ color: '#1a1a1a', fontSize: '1.6rem' }}>Mi Equipo</h2>
          <p style={{ color: '#555', marginTop: '0.25rem' }}>Vista de centros y promotores</p>
        </div>
        <div className={styles.statsHeader}>
          <div className={styles.statChip}>
            <Users size={16} />
            <span>{totalPromotores} Promotores</span>
          </div>
          <div className={styles.statChip}>
            <MapPin size={16} />
            <span>{centros.length} Centros</span>
          </div>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className={styles.filtrosBar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar promotor..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className={styles.turnoFiltros}>
          <Filter size={16} style={{ color: '#666' }} />
          {['todos', 'Mañana', 'Tarde', 'Partido'].map(t => (
            <button
              key={t}
              className={`${styles.turnoBtn} ${filtroTurno === t ? styles.turnoActivo : ''}`}
              onClick={() => setFiltroTurno(t)}
            >
              {t !== 'todos' && (turnoIcon[t] || <Sun size={14}/>)}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Vista diaria del día */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>📍 Vista diaria — {displayDateCap}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: 'var(--border-radius-md)' }}>
            <Calendar size={16} color="var(--accent-primary)" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem' }}
            />
          </div>
        </div>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Cargando datos de Google Sheets...</p>
        ) : (
        <div className={styles.diaryGrid}>
          {centrosFiltrados.flatMap(c =>
            c.promotores
              .map(p => (
                <div key={p.id} className={styles.diaryCard}>
                  <div className={styles.diaryName}>{p.name}</div>
                  <div className={styles.diaryCenter}>
                    <MapPin size={12} /> {c.nombre}
                  </div>
                  <div className={styles.diaryTurno}>
                    {turnoIcon[p.iconTurnoHoy] || <Sun size={14} color="var(--text-secondary)"/>}
                    <span>{p.turnoHoy}</span>
                  </div>
                </div>
              ))
          )}
          {centrosFiltrados.length === 0 && <p style={{color: 'var(--text-tertiary)'}}>No hay promotores asignados a tu equipo.</p>}
        </div>
        )}
      </div>

      {/* Vista por centros */}
      <div className={styles.centrosList}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0' }}>🏢 Vista semanal por centros (Semana {selectedWeek})</h3>
        {centrosFiltrados.map(centro => (
          <div key={centro.id} className="card" style={{ marginBottom: '1rem', padding: '0' }}>
            <div className={styles.centroHeader} onClick={() => setCentroExpanded(centroExpanded === centro.id ? null : centro.id)}>
              <div className={styles.centroInfo}>
                <div className={styles.centroIconWrapper}>
                  <MapPin size={20} color="var(--accent-primary)" />
                </div>
                <div>
                  <h4>{centro.nombre}</h4>
                </div>
              </div>
              <div className={styles.centroMeta}>
                <span className={styles.promCount}>{centro.promotores.length} promotores</span>
                <span className={styles.expandArrow}>{centroExpanded === centro.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {centroExpanded === centro.id && (
              <div className={styles.promotoresList}>
                {centro.promotores.map(p => (
                  <div key={p.id} className={styles.promotorRow} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
                    <div className={styles.promInfo} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                      <span className={styles.promName}>{p.name}</span>
                    </div>
                    
                    <div className={styles.weeklyTable}>
                      {p.semana && p.semana.length > 0 ? (
                        p.semana.map((dia, idx) => (
                          <div key={idx} className={styles.dayRow}>
                            <div className={styles.dayName}>{dia.diaSemana}</div>
                            <div className={styles.dayHours}>{dia.horas}</div>
                            <div className={styles.dayIcon}>
                              {turnoIcon[dia.iconTurno] || <Sun size={14} color="var(--text-secondary)"/>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.5rem 0' }}>
                          Sin horarios esta semana
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
