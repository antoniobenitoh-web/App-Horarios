import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './Equipo.module.css';
import { Users, MapPin, Clock, Sun, Moon, Search, Filter, Calendar, ChevronDown, ChevronUp, User, CheckCircle2 } from 'lucide-react';

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
  
  const todayIso = new Date().toISOString().split('T')[0];

  const [busqueda, setBusqueda] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtroTurno, setFiltroTurno] = useState('todos');
  const [filtroRegion, setFiltroRegion] = useState('todas');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [semanasDisponibles, setSemanasDisponibles] = useState([]);
  
  const [centroExpanded, setCentroExpanded] = useState(null);
  const [promotorExpanded, setPromotorExpanded] = useState({});
  
  const [equipoFetch, setEquipoFetch] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar meses disponibles al montar
  React.useEffect(() => {
    const fetchMonths = async () => {
      if (!GAS_URL || user.role === 'promotor') {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getAvailableMonths', role: user.role, name: user.name })
        });
        const data = await res.json();
        if (data.success && data.meses && data.meses.length > 0) {
          setMesesDisponibles(data.meses);
          setSelectedMonth(data.meses[0].mes);
          setSemanasDisponibles(data.meses[0].semanas);
          setSelectedWeek(data.meses[0].semanas[0]);
        } else {
          setLoading(false); // No hay meses, terminar carga
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchMonths();
  }, [user, GAS_URL]);

  // Al cambiar el mes seleccionado, actualizar las semanas disponibles
  React.useEffect(() => {
    if (!selectedMonth) return;
    const mesObj = mesesDisponibles.find(m => m.mes === selectedMonth);
    if (mesObj && mesObj.semanas) {
      setSemanasDisponibles(mesObj.semanas);
      setSelectedWeek(mesObj.semanas[0]);
    }
  }, [selectedMonth, mesesDisponibles]);

  // Cargar equipo cuando cambia la semana
  React.useEffect(() => {
    const fetchEquipo = async () => {
      if (!GAS_URL || user.role === 'promotor') return;
      if (!selectedWeek) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'getEquipoWeekly', 
            month: selectedMonth, 
            weekNum: selectedWeek, 
            role: user.role, 
            name: user.name 
          })
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

  // Obtener regiones únicas
  const regionesDisponibles = Array.from(new Set(equipoFetch.map(p => p.region).filter(r => r && r.trim() !== ''))).sort();

  // Filtrar por región
  const equipoFiltradoPorRegion = filtroRegion === 'todas' 
    ? equipoFetch 
    : equipoFetch.filter(p => p.region === filtroRegion);

  // Agrupar promotores por centro
  const centrosMap = {};
  for (let p of equipoFiltradoPorRegion) {
    if (!centrosMap[p.centro]) {
      centrosMap[p.centro] = { id: p.centro, nombre: p.centro, promotores: [] };
    }
    centrosMap[p.centro].promotores.push(p);
  }
  const centros = Object.values(centrosMap).sort((a, b) => a.nombre.localeCompare(b.nombre));

  const b = busqueda.toLowerCase();
  
  const centrosFiltrados = centros.map(c => {
    const matchCentro = c.nombre.toLowerCase().includes(b);
    return {
      ...c,
      promotores: c.promotores.filter(p => {
        const matchText = matchCentro || p.name.toLowerCase().includes(b);
        const matchTurno = filtroTurno === 'todos' || (p.semana && p.semana.some(d => d.iconTurno === filtroTurno));
        return matchText && matchTurno;
      })
    };
  }).filter(c => c.promotores.length > 0);

  let suggestions = [];
  if (b.length > 0) {
    const sCentros = centros.filter(c => c.nombre.toLowerCase().includes(b)).slice(0, 3).map(c => ({ type: 'centro', text: c.nombre }));
    const sPromotores = equipoFetch.filter(p => p.name.toLowerCase().includes(b)).slice(0, 5).map(p => ({ type: 'promotor', text: p.name }));
    suggestions = [...sCentros, ...sPromotores];
  }

  const totalPromotores = equipoFetch.length;

  const toggleCentro = (id) => {
    setCentroExpanded(centroExpanded === id ? null : id);
    setPromotorExpanded({}); // Reset promotor if centro changes
  };

  const togglePromotor = (id, e) => {
    e.stopPropagation();
    setPromotorExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Mi Equipo</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Vista de centros y horarios</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={12} /> {totalPromotores} Prom.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} /> {centros.length} Centros</span>
        </div>
      </div>

      <div className={styles.filtrosBar}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar promotor o centro..."
            value={busqueda}
            onChange={e => {
              setBusqueda(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', marginTop: '0.25rem', zIndex: 10, boxShadow: 'var(--glass-shadow)', overflow: 'hidden' }}>
              {suggestions.map((s, i) => (
                <div 
                  key={i} 
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-light-primary)', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => {
                    setBusqueda(s.text);
                    setShowSuggestions(false);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {s.type === 'centro' ? <MapPin size={12} color="var(--accent-primary)"/> : <User size={12} color="var(--text-secondary)"/>}
                  {s.text}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          {/* Selector de Región (Solo Project y Coordinadora) */}
          {(user.role === 'project' || user.role === 'coordinadora') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--glass-border)' }}>
              <MapPin size={14} color="var(--accent-primary)" />
              <select 
                value={filtroRegion} 
                onChange={e => setFiltroRegion(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-light-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}
              >
                <option value="todas" style={{ background: '#1a1a1a', color: '#ffffff' }}>Todas las regiones</option>
                {regionesDisponibles.map(r => (
                  <option key={r} value={r} style={{ background: '#1a1a1a', color: '#ffffff' }}>{r}</option>
                ))}
              </select>
            </div>
          )}

          {/* Selector de Mes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--glass-border)' }}>
            <Calendar size={14} color="var(--accent-primary)" />
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-light-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}
            >
              {mesesDisponibles.length > 0 ? (
                mesesDisponibles.map(m => (
                  <option key={m.mes} value={m.mes} style={{ background: '#1a1a1a', color: '#ffffff' }}>{m.mes}</option>
                ))
              ) : (
                <option value="" style={{ background: '#1a1a1a', color: '#ffffff' }}>Cargando meses...</option>
              )}
            </select>
          </div>

          {/* Selector de Semana */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--glass-border)' }}>
            <Calendar size={14} color="var(--accent-primary)" />
            <select 
              value={selectedWeek} 
              onChange={e => setSelectedWeek(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-light-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}
            >
              {semanasDisponibles.length > 0 ? (
                semanasDisponibles.map(w => (
                  <option key={w} value={w} style={{ background: '#1a1a1a', color: '#ffffff' }}>Semana {w}</option>
                ))
              ) : (
                <option value={selectedWeek} style={{ background: '#1a1a1a', color: '#ffffff' }}>Semana {selectedWeek}</option>
              )}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {['todos', 'Mañana', 'Tarde', 'Partido'].map(t => (
              <button
                key={t}
                onClick={() => setFiltroTurno(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.2rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--border-radius-full)',
                  border: `1px solid ${filtroTurno === t ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                  background: filtroTurno === t ? 'rgba(255,103,0,0.1)' : 'transparent',
                  color: filtroTurno === t ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {t !== 'todos' && turnoIcon[t]}
                {t === 'todos' ? 'Todos' : t}
              </button>
            ))}
          </div>
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
                style={{ padding: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: centroExpanded === centro.id ? 'var(--bg-tertiary)' : 'rgba(255,255,255,0.03)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,103,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={18} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--accent-primary)', fontWeight: '600' }}>{centro.nombre}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{centro.promotores.length} promotores</span>
                  </div>
                </div>
                <div>
                  {centroExpanded === centro.id ? <ChevronUp size={20} color="var(--accent-primary)"/> : <ChevronDown size={20} color="var(--text-secondary)"/>}
                </div>
              </div>

              {/* LISTA PROMOTORES (Desplegada si el centro está activo) */}
              {centroExpanded === centro.id && (
                <div style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                  {centro.promotores.map((p, idx) => (
                    <div key={p.id} style={{ borderBottom: idx < centro.promotores.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                      
                      {/* CABECERA PROMOTOR */}
                      <div 
                        onClick={(e) => togglePromotor(p.id, e)}
                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: promotorExpanded[p.id] ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={14} color="var(--text-primary)" />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{p.name}</strong>
                              {p.isSubstituteIn && (
                                <span style={{ fontSize: '0.65rem', background: 'rgba(234, 179, 8, 0.15)', color: 'var(--warning)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                                  Sustituto de {p.originalCentro}
                                </span>
                              )}
                              {p.confirmado && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,197,94,0.15)', color: 'var(--success)', borderRadius: '50%', width: '18px', height: '18px' }} title="Semana confirmada">
                                  <CheckCircle2 size={12} strokeWidth={3} />
                                </span>
                              )}
                            </div>
                            {(() => {
                              const hoy = p.semana ? p.semana?.find(d => d.fecha === todayIso) : null;
                              if (hoy) {
                                return (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                                    {turnoIcon[hoy.iconTurno] || <Sun size={12} color="var(--text-secondary)"/>}
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hoy: <span style={{ color: 'var(--text-primary)' }}>{hoy.horas}</span></span>
                                  </div>
                                );
                              }
                              return <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>Hoy: Sin turno</span>;
                            })()}
                          </div>
                        </div>
                        <div>
                          {promotorExpanded[p.id] ? <ChevronUp size={16} color="var(--text-tertiary)"/> : <ChevronDown size={16} color="var(--text-tertiary)"/>}
                        </div>
                      </div>

                      {/* HORARIO SEMANAL (Desplegado si el promotor está activo) */}
                      {promotorExpanded[p.id] && (
                        <div style={{ padding: '0.5rem 1rem 1rem 1rem', background: 'rgba(0,0,0,0.15)' }}>
                          {p.semana && p.semana.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)', overflow: 'hidden' }}>
                              {p.semana?.map((dia, dIdx) => (
                                <div key={dIdx} style={{ 
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                  padding: '0.5rem 0.75rem', 
                                  background: dia.iconTurno === 'Descanso' ? 'transparent' : 'rgba(255,255,255,0.05)',
                                  borderBottom: dIdx < p.semana.length - 1 ? '1px solid var(--border-color)' : 'none'
                                }}>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', width: '30%' }}>
                                    {dia.diaSemana}
                                  </span>
                                  <div style={{ flex: 1, textAlign: 'right', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '500', color: dia.isSubstitutingOut ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                                      {dia.horas}
                                    </span>
                                    {dia.isSubstitutingOut && (
                                      <span style={{ fontSize: '0.65rem', color: 'var(--warning)', background: 'rgba(234, 179, 8, 0.1)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>
                                        📍 Sustituyendo en {dia.centroAsignado}
                                      </span>
                                    )}
                                  </div>
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
