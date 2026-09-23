from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Time
from backend.app.models.base import Base

class ControlFisicoQuimico(Base):
    __tablename__ = "control_fisico_quimico_agua"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    
    tipo_agua = Column(String(50), nullable=False) # Agua de Pozo, Agua Permeada, Agua Tratada
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    
    k = Column(Float, nullable=False)
    dureza = Column(Float, nullable=False)
    cloruros = Column(Float, nullable=False)
    sulfatos = Column(Float, nullable=False)
    alcalinidad = Column(Float, nullable=False)
    cloro_libre = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)
    responsable = Column(String(100), nullable=False)


class SalaSaneado(Base):
    __tablename__ = "sala_saneado"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    
    linea = Column(String(20), nullable=False)
    post_mantenimiento = Column(Boolean, nullable=False)
    tipo_limpieza = Column(String(20), nullable=False) # COP or CIP
    responsable = Column(String(100), nullable=False)
    
    # COP fields
    cop_quimico = Column(String(100), nullable=True)
    cop_hora_inicio = Column(Time, nullable=True)
    cop_hora_fin = Column(Time, nullable=True)
    
    # CIP fields (Sanitizante)
    cip_sanitizante_temp = Column(Float, nullable=True)
    cip_sanitizante_inicio = Column(Time, nullable=True)
    cip_sanitizante_fin = Column(Time, nullable=True)
    
    # CIP fields (Desinfectante)
    cip_desinfectante_temp = Column(Float, nullable=True)
    cip_desinfectante_inicio = Column(Time, nullable=True)
    cip_desinfectante_fin = Column(Time, nullable=True)
    
    # CIP fields (Enjuague Sanitizante)
    cip_enjuague_sanitizante_inicio = Column(Time, nullable=True)
    cip_enjuague_sanitizante_fin = Column(Time, nullable=True)
    
    # CIP fields (Enjuague Desinfectante)
    cip_enjuague_desinfectante_inicio = Column(Time, nullable=True)
    cip_enjuague_desinfectante_fin = Column(Time, nullable=True)


class AnalisisCloro(Base):
    __tablename__ = "analisis_cloro_agua"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    hora = Column(Time, nullable=True)
    tanque_agua_osmosis = Column(Float, nullable=False)
    filtro_carbon_a = Column(String(20), nullable=False)
    filtro_carbon_b = Column(String(20), nullable=False)
    filtro_carbon_c = Column(String(20), nullable=False)
    contralavado_tanque_a = Column(Time, nullable=True)
    contralavado_tanque_b = Column(Time, nullable=True)
    cloro_riser_linea = Column(String(20), nullable=False)
    cloro_riser_resultado = Column(Float, nullable=False)
    responsable = Column(String(100), nullable=False)


class OsmosisInversa(Base):
    __tablename__ = "osmosis_inversa"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    hora = Column(Time, nullable=True)
    k = Column(Float, nullable=False)
    h = Column(Float, nullable=False)
    q_perm = Column(Float, nullable=False)
    q_mezcla = Column(Float, nullable=False)
    q_rechazo = Column(Float, nullable=False)
    p_select = Column(String(10), nullable=False)
    p_valor = Column(Float, nullable=False)


class FiltroArena(Base):
    __tablename__ = "filtro_arena"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    hora = Column(Time, nullable=True)
    presion_interno = Column(Float, nullable=False)
    presion_externo = Column(Float, nullable=False)
    fecha_contralavado = Column(Date, nullable=True)
