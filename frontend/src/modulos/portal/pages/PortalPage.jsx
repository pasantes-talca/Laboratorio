import React from 'react';
import {
  Beer,
  Droplet,
  Gauge,
  Layers,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Database,
} from 'lucide-react';

export default function PortalPage({ onNavigate }) {

  const modules = [
    {
      id: 'dashboard-controles',
      page: 'dashboard',
      title: 'Dashboard de Gráficos y Procesos',
      desc: 'Gráficos de control estadístico para °Brix, TA, Gas CO2 y Torques según límites BPM.',
      icon: Gauge,
      color: 'var(--color-azul-clinico)',
      bg: 'var(--color-azul-hielo)',
    },
    {
      id: 'calidad-bebida',
      page: 'calidad',
      form: 'bebida',
      title: 'Control de Bebida Terminada',
      desc: 'Registro en tiempo real de volumen neto, °Brix, presión, temperatura y gas.',
      icon: Beer,
      color: 'var(--color-rojo)',
      bg: 'var(--color-brand-light)',
    },
    {
      id: 'calidad-jarabe',
      page: 'calidad',
      form: 'jarabe',
      title: 'Control de Jarabe',
      desc: 'Verificación de °Brix patrón, acidez titulable y asignación de tanques.',
      icon: Droplet,
      color: 'var(--color-azul-institucional)',
      bg: 'var(--color-azul-hielo)',
    },
    {
      id: 'calidad-torque',
      page: 'calidad',
      form: 'torque',
      title: 'Control de Torque',
      desc: 'Medición de apriete en cabezales con avance automático secuencial.',
      icon: Gauge,
      color: 'var(--color-alerta)',
      bg: 'var(--color-alerta-bg)',
    },
    {
      id: 'jarabe-simple',
      page: 'jarabe',
      form: 'simple',
      title: 'Preparación Jarabe Simple',
      desc: 'Pesada de bolsas de azúcar, marca, turbidez NTU y pasteurizado.',
      icon: Layers,
      color: 'var(--color-azul-marino)',
      bg: 'var(--color-azul-hielo)',
    },
    {
      id: 'jarabe-terminado',
      page: 'jarabe',
      form: 'terminado',
      title: 'Jarabe Terminado',
      desc: 'Dosificación de concentrados, tiempos de filtrado y rendimientos.',
      icon: Sparkles,
      color: 'var(--color-azul-clinico)',
      bg: 'var(--color-azul-hielo)',
    },
    {
      id: 'jarabe-saneo',
      page: 'jarabe',
      form: 'saneo',
      title: 'Saneo de Tanques (CIP)',
      desc: 'Registro higiénico con horarios de inicio/fin y agentes de limpieza.',
      icon: ShieldCheck,
      color: 'var(--color-azul-institucional)',
      bg: 'var(--color-azul-hielo)',
    },
    {
      id: 'jarabe-parte',
      page: 'jarabe',
      form: 'parte',
      title: 'Parte de Jarabe & Excel',
      desc: 'Carga automatizada de pesadas desde reportes de Sala de Jarabe.',
      icon: FileSpreadsheet,
      color: 'var(--color-exito)',
      bg: 'var(--color-exito-bg)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-azul-institucional) 100%)',
          border: '1px solid var(--color-azul-marino)',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#68D391', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Database size={16} /> PostgreSQL Online
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
            Sistema Integrado de Calidad y Procesos
          </h2>
          <p style={{ color: 'var(--color-azul-hielo)', fontSize: '0.95rem', maxWidth: '650px', marginTop: '0.4rem' }}>
            Plataforma centralizada para la auditoría, control de envasado, dosificación de jarabes y trazabilidad operativa de planta.
          </p>
        </div>

      </div>

      {/* Grid of Modules */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-azul-marino)', marginBottom: '1.25rem' }}>
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
                onClick={() => onNavigate(m.page, m.form)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--color-azul-clinico)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-glass)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
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
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gris-900)', marginBottom: '0.4rem' }}>
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
