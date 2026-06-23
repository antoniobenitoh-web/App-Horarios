/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './ControlHoras.module.css';
import { TrendingUp, TrendingDown, Minus, Clock, BarChart3, CalendarDays, Search, User, MapPin, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const getISOWeek = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
};

// Obtiene las semanas ISO que caen dentro de un mes dado
// Se asigna cada semana exclusivamente al mes que contiene su jueves (mayoría de días)
const getMonthWeeks = (monthIndex) => {
  const now = new Date();
  const year = now.getFullYear();
  const weeks = [];
  const numDays = new Date(year, monthIndex + 1, 0).getDate();
  for (let d = 1; d <= numDays; d++) {
    const date = new Date(year, monthIndex, d);
    // 4 = Jueves. Esto evita que semanas superpuestas aparezcan en dos meses.
    if (date.getDay() === 4) {
      const week = getISOWeek(date);
      if (!weeks.includes(week)) {
        weeks.push(week);
      }
    }
  }
  return weeks;
};

const mesesDisponibles = [
  { label: 'Enero', value: 0 },
  { label: 'Febrero', value: 1 },
  { label: 'Marzo', value: 2 },
  { label: 'Abril', value: 3 },
  { label: 'Mayo', value: 4 },
  { label: 'Junio', value: 5 },
  { label: 'Julio', value: 6 },
  { label: 'Agosto', value: 7 },
  { label: 'Septiembre', value: 8 },
  { label: 'Octubre', value: 9 },
  { label: 'Noviembre', value: 10 },
  { label: 'Diciembre', value: 11 }
];

