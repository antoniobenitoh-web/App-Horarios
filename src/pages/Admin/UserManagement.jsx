/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './UserManagement.module.css';
import { Users, Edit2, Key, Plus, RefreshCw, AlertCircle, MapPin, Search } from 'lucide-react';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Filtros
  const [filtroRegion, setFiltroRegion] = useState('todas');
  const [filtroCentro, setFiltroCentro] = useState('todos');
  const [busquedaNombre, setBusquedaNombre] = useState('');
  
  // Estado del formulario
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'promotor',
    gpv: '',
    am: '',
    coordinadora: '',
    trainer: '',
    administradora: '',
    centro: '',
    fechaIncorporacion: '',
    email: '',
    region: ''
  });

  const GAS_URL = import.meta.env.VITE_GAS_URL;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!GAS_URL) {
        throw new Error("No hay URL de Google Apps Script configurada en .env.local");
      }
      
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getUsers' }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (u = null) => {
    if (u) {
      setEditingUser(u);
      setForm({
        name: u.name || '',
        username: u.username || '',
        password: u.password || '',
        role: u.role || 'promotor',
        gpv: u.manager?.gpv || '',
        am: u.manager?.am || '',
        coordinadora: u.manager?.coordinadora || '',
        trainer: u.manager?.trainer || '',
        administradora: u.manager?.administradora || '',
        centro: u.centro || '',
        fechaIncorporacion: u.fechaIncorporacion || '',
        email: u.email || '',
        region: u.region || ''
      });
    } else {
      setEditingUser(null);
      setForm({ 
        name: '', username: '', password: '', role: 'promotor', 
        gpv: '', 
        am: user.role === 'am' ? user.name : '', 
        coordinadora: user.role === 'coordinadora' ? user.name : '', 
        trainer: '', 
        administradora: '', 
        centro: '', fechaIncorporacion: '', email: '', region: '' 
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        action: editingUser ? 'updateUser' : 'createUser',
        user: {
          id: editingUser ? editingUser.id : null,
          ...form,
          manager: {
            gpv: form.gpv,
            am: form.am,
            coordinadora: form.coordinadora,
            trainer: form.trainer,
            administradora: form.administradora
          },
          centro: form.centro,
          fechaIncorporacion: form.fechaIncorporacion,
          email: form.email
        }
      };

      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        fetchUsers(); // Recargar lista
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (user.role !== 'coordinadora' && user.role !== 'am' && user.role !== 'administradora') {
    return <div className="card">No tienes permiso para ver esta página.</div>;
  }

  // 1. Filtrar por permisos de rol
  const visibleUsers = users.filter(u => {
    if (user.role === 'administradora') return true;
    
    const userNameLower = String(user.name || "").trim().toLowerCase();
    const isPromotorOrGPV = u.role === 'promotor' || u.role === 'gpv';
    
    if (user.role === 'am' && isPromotorOrGPV) {
      return String(u.manager?.am || "").trim().toLowerCase() === userNameLower;
    }
    
    if (user.role === 'coordinadora' && u.role === 'promotor') {
      return String(u.manager?.coordinadora || "").trim().toLowerCase() === userNameLower;
    }
    
    return false;
  });

  // 2. Extraer listas para los desplegables de filtros
  const regionesDisponibles = Array.from(new Set(visibleUsers.map(u => u.region).filter(r => r && r.trim() !== ''))).sort();
  const centrosDisponibles = Array.from(new Set(visibleUsers.map(u => u.centro).filter(c => c && c.trim() !== 'Sin asignar'))).sort();

  // 3. Aplicar filtros de la UI y ordenar por rol
  const finalUsers = visibleUsers.filter(u => {
    const matchesRegion = filtroRegion === 'todas' || u.region === filtroRegion;
    const matchesCentro = filtroCentro === 'todos' || u.centro === filtroCentro;
    const matchesBusqueda = busquedaNombre === '' || 
      (u.name && String(u.name).toLowerCase().includes(String(busquedaNombre).toLowerCase())) || 
      (u.username && String(u.username).toLowerCase().includes(String(busquedaNombre).toLowerCase()));
      
    return matchesRegion && matchesCentro && matchesBusqueda;
  }).sort((a, b) => {
    const roleOrder = {
      'administradora': 1,
      'am': 2,
      'coordinadora': 3,
      'gpv': 4,
      'promotor': 5
    };
    const orderA = roleOrder[String(a.role).toLowerCase()] || 99;
    const orderB = roleOrder[String(b.role).toLowerCase()] || 99;
    return orderA - orderB;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Gestión de Usuarios</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Administra el equipo y las credenciales de acceso</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={loading || !GAS_URL}>
            <Plus size={16} />
            Nuevo Usuario
          </button>
          <button className="btn btn-outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={16} className={loading ? styles.spin : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {!GAS_URL && (
        <div className={styles.warningBox}>
          <AlertCircle size={24} className="text-warning" />
          <div>
            <strong>Falta configurar la Base de Datos</strong>
            <p>Necesitas añadir `VITE_GAS_URL=tu_url_aqui` en el archivo `.env.local` para conectar con Google Sheets.</p>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {(user.role === 'administradora' || user.role === 'coordinadora') && (
            <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.5rem 0.8rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
              <MapPin size={16} color="var(--accent-primary)" />
              <select 
                value={filtroRegion} 
                onChange={e => { setFiltroRegion(e.target.value); setFiltroCentro('todos'); }}
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
              onChange={e => setFiltroCentro(e.target.value)}
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
              placeholder="Buscar por nombre o usuario..."
              value={busquedaNombre}
              onChange={e => setBusquedaNombre(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Contraseña</th>
                <th>Responsables</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {finalUsers.map(u => (
                <tr key={u.id}>
                  <td data-label="Nombre"><strong>{u.name}</strong></td>
                  <td data-label="Usuario"><span className={styles.userBadge}>{u.username}</span></td>
                  <td data-label="Rol"><span className={`${styles.roleBadge} ${styles['role_' + u.role]}`}>{String(u.role || '').toUpperCase()}</span></td>
                  <td data-label="Contraseña"><span className={styles.pwdCensored}>••••••</span> <span className={styles.pwdReal}>{u.password}</span></td>
                  <td data-label="Responsables" className={styles.managersCell}>
                    {u.manager?.gpv && <div>GPV: {u.manager.gpv}</div>}
                    {u.manager?.am && <div>AM: {u.manager.am}</div>}
                  </td>
                  <td data-label="Acciones">
                    <button className={styles.actionBtn} onClick={() => handleOpenModal(u)} title="Editar usuario">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {finalUsers.length === 0 && !loading && GAS_URL && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No se encontraron usuarios con estos filtros.</td>
                </tr>
              )}

              {loading && GAS_URL && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>Cargando usuarios desde Google Sheets...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <form onSubmit={handleSave} className={styles.form}>
              <div className="input-group">
                <label className="input-label">Nombre Completo</label>
                <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              
              <div className={styles.formRow}>
                <div className="input-group">
                  <label className="input-label">Usuario (Login)</label>
                  <input className="input-field" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label className="input-label">Contraseña</label>
                  <input className="input-field" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Rol del sistema</label>
                <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="promotor">Promotor</option>
                  <option value="gpv">GPV</option>
                  {user.role !== 'am' && <option value="am">Area Manager</option>}
                  {user.role === 'administradora' && <option value="coordinadora">Coordinadora</option>}
                  {user.role === 'administradora' && <option value="trainer">Trainer</option>}
                  {user.role === 'administradora' && <option value="administradora">Administradora</option>}
                </select>
              </div>


                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">Asignar GPV (Nombre)</label>
                      <select className="input-field" value={form.gpv} onChange={e => setForm({...form, gpv: e.target.value})}>
                        <option value="">-- Ninguno --</option>
                        {users.filter(u => u.role === 'gpv').map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Asignar AM</label>
                      <select className="input-field" value={form.am} onChange={e => setForm({...form, am: e.target.value})}>
                        <option value="">-- Ninguno --</option>
                        {users.filter(u => u.role === 'am').map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">Asignar Coordinadora</label>
                      <select className="input-field" value={form.coordinadora} onChange={e => setForm({...form, coordinadora: e.target.value})}>
                        <option value="">-- Ninguno --</option>
                        {users.filter(u => u.role === 'coordinadora').map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Asignar Trainer</label>
                      <select className="input-field" value={form.trainer} onChange={e => setForm({...form, trainer: e.target.value})}>
                        <option value="">-- Ninguno --</option>
                        {users.filter(u => u.role === 'trainer').map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">Asignar Administradora</label>
                      <select className="input-field" value={form.administradora} onChange={e => setForm({...form, administradora: e.target.value})}>
                        <option value="">-- Ninguno --</option>
                        {users.filter(u => u.role === 'administradora').map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Centro Base</label>
                      <input className="input-field" value={form.centro} onChange={e => setForm({...form, centro: e.target.value})} placeholder="Ej: Carrefour Diagonal" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">Fecha de Incorporación</label>
                      <input type="date" className="input-field" value={form.fechaIncorporacion} onChange={e => setForm({...form, fechaIncorporacion: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Email de Trabajo</label>
                      <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ejemplo@empresa.com" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">Región</label>
                      <input className="input-field" value={form.region} onChange={e => setForm({...form, region: e.target.value})} placeholder="Ej: Cataluña, Madrid..." />
                    </div>
                  </div>


              <div className={styles.modalActions}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} disabled={loading}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
