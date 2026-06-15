import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './ControlHoras.module.css';
import { TrendingUp, TrendingDown, Minus, Clock, BarChart3, CalendarDays } from 'lucide-react';

export default function ControlHoras() {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedMember, setSelectedMember] = useState(user.role === 'promotor' ? user.name : null);
  
  const [team, setTeam] = useState([]);
  const [semanas, setSemanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const GAS_URL = import.meta.env.VITE_GAS_URL;

  // Cargar equipo si es manager
  useEffect(() => {
    const fetchTeam = async () => {
      if (user.role === 'promotor' || !GAS_URL) return;
      try {
        const res = await fetch(GAS_URL, { method: 'POST', body: JSON.stringify({ action: 'getUsers' }) });
        const data = await res.json();
        if (data.success) {
          // Filtrar promotores que pertenecen a este manager
          const myTeam = data.users.filter(u => 
            u.role === 'promotor' && 
            (u.manager.gpv === user.name || u.manager.am === user.name || user.role === 'coordinadora')
          );
          setTeam(myTeam);
          if (myTeam.length > 0 && !selectedMember) {
            setSelectedMember(myTeam[0].name);
          }
        }
      } catch (err) {
        console.error("Error loading team", err);
      }
    };
    fetchTeam();
  }, [user, GAS_URL]);

  // Cargar horas del miembro seleccionado
  useEffect(() => {
    const fetchHours = async () => {
      if (!selectedMember || !GAS_URL) return;
      setLoading(true);
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getControlHoras', name: selectedMember })
        });
        const data = await res.json();
        if (data.success) {
          setSemanas(data.semanas);
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
  }, [selectedMember, GAS_URL]);

  const balanceAcumulado = semanas.reduce((acc, s) => acc + (s.planificadas - s.cobertura), 0);

  const getBadge = (diff) => {
    if (diff === 0) return { cls: styles.balanceNeutro, icon: <Minus size={14} />, label: '0 h — Compensado' };
    if (diff > 0) return { cls: styles.balancePositivo, icon: <TrendingUp size={14} />, label: `+${diff} h — Exceso` };
    return { cls: styles.balanceNegativo, icon: <TrendingDown size={14} />, label: `${diff} h — Déficit` };
  };

  const acumBadge = getBadge(balanceAcumulado);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 style={{ color: '#1a1a1a', fontSize: '1.6rem' }}>Control de Horas</h2>
          <p style={{ color: '#555', marginTop: '0.25rem' }}>Balance de horas de cobertura vs planificadas</p>
        </div>
        <div className={`${styles.acumBadge} ${acumBadge.cls}`}>
          <BarChart3 size={18} />
          <span>Balance acumulado: <strong>{acumBadge.label}</strong></span>
        </div>
      </div>

      {/* Resumen Cards */}
      <div className={styles.statsRow}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className={styles.statIcon} style={{ background: 'rgba(255,103,0,0.12)', color: 'var(--accent-primary)' }}>
            <Clock size={28} />
          </div>
          <p className={styles.statLabel}>Horas Contrato / Semana</p>
          <p className={styles.statValue}>40 h</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className={styles.statIcon} style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--info)' }}>
            <CalendarDays size={28} />
          </div>
          <p className={styles.statLabel}>Semanas Registradas</p>
          <p className={styles.statValue}>{semanas.length}</p>
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

      {user.role !== 'promotor' && (
        <div className="card" style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Seleccionar Promotor</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {team.map(m => (
              <button
                key={m.username}
                className={`btn ${selectedMember === m.name ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedMember(m.name)}
                style={{ padding: '0.4rem 0.875rem', fontSize: '0.85rem' }}
              >
                {m.name}
              </button>
            ))}
            {team.length === 0 && <span style={{fontSize:'0.85rem', color:'var(--text-tertiary)'}}>No hay promotores asignados</span>}
          </div>
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
          <p>No hay registro de horas para este usuario.</p>
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
                  <tr key={s.num} className={selectedWeek === s.num ? styles.rowSelected : ''}
                    onClick={() => setSelectedWeek(selectedWeek === s.num ? null : s.num)}>
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

      {/* Audit log simplificado */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Registro de Auditoría</h3>
        {/* Audit log */}
        <div className={styles.auditLog}>
          {(() => {
            const allLogs = []; // TODO: Implementar backend para Registro de Auditoría

            const visibleLogs = allLogs.filter(log => {
              if (user.role === 'coordinadora' || user.role === 'am') return true;
              if (user.role === 'gpv') return log.refUsername === 'global' || team.some(m => m.username === log.refUsername);
              if (user.role === 'promotor') return log.refUsername === user.username || log.refUsername === 'global';
              return false;
            });

            if (visibleLogs.length === 0) return <p style={{color: 'var(--text-tertiary)', fontSize: '0.85rem'}}>No hay registros recientes.</p>;

            return visibleLogs.map((entry, i) => (
              <div key={i} className={styles.auditRow}>
                <span className={`${styles.auditDot} ${styles[`audit_${entry.tipo}`]}`} />
                <div className={styles.auditContent}>
                  <span className={styles.auditAccion}>{entry.accion}</span>
                  <span className={styles.auditMeta}>{entry.autor} · {entry.fecha}</span>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}