export default function ControlHoras() {
  const { user } = useAuth();
  
  const [team, setTeam] = useState([]);
  const [teamError, setTeamError] = useState(null);
  const [semanasRaw, setSemanasRaw] = useState([]); // Todas las semanas
  const [semanas, setSemanas] = useState([]); // Semanas filtradas por mes
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedPromotors, setSelectedPromotors] = useState(user.role === 'promotor' ? [user.name] : []);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRegion, setFiltroRegion] = useState('todas');
  const [filtroCentro, setFiltroCentro] = useState('todos');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const GAS_URL = import.meta.env.VITE_GAS_URL;

  // 1. Cargar equipo
  useEffect(() => {
    const fetchTeam = async () => {
      if (user.role === 'promotor' || !GAS_URL) {
        if (!GAS_URL) setTeamError('Falta GAS_URL');
        return;
      }
      try {
        const res = await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
        const data = await res.json();
        if (data.success) {
          let myTeam = [];
          if (user.role === 'administradora') {
            myTeam = data.users.filter(u => u.role === 'promotor');
          } else {
            myTeam = data.users.filter(u => 
              u.role === 'promotor' && 
              (String(u.manager?.gpv || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
               String(u.manager?.am || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() || 
               String(u.manager?.administradora || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() ||
               String(u.manager?.trainer || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase() ||
               String(u.manager?.coordinadora || "").trim().toLowerCase() === String(user.name || "").trim().toLowerCase())
            );
          }
          setTeam(myTeam);
          if (myTeam.length === 0) setTeamError(`No se encontraron promotores asignados a ${user.name} (${user.role}).`);
        } else {
          setTeamError(`Error del backend al cargar equipo: ${data.error || 'Desconocido'}`);
        }
      } catch (err) {
        setTeamError(`Error de red al cargar equipo: ${err.message}`);
        console.error("Error loading team", err);
      }
    };
    fetchTeam();
  }, [user, GAS_URL]);

  // Variables de filtrado general
  const teamFiltradoPorRegion = filtroRegion === 'todas' ? team : team.filter(u => u.region === filtroRegion);
  const centrosDisponibles = Array.from(new Set(teamFiltradoPorRegion.map(u => u.centro).filter(c => c && c.trim() !== 'Sin asignar'))).sort();
  const teamFiltrado = filtroCentro === 'todos' ? teamFiltradoPorRegion : teamFiltradoPorRegion.filter(u => u.centro === filtroCentro);
  
  const b = busqueda.toLowerCase();
  const filteredTeamBusqueda = teamFiltrado.filter(p => 
    p.name.toLowerCase().includes(b) || (p.centro && p.centro.toLowerCase().includes(b))
  );

  // 2. Fetch Control Horas
  useEffect(() => {
    const fetchHours = async () => {
      if (!GAS_URL) return;
      if (team.length === 0 && user.role !== 'promotor') return; // Esperar a que cargue el equipo
      
      // Si el array selectedPromotors está vacío, significa Visión Global (coge todos los filtrados)
      let namesToFetch = selectedPromotors;
      if (user.role !== 'promotor' && selectedPromotors.length === 0) {
        namesToFetch = teamFiltrado.map(p => p.name);
      }
      
      if (namesToFetch.length === 0) {
        setSemanasRaw([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const payload = { action: 'getControlHoras', names: namesToFetch };
        // Backwards compatibility with old backend
        if (namesToFetch.length > 0) {
          payload.name = namesToFetch[0];
        }
        
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
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
    
    const timeoutId = setTimeout(fetchHours, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [selectedPromotors, filtroRegion, filtroCentro, team, GAS_URL, user]);

  // 3. Filtrar semanas automáticamente por el mes seleccionado y agruparlas
  useEffect(() => {
    const monthWeeks = getMonthWeeks(selectedMonth);
    const filtered = semanasRaw.filter(s => {
      const numParsed = parseInt(String(s.num).replace(/\D/g, ''), 10);
      return monthWeeks.includes(numParsed);
    });
    
    // Agrupación de semanas (Sumar horas planificadas y cobertura)
    const agrupadas = filtered.reduce((acc, curr) => {
      const key = curr.num;
      if (!acc[key]) {
        acc[key] = { ...curr, planificadas: 0, cobertura: 0 };
      }
      acc[key].planificadas += curr.planificadas;
      acc[key].cobertura += curr.cobertura;
      return acc;
    }, {});
    
    // Convertir de nuevo a array y ordenar
    const arrayAgrupado = Object.values(agrupadas).sort((a, b) => {
      const numA = parseInt(String(a.num).replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(String(b.num).replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
    
    setSemanas(arrayAgrupado);
  }, [semanasRaw, selectedMonth]);

  const getBadge = (diff) => {
    if (diff === 0) return { cls: styles.balanceNeutro, icon: <Minus size={14} />, label: '0 h — Compensado' };
    if (diff > 0) return { cls: styles.balancePositivo, icon: <TrendingUp size={14} />, label: `+${diff} h — Exceso` };
    return { cls: styles.balanceNegativo, icon: <TrendingDown size={14} />, label: `${diff} h — Déficit` };
  };

  const balanceAcumulado = semanas.reduce((acc, s) => acc + (s.cobertura - s.planificadas), 0);
  const acumBadge = getBadge(balanceAcumulado);

  const regionesDisponibles = Array.from(new Set(team.map(u => u.region).filter(r => r && r.trim() !== ''))).sort();

  const handlePrevMonth = () => {
    if (selectedMonth > 0) setSelectedMonth(prev => prev - 1);
  };

  const handleNextMonth = () => {
    if (selectedMonth < 11) setSelectedMonth(prev => prev + 1);
  };

  const currentYear = new Date().getFullYear();
  const getMonthNameYear = (monthIndex) => {
    const m = mesesDisponibles.find(x => x.value === monthIndex);
    return m ? `${m.label} ${currentYear}` : '';
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Control de Horas</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Balance del mes actual</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <div className={styles.monthSelector} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.6rem', borderRadius: 'var(--border-radius-full)', border: '1px solid rgba(255,255,255,0.05)', minWidth: '220px' }}>
            <button type="button" onClick={handlePrevMonth} disabled={selectedMonth <= 0} style={{ background: 'transparent', border: 'none', color: selectedMonth <= 0 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)', cursor: selectedMonth <= 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--accent-primary)', minWidth: '100px', textAlign: 'center', flex: 1 }}>
              {getMonthNameYear(selectedMonth)}
            </span>
            <button type="button" onClick={handleNextMonth} disabled={selectedMonth >= 11} style={{ background: 'transparent', border: 'none', color: selectedMonth >= 11 ? 'rgba(0,0,0,0.1)' : 'var(--salesland-primary)', cursor: selectedMonth >= 11 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}>
              <ChevronRight size={18} />
            </button>
          </div>
          {user.role === 'promotor' && (
            <div className={`${styles.acumBadge} ${acumBadge.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius-full)' }}>
              <BarChart3 size={18} />
              <span>Balance mensual: <strong>{acumBadge.label}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Selección de Promotores (Solo Managers) */}
      {user.role !== 'promotor' && (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="var(--accent-primary)" />
              Selección de Equipo
            </h3>
            
            <button 
              onClick={() => { setSelectedPromotors([]); setFiltroCentro('todos'); setBusqueda(''); }}
              style={{
                background: selectedPromotors.length === 0 ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-tertiary)',
                color: selectedPromotors.length === 0 ? 'var(--success)' : 'var(--text-secondary)',
                border: selectedPromotors.length === 0 ? '1px solid var(--success)' : '1px solid var(--border-color)',
                padding: '0.4rem 1rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {selectedPromotors.length === 0 ? '✓ Visión Global Activa' : 'Limpiar Selección (Ver Todos)'}
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            {(user.role === 'administradora' || user.role === 'coordinadora') && (
              <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.5rem 0.8rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <MapPin size={16} color="var(--accent-primary)" />
                <select 
                  value={filtroRegion} 
                  onChange={e => { setFiltroRegion(e.target.value); setFiltroCentro('todos'); setSelectedPromotors([]); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', width: '100%' }}
                >
                  <option value="todas" style={{ background: '#ffffff', color: '#1e293b' }}>Todas las regiones</option>
                  {regionesDisponibles.map(r => (
                    <option key={r} value={r} style={{ background: '#ffffff', color: '#1e293b' }}>{r}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.5rem 0.8rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
              <MapPin size={16} color="var(--info)" />
              <select 
                value={filtroCentro} 
                onChange={e => { setFiltroCentro(e.target.value); setSelectedPromotors([]); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', width: '100%' }}
              >
                <option value="todos" style={{ background: '#ffffff', color: '#1e293b' }}>Todos los centros</option>
                {centrosDisponibles.map(c => (
                  <option key={c} value={c} style={{ background: '#ffffff', color: '#1e293b' }}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 200px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem 0.8rem 0.5rem 2.2rem', borderRadius: 'var(--border-radius-md)', fontSize: '0.85rem', outline: 'none' }}
                type="text"
                placeholder="Buscar promotor..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          
          {teamError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem', border: '1px solid var(--danger)' }}>
              <strong>Error cargando equipo:</strong> {teamError}
            </div>
          )}

          {/* Grilla de Checkboxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {filteredTeamBusqueda.map((p) => {
              const isChecked = selectedPromotors.includes(p.name);
              return (
                <label
                  key={p.name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem',
                    background: isChecked ? 'rgba(255,103,0,0.1)' : 'var(--bg-tertiary)',
                    border: isChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-md)', cursor: 'pointer', transition: 'all 0.2s',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => { if(!isChecked) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                  onMouseLeave={(e) => { if(!isChecked) e.currentTarget.style.borderColor = 'var(--border-color)' }}
                >
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPromotors([...selectedPromotors, p.name]);
                      } else {
                        setSelectedPromotors(selectedPromotors.filter(name => name !== p.name));
                      }
                    }}
                    style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontWeight: isChecked ? '600' : '500', color: isChecked ? 'var(--accent-primary)' : 'var(--text-primary)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.centro || 'Sin asignar'}
                    </span>
                  </div>
                </label>
              );
            })}
            {filteredTeamBusqueda.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', gridColumn: '1 / -1', textAlign: 'center', padding: '1rem' }}>No se encontraron promotores.</p>
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
          Histórico Semanal
        </h3>
        {loading ? (
          <p>Cargando datos desde Google Sheets...</p>
        ) : error ? (
          <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
        ) : semanas.length === 0 ? (
          <p>No hay registro de horas para el mes seleccionado.</p>
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
                    <td data-label="Semana"><strong>{displayNum}</strong></td>
                    <td data-label="Período" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.dias}</td>
                    <td data-label="Habitual">{s.cobertura} h</td>
                    <td data-label="Planificadas">{s.planificadas} h</td>
                    <td data-label="Diferencia">
                      <span className={`${styles.diffBadge} ${badge.cls}`}>
                        {badge.icon} {diff > 0 ? `+${diff}` : diff} h
                      </span>
                    </td>
                    <td data-label="Balance">
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
