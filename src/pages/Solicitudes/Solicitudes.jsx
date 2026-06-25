/* eslint-disable */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import styles from './Solicitudes.module.css';
import {
  PlusCircle, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  CalendarDays, MessageSquare, User
} from 'lucide-react';

const initialSolicitudes = [];

const estadoBadge = { pendiente: styles.badgePendiente, aprobada: styles.badgeAprobada, rechazada: styles.badgeRechazada };
const estadoIcon = {
  pendiente: <Clock size={14} />,
  aprobada: <CheckCircle2 size={14} />,
  rechazada: <XCircle size={14} />
};
const estadoLabel = { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada' };

export default function Solicitudes() {
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes);
  const [promotorStats, setPromotorStats] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ 
    tipo: 'cambio_turno', 
    dia: '', 
    horarioActual: '', 
    horarioSolicitado: '', 
    horasRealizar: '', 
    fechaInicio: '', 
    fechaFin: '', 
    motivo: '' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const location = useLocation();
  const GAS_URL = import.meta.env.VITE_GAS_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isCoord = user.role === 'coordinadora' || user.role === 'administradora';
  const isManager = user.role === 'gpv' || user.role === 'am';
  const isPromotor = user.role === 'promotor';

  const fetchSolicitudes = async () => {
    if (!GAS_URL) return;
    setLoading(true);
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getSolicitudes', username: user.username, role: user.role, name: user.name })
      });
      const data = await res.json();
      if (data.success) {
        setSolicitudes(data.solicitudes);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!GAS_URL || user.role !== 'promotor') return;
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getPromotorStats', name: user.name, username: user.username })
      });
      const data = await res.json();
      if (data.success) {
        setPromotorStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchSolicitudes();
    fetchStats();
  }, [user, GAS_URL]);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get('id');
    if (targetId && solicitudes.length > 0) {
      // Find the specific solicitud to make sure it exists, then expand
      const found = solicitudes.find(s => String(s.id) === targetId);
      if (found) {
        setExpanded(found.id); // Guarantees correct type matching
        setFiltro('todas'); // Ensure it's not hidden by filters
      }
    }
  }, [location.search, solicitudes]);

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setForm(prev => ({ ...prev, dia: newDate, horarioActual: 'Buscando...' }));
    
    if (newDate && GAS_URL) {
      setLoadingSchedule(true);
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getDailySchedule', name: user.name, date: newDate })
        });
        const data = await res.json();
        if (data.success) {
          setForm(f => ({ ...f, dia: newDate, horarioActual: data.horario }));
        }
      } catch (err) {
        setForm(f => ({ ...f, dia: newDate, horarioActual: 'Error de red' }));
      } finally {
        setLoadingSchedule(false);
      }
    } else {
      setForm(f => ({ ...f, dia: newDate, horarioActual: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!GAS_URL) return;

    let payloadDetails = { ...form };
    let jsonHorarioSolicitado = form.horarioSolicitado;
    
    if (form.tipo === 'cambio_turno' || form.tipo === 'vacaciones' || form.tipo === 'sabado_calidad') {
      jsonHorarioSolicitado = JSON.stringify({
        tipo: form.tipo,
        horarioSolicitado: form.horarioSolicitado,
        horasRealizar: form.horasRealizar,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin
      });
    }

    const solicitud = {
      promotorUsername: user.username,
      promotorName: user.name,
      dia: form.dia || form.fechaInicio || new Date().toISOString().split('T')[0],
      horarioActual: form.horarioActual || '-',
      horarioSolicitado: jsonHorarioSolicitado,
      motivo: form.motivo,
      fechaCreacion: new Date().toLocaleDateString('sv-SE') // Uses YYYY-MM-DD natively
    };

    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'createSolicitud', solicitud })
      });
      const data = await res.json();
      if (data.success) {
        await fetchSolicitudes();
        setShowForm(false);
        setForm({ 
          tipo: 'cambio_turno', dia: '', horarioActual: '', horarioSolicitado: '', 
          horasRealizar: '', fechaInicio: '', fechaFin: '', motivo: '' 
        });
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error("Error creating solicitud", err);
    }
  };

  const handleDecision = async (id, decision) => {
    if (!GAS_URL) return;

    let updates = {};
    if (decision === 'voto_aprobar' || decision === 'voto_rechazar') {
      const voto = decision === 'voto_aprobar' ? 'Aprobar' : 'Rechazar';
      if (user.role === 'gpv') updates.votoGPV = voto;
      if (user.role === 'am') updates.votoAM = voto;
    } else {
      updates.estado = decision;
      updates.aprobadaPor = user.name;
      updates.aprobadaEl = new Date().toLocaleDateString('es-ES');
    }

    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'updateSolicitud', id, updates })
      });
      const data = await res.json();
      if (data.success) {
        await fetchSolicitudes();
      }
    } catch (err) {
      console.error("Error updating decision", err);
    }
  };

  const lista = filtro === 'todas' ? solicitudes : solicitudes.filter(s => s.estado === filtro);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Solicitudes</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Gestión de días y modificaciones de horario</span>
        </div>
        {isPromotor && (
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            <PlusCircle size={18} />
            Nueva Solicitud
          </button>
        )}
      </div>

      {/* Toast */}
      {submitted && (
        <div className={styles.toast}>
          <CheckCircle2 size={18} /> Solicitud enviada correctamente. Recibirás respuesta pronto.
        </div>
      )}

      {/* Formulario nueva solicitud */}
      {showForm && (
        <div className={`card ${styles.formCard}`}>
          <h3 style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
            Nueva Solicitud
          </h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label">Motivo (Tipo de solicitud)</label>
              <select className="input-field" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="cambio_turno">Cambio de turno</option>
                <option value="vacaciones">Vacaciones</option>
                <option value="sabado_calidad">Sábado de calidad</option>
              </select>
            </div>
            
            {form.tipo === 'cambio_turno' && (
              <div className={styles.formRow}>
                <div className="input-group">
                  <label className="input-label">Día afectado</label>
                  <input className="input-field" type="date"
                    value={form.dia} onChange={handleDateChange} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Horario actual</label>
                  <input className="input-field" type="text"
                    value={form.horarioActual} readOnly
                    style={{ backgroundColor: 'rgba(255,255,255,0.02)', color: 'var(--text-tertiary)', cursor: 'not-allowed' }}
                    placeholder="Se autocompleta al elegir fecha" />
                </div>
                <div className="input-group">
                  <label className="input-label">Horario solicitado</label>
                  <input className="input-field" type="text" placeholder="ej: 12:00 - 20:00"
                    value={form.horarioSolicitado} onChange={e => setForm({ ...form, horarioSolicitado: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Horas a realizar</label>
                  <input className="input-field" type="number" step="0.5" placeholder="ej: 8"
                    value={form.horasRealizar} onChange={e => setForm({ ...form, horasRealizar: e.target.value })} required />
                </div>
              </div>
            )}

            {form.tipo === 'vacaciones' && (
              <div className={styles.formRow}>
                <div className="input-group">
                  <label className="input-label">Fecha inicial</label>
                  <input className="input-field" type="date"
                    value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Fecha fin</label>
                  <input className="input-field" type="date"
                    value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })} required />
                </div>
              </div>
            )}

            {form.tipo === 'sabado_calidad' && (
              <div className={styles.formRow}>
                <div className="input-group">
                  <label className="input-label">Sábado petición</label>
                  <input className="input-field" type="date"
                    value={form.dia} onChange={e => {
                      const d = new Date(e.target.value);
                      if (d.getDay() !== 6 && e.target.value !== '') {
                        alert("Solo puedes seleccionar un Sábado.");
                        return;
                      }
                      setForm({ ...form, dia: e.target.value });
                    }} required />
                </div>
              </div>
            )}

            <div className="input-group" style={{ marginTop: '1rem' }}>
              <label className="input-label">Justificación / Motivo</label>
              <textarea className={`input-field ${styles.textarea}`} placeholder="Explica el motivo de la petición..."
                value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} required />
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Enviar Solicitud</button>
            </div>
          </form>
        </div>
      )}

      {/* Dashboard Promotor */}
      {isPromotor && promotorStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          
          {/* Días Trabajados */}
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Días Trabajados</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--salesland-primary)', lineHeight: '1.2' }}>{promotorStats.diasTrabajados.hoy}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Días hasta fecha actual</p>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Hasta fin de año (2026):</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{promotorStats.diasTrabajados.finDeAno}</span>
              </div>
            </div>
          </div>

          {/* Vacaciones */}
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Vacaciones</h3>
            
            <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Disponibles hasta fin de año (2026):</span>
                <span style={{ fontWeight: 'bold', color: 'var(--salesland-primary)' }}>{promotorStats.vacaciones.generadasFinDeAno}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>A día de hoy:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{promotorStats.vacaciones.generadasHoy}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Aprobadas:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{promotorStats.vacaciones.aprobadas}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Pendientes (Total 2026):</span>
                <span style={{ fontWeight: 'bold', color: promotorStats.vacaciones.pendientesFinDeAno < 0 ? 'var(--danger)' : 'var(--salesland-primary)' }}>
                  {promotorStats.vacaciones.pendientesFinDeAno}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pendientes (A día de hoy):</span>
                <span style={{ fontWeight: 'bold', color: promotorStats.vacaciones.pendientesHoy < 0 ? 'var(--danger)' : 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {promotorStats.vacaciones.pendientesHoy}
                </span>
              </div>
            </div>
          </div>

          {/* Sábados de Calidad */}
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Sábados de Calidad</h3>
            
            <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Disponibles hasta fin de año (2026):</span>
                <span style={{ fontWeight: 'bold', color: 'var(--salesland-primary)' }}>{promotorStats.sabados.generadasFinDeAno}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>A día de hoy:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{promotorStats.sabados.generadasHoy}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Aprobados:</span>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{promotorStats.sabados.aprobadas}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Pendientes (Total 2026):</span>
                <span style={{ fontWeight: 'bold', color: promotorStats.sabados.pendientesFinDeAno < 0 ? 'var(--danger)' : 'var(--salesland-primary)' }}>
                  {promotorStats.sabados.pendientesFinDeAno}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pendientes (A día de hoy):</span>
                <span style={{ fontWeight: 'bold', color: promotorStats.sabados.pendientesHoy < 0 ? 'var(--danger)' : 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {promotorStats.sabados.pendientesHoy}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Contenedor Principal de Solicitudes */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
          {/* Filtros */}
          <div className={styles.filtros} style={{ margin: 0 }}>
            {['todas', 'pendiente', 'aprobada', 'rechazada'].map(f => (
              <button key={f} className={`${styles.filtroBtn} ${filtro === f ? styles.filtroActivo : ''}`}
                onClick={() => setFiltro(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className={styles.filtroCount}>
                  {f === 'todas' ? solicitudes.length : solicitudes.filter(s => s.estado === f).length}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: 'transparent' }}>
          {/* Lista */}

      <div className={styles.lista}>
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Cargando solicitudes...</p>
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
            <p>Error: {error}</p>
          </div>
        ) : lista.map(sol => {
          let details = null;
          try {
            if (sol.horarioSolicitado && sol.horarioSolicitado.startsWith('{')) {
              details = JSON.parse(sol.horarioSolicitado);
            }
          } catch(e) {}
          
          const isOld = !details;
          const tipo = details ? details.tipo : 'cambio_turno';
          
          let tipoLabel = 'Cambio Turno';
          let tipoColor = 'var(--info)';
          if (tipo === 'vacaciones') { tipoLabel = 'Vacaciones'; tipoColor = '#7c3aed'; }
          else if (tipo === 'sabado_calidad') { tipoLabel = 'Sábado Calidad'; tipoColor = 'var(--accent-primary)'; }
          
          return (
          <div key={sol.id} className={`card ${styles.solicitudCard}`}>
            <div className={styles.solicitudHeader} onClick={() => setExpanded(expanded === sol.id ? null : sol.id)}>
              <div className={styles.solicitudMeta}>
                <span className={styles.solicitudId}>Solicitud #{sol.id}</span>
                <span style={{ backgroundColor: `${tipoColor}20`, color: tipoColor, padding: '0.2rem 0.5rem', borderRadius: 'var(--border-radius-sm)', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {tipoLabel}
                </span>
                <div className={`${styles.badge} ${estadoBadge[sol.estado]}`}>
                  {estadoIcon[sol.estado]}
                  {estadoLabel[sol.estado]}
                </div>
                {sol.votoGPV && !isPromotor && (
                  <div className={styles.badge} style={{ 
                    backgroundColor: sol.votoGPV === 'Aprobar' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
                    color: sol.votoGPV === 'Aprobar' ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${sol.votoGPV === 'Aprobar' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                  }}>
                    {sol.votoGPV === 'Aprobar' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                    GPV: {sol.votoGPV === 'Aprobar' ? 'Recomienda Aprobar' : 'Recomienda Rechazo'}
                  </div>
                )}
                {sol.votoAM && !isPromotor && (
                  <div className={styles.badge} style={{ 
                    backgroundColor: sol.votoAM === 'Aprobar' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
                    color: sol.votoAM === 'Aprobar' ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${sol.votoAM === 'Aprobar' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                  }}>
                    {sol.votoAM === 'Aprobar' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                    AM: {sol.votoAM === 'Aprobar' ? 'Recomienda Aprobar' : 'Recomienda Rechazo'}
                  </div>
                )}
              </div>
              <div className={styles.solicitudInfo}>
                <span><User size={14} /> {sol.promotor}</span>
                {tipo === 'vacaciones' ? (
                  <span><CalendarDays size={14} /> {details.fechaInicio} al {details.fechaFin}</span>
                ) : (
                  <span><CalendarDays size={14} /> {sol.dia}</span>
                )}
                
                {tipo === 'cambio_turno' && (
                  <span><Clock size={14} /> {isOld ? sol.horarioSolicitado : details.horarioSolicitado} ({details?.horasRealizar || '-'}h)</span>
                )}
              </div>
              <button className={styles.expandBtn}>
                {expanded === sol.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {expanded === sol.id && (
              <div className={styles.solicitudDetalle}>
                {tipo === 'cambio_turno' && (
                  <div className={styles.detalleGrid}>
                    <div className={styles.detalleItem}>
                      <span className={styles.detalleLabel}>Horario Actual</span>
                      <span className={styles.detalleValor}>{sol.horarioActual}</span>
                    </div>
                    <div className={styles.detalleArrow}>→</div>
                    <div className={styles.detalleItem}>
                      <span className={styles.detalleLabel}>Horario Solicitado</span>
                      <span className={`${styles.detalleValor} ${styles.detalleNuevo}`}>{isOld ? sol.horarioSolicitado : details.horarioSolicitado}</span>
                    </div>
                  </div>
                )}
                <div className={styles.motivoBox}>
                  <MessageSquare size={16} />
                  <p>{sol.motivo}</p>
                </div>
                <div className={styles.detalleFooter}>
                  <span>Enviada: {sol.fecha}</span>
                  {sol.aprobadaPor && !isPromotor && (
                    <span>{sol.estado === 'aprobada' ? '✓ Aprobada' : '✗ Rechazada'} por {sol.aprobadaPor} · {sol.aprobadaEl}</span>
                  )}
                  {sol.aprobadaPor && isPromotor && (
                    <span>{sol.estado === 'aprobada' ? '✓ Aprobada' : '✗ Rechazada'} · {sol.aprobadaEl}</span>
                  )}
                </div>

                {sol.votoGPV && !isPromotor && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--border-radius-md)', fontSize: '0.85rem' }}>
                    <strong style={{ color: sol.votoGPV === 'Aprobar' ? 'var(--success)' : 'var(--danger)' }}>
                      GPV: {sol.votoGPV === 'Aprobar' ? 'Recomienda Aprobar' : 'Recomienda Rechazo'}
                    </strong>
                  </div>
                )}

                {sol.votoAM && !isPromotor && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--border-radius-md)', fontSize: '0.85rem' }}>
                    <strong style={{ color: sol.votoAM === 'Aprobar' ? 'var(--success)' : 'var(--danger)' }}>
                      AM: {sol.votoAM === 'Aprobar' ? 'Recomienda Aprobar' : 'Recomienda Rechazo'}
                    </strong>
                  </div>
                )}

                {isManager && sol.estado === 'pendiente' && ((user.role === 'gpv' && !sol.votoGPV) || (user.role === 'am' && !sol.votoAM)) && (
                  <div className={styles.accionesCoord} style={{ flexWrap: 'wrap' }}>
                    <button className={`btn ${styles.btnRechazar}`} onClick={() => handleDecision(sol.id, 'voto_rechazar')}>
                      <XCircle size={16} /> Recomendar Rechazo
                    </button>
                    <button className={`btn ${styles.btnAprobar}`} onClick={() => handleDecision(sol.id, 'voto_aprobar')}>
                      <CheckCircle2 size={16} /> Recomendar Aprobación
                    </button>
                  </div>
                )}

                {isCoord && sol.estado === 'pendiente' && (
                  <div className={styles.accionesCoord} style={{ flexWrap: 'wrap' }}>
                    <button className={`btn ${styles.btnRechazar}`} onClick={() => handleDecision(sol.id, 'rechazada')}>
                      <XCircle size={16} /> Rechazar
                    </button>
                    <button className={`btn ${styles.btnAprobar}`} onClick={() => handleDecision(sol.id, 'aprobada')}>
                      <CheckCircle2 size={16} /> Aceptar Oficialmente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )})}
        {!loading && !error && lista.length === 0 && (
          <div className={styles.emptyState}>
            <CalendarDays size={40} />
            <p>No hay solicitudes con este filtro.</p>
          </div>
        )}
      </div>
      </div>
      </div>
    </div>
  );
}
