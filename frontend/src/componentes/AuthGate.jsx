import React, { useCallback, useEffect, useState } from 'react';
import { fetchJson } from '../services/httpClient';

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setError('');
    try {
      setSession(await fetchJson('/auth/session'));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const expired = () => {
      setSession({ required: true, user: null });
      setError('La sesión venció. Ingrese nuevamente para continuar.');
    };
    window.addEventListener('laboratorio:session-expired', expired);
    return () => window.removeEventListener('laboratorio:session-expired', expired);
  }, [refresh]);

  const login = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await fetchJson('/auth/login', {
        method: 'POST', body: JSON.stringify({ username, password }),
      });
      setPassword('');
      setSession({ required: true, user });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    setError('');
    try {
      await fetchJson('/auth/logout', { method: 'POST' });
      setSession({ required: true, user: null });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!session) {
    return <main className="auth-shell"><section className="card auth-card">
      <h1>Laboratorio Talca</h1>
      {error ? <><p role="alert">{error}</p><button type="button" className="btn btn-primary" onClick={refresh}>Reintentar conexión</button></> : <p role="status">Verificando acceso…</p>}
    </section></main>;
  }

  if (session.required && !session.user) {
    return <main className="auth-shell"><form className="card auth-card" onSubmit={login}>
      <h1>Ingresar al laboratorio</h1>
      <label htmlFor="auth-user">Usuario</label>
      <input id="auth-user" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required maxLength={100} />
      <label htmlFor="auth-password">Contraseña</label>
      <input id="auth-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={1024} />
      {error && <p role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
    </form></main>;
  }

  return <>
    {session.user && <div className="session-bar">
      <span>{session.user.username} · {session.user.role}</span>
      <button type="button" className="btn" disabled={busy} onClick={logout}>Cerrar sesión</button>
      {error && <span role="alert">{error}</span>}
    </div>}
    {children}
  </>;
}
