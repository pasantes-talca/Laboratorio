import React from 'react';
import {
  Beer,
  Droplet,
  Gauge,
  Layers,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle,
  ArrowRight,
  Database,
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';

export default function PortalPage({ onNavigate }) {
  const { production } = useProduction();

  const modules = [
    {
      id: 'dashboard-controles',
      page: 'dashboard',
      title: 'Dashboard de Gráficos y Procesos',
      desc: 'Gráficos de control estadístico para °Brix, TA, Gas CO2 y Torques según límites BPM.',
      icon: Gauge,
      color: '#00f2fe',
      bg: 'rgba(0, 242, 254, 0.1)',
    },
    {
      id: 'calidad-bebida',
      page: 'calidad',
      title: 'Control de Bebida Terminada',
      desc: 'Registro en tiempo real de volumen neto, °Brix, presión, temperatura y gas.',
      icon: Beer,
      color: '#818cf8',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      id: 'calidad-jarabe',
      page: 'calidad',
      title: 'Control de Jarabe',
      desc: 'Verificación de °Brix patrón, acidez titulable y asignación de tanques.',
      icon: Droplet,
      color: '#34d399',
      bg: 'rgba(52, 211, 153, 0.1)',
    },
    {
      id: 'calidad-torque',
      page: 'calidad',
      title: 'Control de Torque',
      desc: 'Medición de apriete en cabezales con avance automático secuencial.',
      icon: Gauge,
      color: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.1)',
    },
    {
      id: 'jarabe-simple',
      page: 'jarabe',
      title: 'Preparación Jarabe Simple',
      desc: 'Pesada de bolsas de azúcar, marca, turbidez NTU y pasteurizado.',
      icon: Layers,
      color: '#f472b6',
      bg: 'rgba(244, 114, 182, 0.1)',
    },
    {
      id: 'jarabe-terminado',
      page: 'jarabe',
      title: 'Jarabe Terminado',
      desc: 'Dosificación de concentrados, tiempos de filtrado y rendimientos.',
      icon: Sparkles,
      color: '#38bdf8',
      bg: 'rgba(56, 189, 248, 0.1)',
    },
    {
      id: 'jarabe-saneo',
      page: 'jarabe',
      title: 'Saneo de Tanques (CIP)',
      desc: 'Registro higiénico con horarios de inicio/fin y agentes de limpieza.',
      icon: ShieldCheck,
      color: '#a78bfa',
      bg: 'rgba(167, 139, 250, 0.1)',
    },
    {
      id: 'jarabe-parte',
      page: 'jarabe',
      title: 'Parte de Jarabe & Excel',
      desc: 'Carga automatizada de pesadas desde reportes de Sala de Jarabe.',
      icon: FileSpreadsheet,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(0, 242, 254, 0.08))',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Database size={16} /> PostgreSQL Online
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
            Sistema Integrado de Calidad y Procesos
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', marginTop: '0.4rem' }}>
            Plataforma centralizada para la auditoría, control de envasado, dosificación de jarabes y trazabilidad operativa de planta.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Línea en operación:</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            {production.linea === 'linea2' ? 'Línea 2 (14 cabezales)' : 'Línea 1 (12 cabezales)'}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#00f2fe' }}>
            Turno {production.turno} {production.sabor ? `· ${production.sabor}` : ''}
          </span>
        </div>
      </div>

      {/* Grid of Modules */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>
          Módulos del Sistema
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                }}
                onClick={() => onNavigate(m.page)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-glass)';
                }}
              >
                <div>
                  <div
                    style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      borderRadius: 'var(--radius-lg)',
                      background: m.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      color: m.color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
                    {m.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {m.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: m.color, fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>Abrir módulo</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
