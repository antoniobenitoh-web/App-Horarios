import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Equipo.module.css';
import { Users, MapPin, Clock, Sun, Moon, Search, Filter } from 'lucide-react';

import { Calendar } from 'lucide-react';

const turnoIcon = {
  'Mañana': <Sun size={14} color="var(--warning)" />,
  'Tarde': <Moon size={14} color="var(--accent-primary)" />,
  'Partido': <Clock size={14} color="var(--info)" />,
};

export default function Equipo() {
  const { user } = useAuth();
  const GAS_URL = import.meta.env.VITE_GAS_URL;
  
  // Helper para obtener número de semana ISO
  const getISOWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [selectedWeek, setSelectedWeek] = useState(getISOWeek(new Date()));
  
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
    centrosMap[p.centro].promotores.push(p);
  }
  const centros = Object.values(centrosMap);

  const centrosFiltrados = centros.map(c => ({
    ...c,
    promotores: c.promotores.filter(p => {
      const coincideBusqueda = p.name.toLowerCase().includes(busqueda.toLowerCase());
      // Para simplificar, aplicamos filtro de turno si alguno de sus días coincide, o ignoramos.
      const coincideTurno = filtroTurno === 'todos' || (p.semana && p.semana.some(d => d.iconTurno === filtroTurno));
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
              {t !== 'todos' && turnoIcon[t]}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Vista Semanal */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>📍 Vista Semanal</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: 'var(--border-radius-md)' }}>
            <Calendar size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Semana</span>
            <input 
              type="number" 
              min="1" max="52"
              value={selectedWeek} 
              onChange={e => setSelectedWeek(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem', width: '40px', fontWeight: 'bold' }}
            />
          </div>
        </div>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Cargando datos de Google Sheets...</p>
        ) : (
        <div className={styles.diaryGrid}>
          {centrosFiltrados.flatMap(c =>
            c.promotores.map(p => (
                <div key={p.id} className={styles.diaryCard}>
                  <div className={styles.diaryName}>{p.name}</div>
                  <div className={styles.diaryCenter}>
                    <MapPin size={12} /> {c.nombre}
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
              ))
          )}
        </div>
        )}
      </div>

      {centrosFiltrados.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <Users size={40} />
          <p style={{ marginTop: '1rem' }}>No se encontraron promotores con esos filtros.</p>
        </div>
      )}
    </div>
  );
}
