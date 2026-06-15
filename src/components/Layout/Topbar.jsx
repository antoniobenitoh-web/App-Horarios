import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Layout.module.css';
import { CalendarDays, CalendarClock, Clock, Users, Bell, LogOut, UserCircle, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Notificaciones dinámicas

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const GAS_URL = import.meta.env.VITE_GAS_URL;
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      if (!GAS_URL) return;
      try {
        if (user.role === 'promotor') {
          const res = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getSchedule', username: user.username })
          });
          const data = await res.json();
          if (data.success && data.schedule && data.schedule.length > 0) {
            // Recoger las semanas únicas disponibles en el horario
            const weeks = [...new Set(data.schedule.map(w => w.semana_num))].sort((a,b)=>a-b);
            if (weeks.length > 0) {
               setNotifs([{
                 id: 1, type: 'info', 
                 text: `Se te han subido los horarios de la(s) semana(s) ${weeks.join(', ')}. Por favor compruébalos y da el ok.`,
                 time: 'Nuevo', read: false, link: '/horario'
               }]);
            }
          }
        } else {
          // Managers
          const res = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'getSolicitudes', username: user.username, role: user.role, name: user.name })
          });
          const data = await res.json();
          if (data.success) {
            const pending = data.solicitudes.filter(s => s.estado === 'pendiente').length;
            if (pending > 0) {
              setNotifs([{
                id: 1, type: 'warning',
                text: `Tienes ${pending} solicitud(es) pendiente(s) de revisión.`,
                time: 'Nuevo', read: false, link: '/solicitudes'
              }]);
            }
          }
        }
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

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <div className={styles.logo}>
          <CalendarDays size={22} color="white" />
        </div>
        <div className={styles.brandGroup}>
          <h2 className={styles.brandTitle}>Portal Promotores</h2>
          <span className={styles.brandSub}>Xiaomi · Salesland</span>
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

        {(user.role === 'gpv' || user.role === 'am' || user.role === 'coordinadora') && (
          <NavLink to="/equipo" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Users size={18} />
            <span>Mi Equipo</span>
          </NavLink>
        )}

        <NavLink to="/solicitudes" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
          <CalendarClock size={18} />
          <span>Solicitudes</span>
        </NavLink>

        <NavLink to="/horas" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
          <Clock size={18} />
          <span>Control Horas</span>
        </NavLink>

        {(user.role === 'am' || user.role === 'coordinadora') && (
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
                    onClick={() => {
                      if (n.link) {
                        navigate(n.link);
                        setNotifOpen(false);
                      }
                    }}
                    style={{ cursor: n.link ? 'pointer' : 'default' }}
                  >
                    <span className={styles.notifIcon}>
                      {n.type === 'success' && <CheckCircle size={16} color="var(--success)" />}
                      {n.type === 'info' && <Info size={16} color="var(--info)" />}
                      {n.type === 'warning' && <AlertCircle size={16} color="var(--warning)" />}
                    </span>
                    <div className={styles.notifContent}>
                      <p className={styles.notifText}>{n.text}</p>
                      <span className={styles.notifTime}>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.userInfo}>
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
    </header>
  );
}
