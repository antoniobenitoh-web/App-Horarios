import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './ControlHoras.module.css';
import { TrendingUp, TrendingDown, Minus, Clock, BarChart3, CalendarDays, Search, User, MapPin, X, Calendar, Users } from 'lucide-react';

const meses = [
  { id: 'todos', name: 'Todos los meses' },
  { id: 'Ene', name: 'Enero' },
  { id: 'Feb', name: 'Febrero' },
  { id: 'Mar', name: 'Marzo' },
  { id: 'Abr', name: 'Abril' },
  { id: 'May', name: 'Mayo' },
  { id: 'Jun', name: 'Junio' },
  { id: 'Jul', name: 'Julio' },
  { id: 'Ago', name: 'Agosto' },
  { id: 'Sep', name: 'Septiembre' },
  { id: 'Oct', name: 'Octubre' },
  { id: 'Nov', name: 'Noviembre' },
  { id: 'Dic', name: 'Diciembre' }
];

const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};

export default function ControlHoras() {
  const { user } = useAuth();
  
  const [team, setTeam] = useState([]);
  const [semanasRaw, setSemanasRaw] = useState([]); // All fetched weeks
  const [semanas, setSemanas] = useState([]); // Filtered weeks
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [busqueda, setBusqueda] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]); // Array of { type: 'promotor'|'centro', text: string }
  
  const currentMonthNum = new Date().getMonth(); // 0 to 11
  const [selectedMonth, setSelectedMonth] = useState('todos');
  
  const [dailyCoverage, setDailyCoverage] = useState({ covered: 0, total: 0 });

  const GAS_URL = import.meta.env.VITE_GAS_URL;
  const todayIso = new Date().toISOString().split('T')[0];

  // 1. Fetch team
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
        }
      } catch (err) {
        console.error("Error loading team", err);
      }
    };
    fetchTeam();
  }, [user, GAS_URL]);

  useEffect(() => {
    if (user.role === 'promotor') {
      setSelectedFilters([{ type: 'promotor', text: user.name }]);
    }
  }, [user]);

  // 2. Fetch Control Horas
  useEffect(() => {
    const fetchHours = async () => {
      if (!GAS_URL) return;
      if (user.role !== 'promotor' && team.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        let namesToFetch = [];
        
        if (user.role === 'promotor') {
          namesToFetch = [user.name];
        } else {
          if (selectedFilters.length === 0) {
            namesToFetch = team.map(t => t.name);
          } else {
            const centros = selectedFilters.filter(f => f.type === 'centro').map(f => f.text);
            const promos = selectedFilters.filter(f => f.type === 'promotor').map(f => f.text);
            
            const matchedPromos = new Set(promos);
            team.forEach(t => {
              if (centros.includes(t.centro)) matchedPromos.add(t.name);
            });
            namesToFetch = Array.from(matchedPromos);
          }
        }
        
        if (namesToFetch.length === 0) {
          setSemanasRaw([]);
          setLoading(false);
          return;
        }

        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getControlHoras', names: namesToFetch })
        });
        const data = await res.json();
        
        if (data.success) {
          setSemanasRaw(data.semanas);
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
  }, [selectedFilters, team, user, GAS_URL]);

  // 3. Fetch Coverage
  useEffect(() => {
    const fetchCoverage = async () => {
      if (user.role === 'promotor' || !GAS_URL || team.length === 0) return;
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getEquipoWeekly', weekNum: getISOWeek(new Date()), role: user.role, name: user.name })
        });
        const data = await res.json();
        if (data.success && data.equipo) {
          let filteredEquipo = data.equipo;
          
          if (selectedFilters.length > 0) {
            const centros = selectedFilters.filter(f => f.type === 'centro').map(f => f.text);
            const promos = selectedFilters.filter(f => f.type === 'promotor').map(f => f.text);
            
            filteredEquipo = filteredEquipo.filter(p => promos.includes(p.name) || centros.includes(p.centro));
          }

          const centrosMap = {};
          filteredEquipo.forEach(p => {
            if (p.centro && p.centro !== 'Sin asignar') {
              if (!centrosMap[p.centro]) centrosMap[p.centro] = [];
              centrosMap[p.centro].push(p);
            }
          });

          const totalCentros = Object.keys(centrosMap).length;
          let coveredCentros = 0;

          Object.values(centrosMap).forEach(promotersInCentro => {
            const hasCoverage = promotersInCentro.some(p => {
              if (!p.semana) return false;
              const todayShift = p.semana.find(d => d.fecha === todayIso);
              return todayShift && todayShift.iconTurno !== 'Descanso' && todayShift.turno !== '-';
            });
            if (hasCoverage) coveredCentros++;
          });

          setDailyCoverage({ covered: coveredCentros, total: totalCentros });
        }
      } catch (err) {
        console.error("Error loading coverage", err);
      }
    };
    fetchCoverage();
  }, [team, user, GAS_URL, selectedFilters, todayIso]);

  // Aplicar filtro de mes
  useEffect(() => {
    if (selectedMonth === 'todos') {
      setSemanas(semanasRaw);
    } else {
      const filtered = semanasRaw.filter(s => {
        return s.dias && s.dias.toLowerCase().includes(selectedMonth.toLowerCase());
      });
      setSemanas(filtered);
    }
  }, [semanasRaw, selectedMonth]);

  const getBadge = (diff) => {
    if (diff === 0) return { cls: styles.balanceNeutro, icon: <Minus size={14} />, label: '0 h — Compensado' };
    if (diff > 0) return { cls: styles.balancePositivo, icon: <TrendingUp size={14} />, label: `+${diff} h — Exceso` };
    return { cls: styles.balanceNegativo, icon: <TrendingDown size={14} />, label: `${diff} h — Déficit` };
  };

  const balanceAcumulado = semanas.reduce((acc, s) => acc + (s.planificadas - s.cobertura), 0);
  const acumBadge = getBadge(balanceAcumulado);

  const b = busqueda.toLowerCase();
  let suggestions = [];
  if (b.length > 0) {
    const uniqueCentros = [...new Set(team.map(t => t.centro).filter(c => c && c !== 'Sin asignar'))];
    const sCentros = uniqueCentros.filter(c => c.toLowerCase().includes(b)).slice(0, 3).map(c => ({ type: 'centro', text: c }));
    const sPromotores = team.filter(p => p.name.toLowerCase().includes(b)).slice(0, 5).map(p => ({ type: 'promotor', text: p.name }));
    suggestions = [...sCentros, ...sPromotores];
  }

  const addFilter = (item) => {
    if (!selectedFilters.some(f => f.type === item.type && f.text === item.text)) {
      setSelectedFilters([...selectedFilters, item]);
    }
    setBusqueda('');
    setShowSuggestions(false);
  };

  const removeFilter = (item) => {
    setSelectedFilters(selectedFilters.filter(f => !(f.type === item.type && f.text === item.text)));
  };

  const calculateUniqueCenters = () => {
    if (selectedFilters.length === 0) {
      return [...new Set(team.map(t => t.centro).filter(c => c && c !== 'Sin asignar'))].length;
    }
    const centros = selectedFilters.filter(f => f.type === 'centro').map(f => f.text);
    const promos = selectedFilters.filter(f => f.type === 'promotor').map(f => f.text);
    const allRelevantCentros = new Set(centros);
    team.forEach(t => {
      if (promos.includes(t.name) && t.centro && t.centro !== 'Sin asignar') {
        allRelevantCentros.add(t.centro);
      }
    });
    return allRelevantCentros.size;
  };

  const calculatePromotersAssigned = () => {
    if (selectedFilters.length === 0) return team.length;
    const centros = selectedFilters.filter(f => f.type === 'centro').map(f => f.text);
    const promos = selectedFilters.filter(f => f.type === 'promotor').map(f => f.text);
    const matchedPromos = new Set(promos);
    team.forEach(t => {
      if (centros.includes(t.centro)) matchedPromos.add(t.name);
    });
    return matchedPromos.size;
  };

  return (
    <div className={styles.container}>
      {/* HEADER: Balance to the right, followed by Month Filter */}
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Control de Horas</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Balance de horas de cobertura vs planificadas</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div className={`${styles.acumBadge} ${acumBadge.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-full)' }}>
            <BarChart3 size={18} />
            <span>Balance acumulado: <strong>{acumBadge.label}</strong></span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.8rem', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--glass-border)' }}>
            <Calendar size={14} color="var(--accent-primary)" />
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-light-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }}
            >
              {meses.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen Cards */}
      <div className={styles.statsRow}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className={styles.statIcon} style={{ background: 'rgba(255,103,0,0.12)', color: 'var(--accent-primary)' }}>
            <Clock size={28} />
          </div>
          <p className={styles.statLabel}>Cobertura Diaria (Hoy)</p>
          <p className={styles.statValue}>
            {user.role === 'promotor' ? 'N/A' : `${dailyCoverage.covered}/${dailyCoverage.total}`}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className={styles.statIcon} style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--info)' }}>
            <Users size={28} />
          </div>
          <p className={styles.statLabel}>Centros y Promotores</p>
          <p className={styles.statValue} style={{ fontSize: '1.2rem' }}>
            {calculateUniqueCenters()} Centros | {calculatePromotersAssigned()} Prom.
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className={`${styles.statIcon}`}
            style={{ background: balanceAcumulado === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: balanceAcumulado === 0 ? 'var(--success)' : 'var(--danger)' }}>
            {balanceAcumulado === 0 ? <Minus size={28} /> : balanceAcumulado > 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
          </div>
          <p className={styles.statLabel}>Balance Total</p>
          <p className={styles.statValue} style={{ color: balanceAcumulado === 0 ? 'var(--success)' : 'var(--danger)' }}>
            {balanceAcumulado > 0 ? `+${balanceAcumulado}` : balanceAcumulado} h
          </p>
        </div>
      </div>

      {/* BUSCADOR / FILTRO INTELIGENTE debajo de las cards y encima de la tabla */}
      {user.role !== 'promotor' && (
        <div className={styles.filtrosBar} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--glass-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-light-primary)', margin: 0 }}>Filtrar Datos</h3>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-light-primary)', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: 'var(--border-radius-md)', fontSize: '0.875rem', outline: 'none' }}
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
                    onMouseDown={() => addFilter(s)}
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
          
          {selectedFilters.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {selectedFilters.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: f.type === 'centro' ? 'rgba(255,103,0,0.15)' : 'rgba(255,255,255,0.1)', border: f.type === 'centro' ? '1px solid rgba(255,103,0,0.3)' : '1px solid rgba(255,255,255,0.15)', padding: '0.25rem 0.6rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.75rem', color: 'var(--text-light-primary)' }}>
                  {f.type === 'centro' ? <MapPin size={10} color="var(--accent-primary)"/> : <User size={10} />}
                  {f.text}
                  <X size={12} style={{ cursor: 'pointer', marginLeft: '0.2rem' }} onClick={() => removeFilter(f)} />
                </div>
              ))}
            </div>
          )}
          {selectedFilters.length === 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Mostrando el histórico y cobertura de todo tu equipo. Busca un promotor o centro para filtrar.
            </div>
          )}
        </div>
      )}

      {/* Tabla de semanas */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem' }}>Histórico Semanal</h3>
        {loading ? (
          <p>Cargando datos desde Google Sheets...</p>
        ) : error ? (
          <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
        ) : semanas.length === 0 ? (
          <p>No hay registro de horas para los filtros seleccionados o el mes en curso.</p>
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
              {semanas.map((s) => {
                const diff = s.planificadas - s.cobertura;
                const badge = getBadge(diff);
                return (
                  <tr key={s.num}>
                    <td><strong>Semana {s.num}</strong></td>
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
