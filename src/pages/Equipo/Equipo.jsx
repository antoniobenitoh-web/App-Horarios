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
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [centroExpanded, setCentroExpanded] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [equipoFetch, setEquipoFetch] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchEquipo = async () => {
      if (!GAS_URL || user.role === 'promotor') return;
      setLoading(true);
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getEquipoDaily', date: selectedDate, role: user.role, name: user.name })
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
  }, [user, GAS_URL, selectedDate]);

  // Agrupar promotores por centro
  const centrosMap = {};
  for (let p of equipoFetch) {
    if (!centrosMap[p.centro]) {
      centrosMap[p.centro] = { id: p.centro, nombre: p.centro, ciudad: '', promotores: [] };
    }
    centrosMap[p.centro].promotores.push({
      id: p.id,
      nombre: p.name,
      turnoHoy: p.horas,
      turno: p.iconTurno
    });
  }
  const centros = Object.values(centrosMap);

  const [year, month, day] = selectedDate.split('-');
  const displayDate = new Date(year, month - 1, day).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const displayDateCap = displayDate.charAt(0).toUpperCase() + displayDate.slice(1);

  const centrosFiltrados = centros.map(c => ({
    ...c,
    promotores: c.promotores.filter(p => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideTurno = filtroTurno === 'todos' || p.turno === filtroTurno;
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
          {centros.flatMap(c =>
            c.promotores
              .filter(p => filtroTurno === 'todos' || p.turno === filtroTurno)
              .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
              .map(p => (
                <div key={p.id} className={styles.diaryCard}>
                  <div className={styles.diaryName}>{p.nombre}</div>
                  <div className={styles.diaryCenter}>
                    <MapPin size={12} /> {c.nombre}
                  </div>
                  <div className={styles.diaryTurno}>
                    {turnoIcon[p.turno]}
                    <span>{p.turnoHoy}</span>
                  </div>
                  <span className={`${styles.turnoBadge} ${styles[`turno${p.turno}`]}`}>{p.turno}</span>
                </div>
              ))
          )}
          {centros.length === 0 && <p style={{color: 'var(--text-tertiary)'}}>No hay promotores asignados a tu equipo.</p>}
        </div>
        )}
      </div>

      {/* Vista por centros */}
      <div className={styles.centrosList}>
        {centrosFiltrados.map(centro => (
          <div key={centro.id} className="card" style={{ marginBottom: '1rem', padding: '0' }}>
            <div className={styles.centroHeader} onClick={() => setCentroExpanded(centroExpanded === centro.id ? null : centro.id)}>
              <div className={styles.centroInfo}>
                <div className={styles.centroIconWrapper}>
                  <MapPin size={20} color="var(--accent-primary)" />
                </div>
                <div>
                  <h4>{centro.nombre}</h4>
                  <span className={styles.centroCity}>{centro.ciudad}</span>
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
                  <div key={p.id} className={styles.promotorRow}>
                    <div className={styles.promotorAvatar}>{p.nombre.split(' ').map(n => n[0]).join('')}</div>
                    <div className={styles.promotorInfo}>
                      <strong>{p.nombre}</strong>
                    </div>
                    <div className={styles.promotorTurno}>
                      {turnoIcon[p.turno]}
                      <span>{p.turnoHoy}</span>
                    </div>
                    <span className={`${styles.turnoBadge} ${styles[`turno${p.turno}`]}`}>{p.turno}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {centrosFiltrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
            <Users size={40} />
            <p style={{ marginTop: '1rem' }}>No se encontraron promotores con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
