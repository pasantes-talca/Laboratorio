import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { ProductionProvider } from './context/ProductionContext';
import Navbar from './components/Navbar';
import ProductionModal from './components/ProductionModal';
import CalidadPage from './pages/CalidadPage';
import SalaJarabePage from './pages/SalaJarabePage';
import DashboardPage from './pages/DashboardPage';
import AguaPage from './pages/AguaPage';
import AreaSaneadoPage from './pages/AreaSaneadoPage';
import './styles/index.css';

const ROUTE_MAP = {
  '/': 'calidad',
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
  '/portal': 'dashboard',
};

const PAGE_TO_PATH = {
  calidad: '/calidad',
  jarabe: '/jarabe',
  agua: '/agua',
  saneado: '/saneado',
  dashboard: '/dashboard',
};

const PAGE_TITLES = {
  calidad: 'Control de Calidad - Laboratorio Talca',
  jarabe: 'Sala de Jarabe - Laboratorio Talca',
  agua: 'Control de Agua - Laboratorio Talca',
  saneado: 'Área de Saneado - Laboratorio Talca',
  dashboard: 'Dashboard - Laboratorio Talca',
};

function getPageFromPath() {
  if (typeof window === 'undefined') return 'calidad';
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  return ROUTE_MAP[pathname] || 'calidad';
}

function AppContent() {
  const [activePage, setActivePage] = useState(getPageFromPath);

  useEffect(() => {
    const onPopState = () => {
      setActivePage(getPageFromPath());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const targetPath = PAGE_TO_PATH[activePage];
    if (targetPath && (currentPath === '/' || !ROUTE_MAP[currentPath])) {
      window.history.replaceState(null, '', targetPath);
    }
    if (PAGE_TITLES[activePage]) {
      document.title = PAGE_TITLES[activePage];
    }
  }, [activePage]);

  const handleNavigate = (page) => {
    setActivePage(page);
    const targetPath = PAGE_TO_PATH[page] || `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  return (
    <>
      <div className="background-glow" />
      <div className="app-layout">
        <Navbar activePage={activePage} setActivePage={handleNavigate} />

        {activePage === 'calidad' && <CalidadPage />}
        {activePage === 'jarabe' && <SalaJarabePage />}
        {activePage === 'agua' && <AguaPage />}
        {activePage === 'saneado' && <AreaSaneadoPage />}
        {activePage === 'dashboard' && <DashboardPage />}

        <ProductionModal />
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
