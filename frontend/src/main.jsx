import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import AuthGate from './componentes/AuthGate.jsx'
const AdminPage = lazy(() => import('./modulos/administracion/AdminPage.jsx'));

const example = window.location.pathname.replace(/\/$/, '') === '/administracion' && new URLSearchParams(window.location.search).get('demo') === '1';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {example ? <Suspense fallback={<p>Cargando ejemplo…</p>}><div className="admin-preview-shell"><AdminPage preview /></div></Suspense> : <AuthGate><App /></AuthGate>}
  </StrictMode>,
)
