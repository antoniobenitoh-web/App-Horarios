import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './UserManagement.module.css';
import { Users, Edit2, Key, Plus, RefreshCw, AlertCircle } from 'lucide-react';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Estado del formulario
  const [form, setForm] = useState({
    name: '',
    username: '',
    password: '',
    role: 'promotor',
    gpv: '',
    am: '',
    coordinadora: ''
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
        name: u.name,
        username: u.username,
        password: u.password,
        role: u.role,
        gpv: u.manager?.gpv || '',
        am: u.manager?.am || '',
        coordinadora: u.manager?.coordinadora || ''
      });
    } else {
      setEditingUser(null);
      setForm({ name: '', username: '', password: '', role: 'promotor', gpv: '', am: '', coordinadora: '' });
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
            coordinadora: form.coordinadora
          }
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

  if (user.role !== 'coordinadora' && user.role !== 'am') {
    return <div className="card">No tienes permiso para ver esta página.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.4rem', marginBottom: '0.2rem' }}>Gestión de Usuarios</h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>Administra el equipo y las credenciales de acceso</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={16} className={loading ? styles.spin : ''} />
            Actualizar
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()} disabled={loading || !GAS_URL}>
            <Plus size={16} />
            Nuevo Usuario
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
              {users.map(u => (
                <tr key={u.id}>
                  <td data-label="Nombre"><strong>{u.name}</strong></td>
                  <td data-label="Usuario"><span className={styles.userBadge}>{u.username}</span></td>
                  <td data-label="Rol"><span className={`${styles.roleBadge} ${styles['role_' + u.role]}`}>{u.role.toUpperCase()}</span></td>
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
              {users.length === 0 && !loading && GAS_URL && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>No hay usuarios en la base de datos.</td>
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
                  <option value="am">Area Manager</option>
                  <option value="coordinadora">Coordinadora</option>
                </select>
              </div>

              {form.role === 'promotor' && (
                <>
                  <div className={styles.formRow}>
                    <div className="input-group">
                      <label className="input-label">Asignar GPV (Nombre)</label>
                      <input className="input-field" value={form.gpv} onChange={e => setForm({...form, gpv: e.target.value})} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Asignar AM</label>
                      <input className="input-field" value={form.am} onChange={e => setForm({...form, am: e.target.value})} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Asignar Coordinadora</label>
                    <input className="input-field" value={form.coordinadora} onChange={e => setForm({...form, coordinadora: e.target.value})} />
                  </div>
                </>
              )}

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
