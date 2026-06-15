import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Equipo.module.css';
import { Users, MapPin, Clock, Sun, Moon, Search, Filter, Calendar, ChevronDown, ChevronUp, User } from 'lucide-react';

const turnoIcon = {
  'Mañana': <Sun size={14} color="var(--warning)" />,
  'Tarde': <Moon size={14} color="var(--accent-primary)" />,
  'Partido': <Clock size={14} color="var(--info)" />,
  'Descanso': <Sun size={14} color="var(--text-secondary)" />
};

export default function Equipo() {
  const { user } = useAuth();
  const GAS_URL = import.meta.env.VITE_GAS_URL;
  
  const getISOWeek = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };
  
  const [busqueda, setBusqueda] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(getISOWeek(new Date()));
  
  const [centroExpanded, setCentroExpanded] = useState(null);
  const [promotorExpanded, setPromotorExpanded] = useState(null);
  
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
    promotores: c.promotores.filter(p => p.name.toLowerCase().includes(busqueda.toLowerCase()))
  })).filter(c => c.promotores.length > 0);

  const totalPromotores = equipoFetch.length;

  const toggleCentro = (id) => {
    setCentroExpanded(centroExpanded === id ? null : id);
    setPromotorExpanded(null); // Reset promotor if centro changes
  };

  const togglePromotor = (id, e) => {
    e.stopPropagation();
    setPromotorExpanded(promotorExpanded === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 style={{ color: '#1a1a1a', fontSize: '1.6rem' }}>Mi Equipo</h2>
          <p style={{ color: '#555', marginTop: '0.25rem' }}>Vista de centros y horarios</p>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.4rem 0.75rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
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
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>Cargando equipo...</p>
      ) : (
        <div className={styles.centrosList}>
          {centrosFiltrados.map(centro => (
            <div key={centro.id} className="card" style={{ marginBottom: '1rem', padding: '0', overflow: 'hidden' }}>
              
              {/* CABECERA CENTRO */}
              <div 
                className={styles.centroHeader} 
                onClick={() => toggleCentro(centro.id)}
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: centroExpanded === centro.id ? 'rgba(255,103,0,0.05)' : 'white' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,103,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={18} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{centro.nombre}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{centro.promotores.length} promotores</span>
                  </div>
                </div>
                <div>
                  {centroExpanded === centro.id ? <ChevronUp size={20} color="var(--text-secondary)"/> : <ChevronDown size={20} color="var(--text-secondary)"/>}
                </div>
              </div>

              {/* LISTA PROMOTORES (Desplegada si el centro está activo) */}
              {centroExpanded === centro.id && (
                <div style={{ borderTop: '1px solid var(--border-color)', background: '#fafafa' }}>
                  {centro.promotores.map((p, idx) => (
                    <div key={p.id} style={{ borderBottom: idx < centro.promotores.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      
                      {/* CABECERA PROMOTOR */}
                      <div 
                        onClick={(e) => togglePromotor(p.id, e)}
                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: promotorExpanded === p.id ? 'white' : 'transparent' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={14} color="var(--text-secondary)" />
                          </div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</strong>
                        </div>
                        <div>
                          {promotorExpanded === p.id ? <ChevronUp size={16} color="var(--text-tertiary)"/> : <ChevronDown size={16} color="var(--text-tertiary)"/>}
                        </div>
                      </div>

                      {/* HORARIO SEMANAL (Desplegado si el promotor está activo) */}
                      {promotorExpanded === p.id && (
                        <div style={{ padding: '0.5rem 1rem 1rem 1rem', background: 'white' }}>
                          {p.semana && p.semana.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
                              {p.semana.map((dia, dIdx) => (
                                <div key={dIdx} style={{ 
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                  padding: '0.5rem 0.75rem', 
                                  background: dia.iconTurno === 'Descanso' ? 'var(--bg-secondary)' : 'white',
                                  borderBottom: dIdx < p.semana.length - 1 ? '1px solid var(--border-color)' : 'none'
                                }}>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', width: '30%' }}>
                                    {dia.diaSemana}
                                  </span>
                                  <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-primary)', flex: 1, textAlign: 'right', paddingRight: '0.5rem' }}>
                                    {dia.horas}
                                  </span>
                                  <span style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
                                    {turnoIcon[dia.iconTurno] || <Sun size={14} color="var(--text-secondary)"/>}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '0.5rem 0' }}>Sin horarios registrados esta semana.</p>
                          )}
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {!loading && centrosFiltrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              <Users size={40} />
              <p style={{ marginTop: '1rem' }}>No se encontraron centros o promotores.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
