import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const [filtro, setFiltro] = useState('todas');
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dia: '', horarioActual: '', horarioSolicitado: '', motivo: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const GAS_URL = import.meta.env.VITE_GAS_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isCoord = user.role === 'coordinadora';
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

  React.useEffect(() => {
    fetchSolicitudes();
  }, [user, GAS_URL]);

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setForm({ ...form, dia: newDate, horarioActual: 'Buscando...' });
    
    if (newDate && GAS_URL) {
      setLoadingSchedule(true);
      try {
        const res = await fetch(GAS_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'getDailySchedule', username: user.username, date: newDate })
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

    // Formatear fecha para enviar
    const [year, month, day] = form.dia.split('-');
    const formattedDia = new Date(year, month - 1, day).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    const solicitud = {
      promotorUsername: user.username,
      promotorName: user.name,
      dia: formattedDia,
      horarioActual: form.horarioActual,
      horarioSolicitado: form.horarioSolicitado,
      motivo: form.motivo,
      fechaCreacion: new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
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
        setForm({ dia: '', horarioActual: '', horarioSolicitado: '', motivo: '' });
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
      <div className={styles.header}>
        <div>
          <h2 style={{ color: '#1a1a1a', fontSize: '1.6rem' }}>Solicitudes de Cambio</h2>
          <p style={{ color: '#555', marginTop: '0.25rem' }}>Gestión de modificaciones de horario</p>
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
            Nueva Solicitud de Cambio
          </h3>
          <form onSubmit={handleSubmit} className={styles.form}>
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
            </div>
            <div className="input-group">
              <label className="input-label">Motivo</label>
              <textarea className={`input-field ${styles.textarea}`} placeholder="Explica el motivo del cambio..."
                value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} required />
            </div>
            <div className={styles.formActions}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Enviar Solicitud</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtros */}
      <div className={styles.filtros}>
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
        ) : lista.map(sol => (
          <div key={sol.id} className={`card ${styles.solicitudCard}`}>
            <div className={styles.solicitudHeader} onClick={() => setExpanded(expanded === sol.id ? null : sol.id)}>
              <div className={styles.solicitudMeta}>
                <span className={styles.solicitudId}>Solicitud #{sol.id}</span>
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
                    GPV: {sol.votoGPV}
                  </div>
                )}
                {sol.votoAM && !isPromotor && (
                  <div className={styles.badge} style={{ 
                    backgroundColor: sol.votoAM === 'Aprobar' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
                    color: sol.votoAM === 'Aprobar' ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${sol.votoAM === 'Aprobar' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                  }}>
                    {sol.votoAM === 'Aprobar' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                    AM: {sol.votoAM}
                  </div>
                )}
              </div>
              <div className={styles.solicitudInfo}>
                <span><User size={14} /> {sol.promotor}</span>
                <span><CalendarDays size={14} /> {sol.dia}</span>
                <span><Clock size={14} /> {sol.horarioSolicitado}</span>
              </div>
              <button className={styles.expandBtn}>
                {expanded === sol.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {expanded === sol.id && (
              <div className={styles.solicitudDetalle}>
                <div className={styles.detalleGrid}>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Horario Actual</span>
                    <span className={styles.detalleValor}>{sol.horarioActual}</span>
                  </div>
                  <div className={styles.detalleArrow}>→</div>
                  <div className={styles.detalleItem}>
                    <span className={styles.detalleLabel}>Horario Solicitado</span>
                    <span className={`${styles.detalleValor} ${styles.detalleNuevo}`}>{sol.horarioSolicitado}</span>
                  </div>
                </div>
                <div className={styles.motivoBox}>
                  <MessageSquare size={16} />
                  <p>{sol.motivo}</p>
                </div>
                <div className={styles.detalleFooter}>
                  <span>Enviada: {sol.fecha}</span>
                  {sol.aprobadaPor && (
                    <span>{sol.estado === 'aprobada' ? '✓ Aprobada' : '✗ Rechazada'} por {sol.aprobadaPor} · {sol.aprobadaEl}</span>
                  )}
                </div>

                {sol.votoGPV && !isPromotor && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--border-radius-md)', fontSize: '0.85rem' }}>
                    <strong style={{ color: sol.votoGPV === 'Aprobar' ? 'var(--success)' : 'var(--danger)' }}>
                      Voto GPV: Sugiere {sol.votoGPV}
                    </strong>
                  </div>
                )}

                {sol.votoAM && !isPromotor && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--border-radius-md)', fontSize: '0.85rem' }}>
                    <strong style={{ color: sol.votoAM === 'Aprobar' ? 'var(--success)' : 'var(--danger)' }}>
                      Voto AM: Sugiere {sol.votoAM}
                    </strong>
                  </div>
                )}

                {isManager && sol.estado === 'pendiente' && ((user.role === 'gpv' && !sol.votoGPV) || (user.role === 'am' && !sol.votoAM)) && (
                  <div className={styles.accionesCoord}>
                    <button className={`btn ${styles.btnRechazar}`} onClick={() => handleDecision(sol.id, 'voto_rechazar')}>
                      <XCircle size={16} /> Sugerir Rechazo
                    </button>
                    <button className={`btn ${styles.btnAprobar}`} onClick={() => handleDecision(sol.id, 'voto_aprobar')}>
                      <CheckCircle2 size={16} /> Sugerir Aprobación
                    </button>
                  </div>
                )}

                {isCoord && sol.estado === 'pendiente' && (
                  <div className={styles.accionesCoord}>
                    <button className={`btn ${styles.btnRechazar}`} onClick={() => handleDecision(sol.id, 'rechazada')}>
                      <XCircle size={16} /> Rechazar
                    </button>
                    <button className={`btn ${styles.btnAprobar}`} onClick={() => handleDecision(sol.id, 'aprobada')}>
                      <CheckCircle2 size={16} /> Aprobar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {!loading && !error && lista.length === 0 && (
          <div className={styles.emptyState}>
            <CalendarDays size={40} />
            <p>No hay solicitudes con este filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
