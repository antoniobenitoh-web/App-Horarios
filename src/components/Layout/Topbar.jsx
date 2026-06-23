/* eslint-disable */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';
import { CalendarDays, CalendarClock, Clock, Users, Bell, LogOut, UserCircle, X, CheckCircle, AlertCircle, Info, Trash2, Eye, EyeOff, Save } from 'lucide-react';

// Notificaciones dinámicas

export default function Topbar() {
  const { user, logout, updateUserPassword } = useAuth();
  const navigate = useNavigate();
  const GAS_URL = import.meta.env.VITE_GAS_URL;
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  
  // Profile state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      if (!GAS_URL) return;
      try {
        let newNotifs = [];
        
        // 1. Obtener notificaciones desde la DB
        try {
          const dbRes = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getNotificaciones', username: user.username })
          });
          const dbData = await dbRes.json();
          if (dbData.success && dbData.notificaciones) {
            dbData.notificaciones.forEach(n => {
              newNotifs.push({
                id: n.id,
                type: n.tipo || 'sistema',
                text: n.mensaje,
                time: n.fecha,
                read: n.leida,
                link: n.ruta,
                isDbNotif: true
              });
            });
          }
        } catch(e) { console.error("Error fetching DB notifs", e); }

        setNotifs(newNotifs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [user, GAS_URL]);

  const unread = notifs.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllRead = () => setNotifs(n => n.map(x => ({ ...x, read: true })));

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation(); // Prevent opening the link
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'deleteNotificacion', id })
      });
      setNotifs(current => current.filter(x => x.id !== id));
    } catch(err) {}
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setProfileMsg({ type: 'error', text: 'Las nuevas contraseñas no coinciden.' });
      return;
    }
    
    setIsSaving(true);
    setProfileMsg({ type: '', text: '' });
    
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'changePassword',
          username: user.username,
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setProfileMsg({ type: 'success', text: 'Contraseña actualizada correctamente.' });
        updateUserPassword(passwords.new);
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        setProfileMsg({ type: 'error', text: data.error || 'Error al cambiar contraseña.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <div className={styles.logo} style={{ padding: '0.25rem', background: 'transparent', boxShadow: 'none' }}>
          <img src={import.meta.env.BASE_URL + "icon-192.png"} alt="Salesland Xiaomi" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
        </div>
        <div className={styles.brandGroup} style={{ marginLeft: '0.5rem' }}>
          <h2 className={styles.brandTitle} style={{ color: 'white', fontWeight: '600', letterSpacing: '1px' }}>salesland</h2>
        </div>
      </div>

      <nav className={styles.topNav}>
        <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} end>
          <CalendarDays size={18} />
          <span>Inicio</span>
        </NavLink>

        {user.role === 'promotor' && (
          <NavLink to="/horario" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <CalendarClock size={18} />
            <span>Mi Horario</span>
          </NavLink>
        )}

        {(user.role === 'gpv' || user.role === 'am' || user.role === 'coordinadora' || user.role === 'trainer' || user.role === 'administradora') && (
          <NavLink to="/equipo" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Users size={18} />
            <span>Mi Equipo</span>
          </NavLink>
        )}

        {user.role !== 'trainer' && (
          <>
            <NavLink to="/solicitudes" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
              <CalendarClock size={18} />
              <span>Solicitudes</span>
            </NavLink>

            <NavLink to="/horas" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
              <Clock size={18} />
              <span>Control Horas</span>
            </NavLink>
          </>
        )}

        {(user.role === 'am' || user.role === 'coordinadora' || user.role === 'administradora') && (
          <NavLink to="/usuarios" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <UserCircle size={18} />
            <span>Usuarios</span>
          </NavLink>
        )}
      </nav>

      <div className={styles.topbarRight}>
        <div className={styles.notifWrapper}>
          <button className={styles.iconBtn} onClick={() => setNotifOpen(o => !o)}>
            <Bell size={20} />
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>

          {notifOpen && (
            <div className={styles.notifPanel}>
              <div className={styles.notifHeader}>
                <span>Notificaciones</span>
                <button className={styles.notifMarkRead} onClick={markAllRead}>Marcar todo leído</button>
              </div>
              <div className={styles.notifList}>
                {notifs.length === 0 && <p style={{padding: '1rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem'}}>No tienes notificaciones nuevas.</p>}
                {notifs.map(n => (
                  <div 
                    key={n.id} 
                    className={`${styles.notifItem} ${n.read ? styles.notifRead : ''}`}
                    onClick={async () => {
                      if (n.isDbNotif && !n.read) {
                        try {
                          await fetch(GAS_URL, {
                            method: 'POST',
                            body: JSON.stringify({ action: 'markNotificacionLeida', id: n.id })
                          });
                          setNotifs(current => current.map(x => x.id === n.id ? { ...x, read: true } : x));
                        } catch(e) {}
                      }
                      if (n.link) {
                        navigate(n.link);
                        setNotifOpen(false);
                      }
                    }}
                    style={{ cursor: n.link ? 'pointer' : 'default' }}
                  >
                    <span className={styles.notifIcon}>
                      {n.type === 'solicitud_resuelta' && <CheckCircle size={16} color="var(--success)" />}
                      {n.type === 'solicitud_nueva' && <AlertCircle size={16} color="var(--warning)" />}
                      {n.type === 'horario_modificado' && <CalendarClock size={16} color="var(--info)" />}
                      {n.type === 'sistema' && <Info size={16} color="var(--info)" />}
                      {(!['solicitud_resuelta', 'solicitud_nueva', 'horario_modificado', 'sistema'].includes(n.type)) && <Info size={16} color="var(--text-tertiary)" />}
                    </span>
                    <div className={styles.notifContent}>
                      <p className={styles.notifText}>{n.text}</p>
                      <span className={styles.notifTime}>{n.time}</span>
                    </div>
                    <button className={styles.notifDeleteBtn} onClick={(e) => handleDeleteNotif(e, n.id)} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.userInfo} onClick={() => setIsProfileOpen(true)} style={{ cursor: 'pointer' }}>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>{user.role.toUpperCase()}</span>
          </div>
          <UserCircle size={32} style={{ color: 'var(--accent-primary)' }} />
        </div>

        <button onClick={handleLogout} className={styles.logoutBtn} title="Cerrar sesión">
          <LogOut size={20} />
        </button>
      </div>

      {isProfileOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsProfileOpen(false)}>
          <div className={styles.profileModal} onClick={e => e.stopPropagation()}>
            <div className={styles.profileHeader}>
              <h3><UserCircle size={20} /> Mi Perfil</h3>
              <button className={styles.closeBtn} onClick={() => setIsProfileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.profileBody}>
              <div className={styles.profileInfoRow}>
                <div className={styles.profileInfoLabel}>Nombre Completo</div>
                <div className={styles.profileInfoValue}>{user.name}</div>
              </div>
              <div className={styles.profileInfoRow}>
                <div className={styles.profileInfoLabel}>Usuario</div>
                <div className={styles.profileInfoValue}>@{user.username}</div>
              </div>
              <div className={styles.profileInfoRow}>
                <div className={styles.profileInfoLabel}>Centro / Proyecto</div>
                <div className={styles.profileInfoValue}>{user.centro || 'Sin asignar'}</div>
              </div>
              <div className={styles.profileInfoRow}>
                <div className={styles.profileInfoLabel}>Contraseña Actual Registrada</div>
                <div className={styles.profileInfoValue} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{showPassword ? (user.password || '(Inicia sesión de nuevo para verla)') : '••••••••'}</span>
                  <button onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '0 0.2rem' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <form className={styles.passwordChangeSection} onSubmit={handlePasswordChange}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Cambiar Contraseña</h4>
                
                {profileMsg.text && (
                  <div className={profileMsg.type === 'error' ? styles.errorMsg : styles.successMsg}>
                    {profileMsg.text}
                  </div>
                )}
                
                <div className={styles.passwordInputWrapper}>
                  <input 
                    type="password" 
                    placeholder="Contraseña Actual" 
                    value={passwords.current}
                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.passwordInputWrapper}>
                  <input 
                    type="password" 
                    placeholder="Nueva Contraseña" 
                    value={passwords.new}
                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.passwordInputWrapper}>
                  <input 
                    type="password" 
                    placeholder="Repite la Nueva Contraseña" 
                    value={passwords.confirm}
                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    required
                  />
                </div>
                
                <button type="submit" className={styles.saveBtn} disabled={isSaving || !passwords.current || !passwords.new || !passwords.confirm}>
                  <Save size={18} />
                  {isSaving ? 'Guardando...' : 'Guardar Nueva Contraseña'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
