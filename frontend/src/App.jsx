import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { ProductionProvider } from './context/ProductionContext';
import Navbar from './components/Navbar';
import ProductionModal from './components/ProductionModal';
import CalidadPage from './pages/CalidadPage';
import SalaJarabePage from './pages/SalaJarabePage';
import DashboardPage from './pages/DashboardPage';
import AguaPage from './pages/AguaPage';
import './styles/index.css';

function AppContent() {
  const [activePage, setActivePage] = useState('calidad');

  return (
    <>
      <div className="background-glow" />
      <div className="app-layout">
        <Navbar activePage={activePage} setActivePage={setActivePage} />

        {activePage === 'calidad' && <CalidadPage />}
        {activePage === 'jarabe' && <SalaJarabePage />}
        {activePage === 'agua' && <AguaPage />}
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
