/* eslint-disable */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { CalendarDays, KeyRound, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <CalendarDays size={32} color="white" />
          </div>
          <p className={styles.brandSubtitle}>Xiaomi · Salesland</p>
          <h1>Portal Promotores</h1>
          <p>Inicia sesión en tu cuenta</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="input-group">
            <label className="input-label" htmlFor="username">Usuario</label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                id="username"
                className="input-field"
                type="text"
                placeholder="ej: juan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Contraseña</label>
            <div className={styles.inputWrapper}>
              <KeyRound size={18} className={styles.inputIcon} />
              <input
                id="password"
                className="input-field"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Acceder
          </button>
        </form>

        <div className={styles.footer}>
          <p>¿Problemas para iniciar sesión? Contacta a tu AM o Coordinadora.</p>
        </div>
      </div>
    </div>
  );
}
