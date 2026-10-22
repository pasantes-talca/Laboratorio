import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { ToastProvider } from './context/ToastContext';
import { ProductionProvider, useProduction } from './context/ProductionContext';
import SidebarNav from './componentes/SidebarNav';
import ProductionModal from './componentes/ProductionModal';
import { AdminAccess } from './componentes/AuthGate';
import { FORM_NAV, defaultFormFor } from './navigation';
import './styles/index.css';

const CalidadPage = lazy(() => import('./modulos/calidad/pages/CalidadPage'));
const SalaJarabePage = lazy(() => import('./modulos/jarabe/pages/SalaJarabePage'));
const AguaDashboardPage = lazy(() => import('./modulos/agua/pages/AguaDashboardPage'));
const DashboardPage = lazy(() => import('./modulos/dashboard/pages/DashboardPage'));
const AguaPage = lazy(() => import('./modulos/agua/pages/AguaPage'));
const AreaSaneadoPage = lazy(() => import('./modulos/saneado/pages/AreaSaneadoPage'));
const PortalPage = lazy(() => import('./modulos/portal/pages/PortalPage'));
const AdminPage = lazy(() => import('./modulos/administracion/AdminPage'));

const ROUTE_MAP = {
  '/administracion': 'administracion',
  '/': 'portal',
  '/calidad': 'calidad',
  '/jarabe': 'jarabe',
  '/sala-jarabe': 'jarabe',
  '/preparacion-jarabe': 'jarabe',
  '/produccion-jarabe': 'jarabe',
  '/agua': 'agua',
  '/saneado': 'saneado',
  '/area-saneado': 'saneado',
  '/sala-saneado': 'saneado',
  '/dashboard': 'dashboard',
  '/portal': 'portal',
};

const PAGE_TO_PATH = {
  administracion: '/administracion',
  portal: '/portal',
  calidad: '/calidad',
  jarabe: '/jarabe',
  agua: '/agua',
  saneado: '/saneado',
  dashboard: '/dashboard',
};

const PAGE_TITLES = {
  administracion: 'Administración - Laboratorio Talca',
  portal: 'Inicio - Laboratorio Talca',
  calidad: 'Control de Calidad - Laboratorio Talca',
  jarabe: 'Sala de Jarabe - Laboratorio Talca',
  agua: 'Control de Agua - Laboratorio Talca',
  saneado: 'Área de Saneado - Laboratorio Talca',
  dashboard: 'Dashboard - Laboratorio Talca',
};

function getRouteFromPath() {
  if (typeof window === 'undefined') return { page: 'calidad', form: 'bebida' };
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const parts = pathname.split('/').filter(Boolean);
  const page = ROUTE_MAP[parts.length ? `/${parts[0]}` : '/'] || 'calidad';
  const form = FORM_NAV[page]?.find((item) => item.slug === parts[1])?.id || defaultFormFor(page);
  return { page, form };
}

function AppContent() {
  const { selectedLine, production } = useProduction();
  const [route, setRoute] = useState(getRouteFromPath);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { page: activePage, form: activeForm } = route;

  useEffect(() => {
    const onPopState = () => {
      setRoute(getRouteFromPath());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const targetPath = PAGE_TO_PATH[activePage];
    const [base, slug] = currentPath.split('/').filter(Boolean);
    const knownPage = ROUTE_MAP[base ? `/${base}` : '/'];
    const isKnownPath = !slug ? Boolean(knownPage) : Boolean(FORM_NAV[knownPage]?.some((item) => item.slug === slug));
    if (targetPath && (currentPath === '/' || !isKnownPath)) {
      window.history.replaceState(null, '', targetPath);
    }
    if (PAGE_TITLES[activePage]) {
      document.title = activePage === 'agua' && activeForm === 'dashboard' ? 'Dashboard de Agua - Laboratorio Talca' : PAGE_TITLES[activePage];
    }
  }, [activePage, activeForm]);

  const handleNavigate = (page, form) => {
    const selectedForm = FORM_NAV[page]?.find((item) => item.id === form);
    setRoute({ page, form: selectedForm?.id || defaultFormFor(page) });
    const basePath = PAGE_TO_PATH[page] || `/${page}`;
    const targetPath = selectedForm ? `${basePath}/${selectedForm.slug}` : basePath;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <>
      <div className="background-glow" />
      <div className="app-layout">
        <SidebarNav activePage={activePage} activeForm={activeForm} onNavigate={handleNavigate} isOpen={sidebarOpen} onClose={closeSidebar} />

        <div className="app-main">
          <header className="app-topbar">
            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Abrir menú"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
            <div>
              <span className="app-topbar-eyebrow">LABORATORIO TALCA</span>
              <h1>{PAGE_TITLES[activePage]?.split(' - ')[0] || 'Laboratorio de Calidad'}</h1>
            </div>
            <span className="app-topbar-line">{activePage === 'calidad' ? 'Control de procesos' : 'Sistema de calidad'}</span>
          </header>

          <Suspense fallback={<main className="card" role="status">Cargando módulo…</main>}>
            {activePage === 'portal' && <PortalPage onNavigate={handleNavigate} />}
            {activePage === 'calidad' && <CalidadPage key={`${selectedLine}-${production.version}`} initialTab={activeForm} onTabChange={(form) => handleNavigate('calidad', form)} />}
            {activePage === 'jarabe' && <SalaJarabePage initialTab={activeForm} onTabChange={(form) => handleNavigate('jarabe', form)} />}
            {activePage === 'agua' && (activeForm === 'dashboard' ? <AguaDashboardPage onNavigate={handleNavigate} /> : <AguaPage initialTab={activeForm} onTabChange={(form) => handleNavigate('agua', form)} />)}
            {activePage === 'saneado' && <AreaSaneadoPage />}
            {activePage === 'dashboard' && <DashboardPage />}
            {activePage === 'administracion' && <AdminAccess><AdminPage /></AdminAccess>}
          </Suspense>

          <ProductionModal />
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ProductionProvider>
        <AppContent />
      </ProductionProvider>
    </ToastProvider>
  );
}
