import React, { useState, useEffect } from "react";
import { Users, Filter, CalendarDays, Sun, Clock, MapPin, Store, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ControlEquipo.module.css";

const API_URL = import.meta.env.VITE_GAS_URL;

export default function ControlEquipo() {
  const { user } = useAuth();
  const [promotoresData, setPromotoresData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filtros, setFiltros] = useState({
    region: "",
    tienda: "",
    promotor: ""
  });

  // Allowed filters based on role
  const isSuperAdmin = user?.role === "administradora";
  const isCoord = user?.role === "coordinadora";
  const isAM = user?.role === "am" || user?.role === "gpv";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "getAllPromotorStats" })
      });
      const data = await res.json();
      if (data.success) {
        setPromotoresData(data.promotores || []);
      } else {
        setError(data.message || "Error al cargar datos del equipo.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Extract unique regions, tiendas, promotores for filters
  const visiblePromotores = promotoresData.filter(p => {
    if (isSuperAdmin) return true;
    if (isCoord) return p.region?.toLowerCase() === user.region?.toLowerCase() || p.manager?.coordinadora?.toLowerCase() === user.name?.toLowerCase();
    if (isAM) return p.manager?.am?.toLowerCase() === user.name?.toLowerCase() || p.manager?.gpv?.toLowerCase() === user.name?.toLowerCase();
    return false;
  });

  // Apply filters
  const filteredPromotores = visiblePromotores.filter(p => {
    if (filtros.region && p.region !== filtros.region) return false;
    if (filtros.tienda && p.centro !== filtros.tienda) return false;
    if (filtros.promotor && p.name !== filtros.promotor) return false;
    return true;
  });

  // Extract options for dropdowns based on VISIBLE promoters (not filtered)
  const regions = [...new Set(visiblePromotores.map(p => p.region).filter(Boolean))].sort();
  const tiendas = [...new Set(visiblePromotores.filter(p => !filtros.region || p.region === filtros.region).map(p => p.centro).filter(Boolean))].sort();
  const promotorNames = [...new Set(visiblePromotores.filter(p => (!filtros.region || p.region === filtros.region) && (!filtros.tienda || p.centro === filtros.tienda)).map(p => p.name).filter(Boolean))].sort();

  const handleFilterChange = (field, value) => {
    setFiltros(prev => {
      const newFiltros = { ...prev, [field]: value };
      if (field === "region") { newFiltros.tienda = ""; newFiltros.promotor = ""; }
      if (field === "tienda") { newFiltros.promotor = ""; }
      return newFiltros;
    });
  };

  // Global Aggregation
  const totalVacPendientes = filteredPromotores.reduce((acc, p) => acc + (p.stats?.vacaciones?.pendientesFinDeAno || 0), 0);
  const totalSabPendientes = filteredPromotores.reduce((acc, p) => acc + (p.stats?.sabados?.pendientesFinDeAno || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Users size={32} color="var(--salesland-primary)" />
          <div>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Control Equipo</h2>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Visión global del estado de promotores</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginRight: "0.5rem", color: "var(--text-tertiary)" }}>
          <Filter size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtros:</span>
        </div>

        {(isSuperAdmin || isCoord) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--glass-border)' }}>
            <MapPin size={14} color="var(--accent-primary)" />
            <select 
              value={filtros.region} 
              onChange={e => handleFilterChange("region", e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#ffffff', color: '#1e293b' }}>Todas las regiones</option>
              {regions.map(r => <option key={r} value={r} style={{ background: '#ffffff', color: '#1e293b' }}>{r}</option>)}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--glass-border)' }}>
          <Store size={14} color="var(--accent-primary)" />
          <select 
            value={filtros.tienda} 
            onChange={e => handleFilterChange("tienda", e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}
          >
            <option value="" style={{ background: '#ffffff', color: '#1e293b' }}>Todas las tiendas</option>
            {tiendas.map(t => <option key={t} value={t} style={{ background: '#ffffff', color: '#1e293b' }}>{t}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.6rem', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--glass-border)' }}>
          <User size={14} color="var(--accent-primary)" />
          <select 
            value={filtros.promotor} 
            onChange={e => handleFilterChange("promotor", e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer' }}
          >
            <option value="" style={{ background: '#ffffff', color: '#1e293b' }}>Todos los promotores</option>
            {promotorNames.map(p => <option key={p} value={p} style={{ background: '#ffffff', color: '#1e293b' }}>{p}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>Cargando datos del equipo...</div>
      ) : error ? (
        <div className="card" style={{ color: "var(--danger)", textAlign: "center", padding: "2rem" }}>{error}</div>
      ) : (
        <>
          {/* Summary */}
          <div className={styles.summaryGlobal}>
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ padding: "1rem", background: "rgba(34, 197, 94, 0.1)", color: "#15803d", borderRadius: "12px" }}>
                  <Users size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Promotores Filtrados</p>
                  <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{filteredPromotores.length}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ padding: "1rem", background: "rgba(245, 158, 11, 0.1)", color: "#b45309", borderRadius: "12px" }}>
                  <Sun size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Vacaciones Pendientes (Equipo)</p>
                  <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, color: totalVacPendientes > 30 ? "var(--warning)" : "var(--text-primary)", lineHeight: 1 }}>{totalVacPendientes.toFixed(1)} <span style={{fontSize: "0.9rem", color:"var(--text-secondary)", fontWeight: 500}}>días 2026</span></p>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ padding: "1rem", background: "rgba(59, 130, 246, 0.1)", color: "#1d4ed8", borderRadius: "12px" }}>
                  <CalendarDays size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Sábados Pendientes (Equipo)</p>
                  <p style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{totalSabPendientes.toFixed(1)} <span style={{fontSize: "0.9rem", color:"var(--text-secondary)", fontWeight: 500}}>días 2026</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Promotores */}
          <div className={styles.promotorGrid}>
            {filteredPromotores.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "var(--text-tertiary)" }}>
                No hay promotores que coincidan con los filtros.
              </div>
            ) : (
              filteredPromotores.map(p => {
                const s = p.stats || {};
                const vac = s.vacaciones || {};
                const sab = s.sabados || {};
                
                // Progress calculations (max 100%)
                const vacProg = vac.generadasFinDeAno > 0 ? (vac.aprobadas / vac.generadasFinDeAno) * 100 : 0;
                
                return (
                  <div key={p.id} className={`card ${styles.promotorCard}`}>
                    <div className={styles.promotorHeader}>
                      <div>
                        <div className={styles.promotorName}>{p.name}</div>
                        <div className={styles.promotorLocation}>
                          <span><MapPin size={12} style={{marginRight: "4px"}} />{p.centro || "Sin asignar"}</span>
                          <span>{p.region && `Región: ${p.region}`}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}><Clock size={14} style={{marginRight: "4px", verticalAlign: "middle"}}/> Días Trabajados (Hoy):</span>
                        <span className={styles.statValue}>{s.diasTrabajados?.hoy || 0}</span>
                      </div>
                    </div>
                    
                    <div style={{ background: "var(--bg-primary)", padding: "0.75rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div className={styles.statRow} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "0.25rem" }}>
                        <strong style={{fontSize: "0.85rem"}}>VACACIONES 2026</strong>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Generadas (Total Año):</span>
                        <span className={styles.statValue}>{vac.generadasFinDeAno}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Aprobadas:</span>
                        <span className={styles.statValue}>{vac.aprobadas}</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div className={`${styles.progressFill} ${vacProg < 30 ? styles.progressFillDanger : vacProg < 70 ? styles.progressFillWarning : ""}`} style={{ width: `${Math.min(vacProg, 100)}%` }}></div>
                      </div>
                      <div className={styles.statRow} style={{ marginTop: "0.25rem" }}>
                        <span className={styles.statLabel} style={{fontWeight: 600}}>Pendientes (Fin de año):</span>
                        <span className={`${styles.statValue} ${vac.pendientesFinDeAno < 0 ? styles.statDanger : styles.statHighlight}`}>{vac.pendientesFinDeAno}</span>
                      </div>
                    </div>

                    <div style={{ background: "var(--bg-primary)", padding: "0.75rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <div className={styles.statRow} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)", paddingBottom: "0.25rem" }}>
                        <strong style={{fontSize: "0.85rem"}}>SÁBADOS CALIDAD 2026</strong>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Generados (Total Año):</span>
                        <span className={styles.statValue}>{sab.generadasFinDeAno}</span>
                      </div>
                      <div className={styles.statRow}>
                        <span className={styles.statLabel}>Aprobados:</span>
                        <span className={styles.statValue}>{sab.aprobadas}</span>
                      </div>
                      <div className={styles.statRow} style={{ marginTop: "0.25rem" }}>
                        <span className={styles.statLabel} style={{fontWeight: 600}}>Pendientes:</span>
                        <span className={`${styles.statValue} ${sab.pendientesFinDeAno < 0 ? styles.statDanger : styles.statHighlight}`}>{sab.pendientesFinDeAno}</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
