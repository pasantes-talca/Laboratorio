import { useCallback, useEffect, useMemo } from 'react';
import { PRODUCT_STANDARDS, findProductStandard } from '../../../data/productStandards';

export function useDashboardMetrics({ bebidaData, jarabeData, torqueData, selectedLinea, selectedMes, selectedFecha, selectedSabor, setSelectedMes, setSelectedSabor }) {
  // Extraer lista única de Meses disponibles a partir de los datos
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    const addDate = (dateStr) => {
      if (dateStr && dateStr.length >= 7) {
        monthsSet.add(dateStr.slice(0, 7)); // 'YYYY-MM'
      }
    };

    bebidaData.forEach((d) => addDate(d.fecha));
    jarabeData.forEach((d) => addDate(d.fecha));
    torqueData.forEach((d) => addDate(d.fecha));

    const sorted = Array.from(monthsSet).sort().reverse();
    return sorted;
  }, [bebidaData, jarabeData, torqueData]);

  // Si el mes seleccionado no existe en los disponibles, fijar el más reciente
  useEffect(() => {
    if (availableMonths.length > 0 && selectedMes !== 'todos' && !availableMonths.includes(selectedMes)) {
      setSelectedMes(availableMonths[0]);
    }
  }, [availableMonths, selectedMes]);

  // Extraer lista única de Fechas disponibles según el Mes seleccionado
  const availableDates = useMemo(() => {
    const datesSet = new Set();
    const addDate = (dateStr) => {
      if (!dateStr) return;
      if (selectedMes === 'todos' || dateStr.startsWith(selectedMes)) {
        datesSet.add(dateStr); // 'YYYY-MM-DD'
      }
    };

    bebidaData.forEach((d) => addDate(d.fecha));
    jarabeData.forEach((d) => addDate(d.fecha));
    torqueData.forEach((d) => addDate(d.fecha));

    return Array.from(datesSet).sort();
  }, [bebidaData, jarabeData, torqueData, selectedMes]);

  // Formateador amigable de nombres de mes
  const formatMonthName = (monthStr) => {
    if (!monthStr || monthStr === 'todos') return 'Todos los Meses';
    const [y, m] = monthStr.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const mIndex = parseInt(m, 10) - 1;
    return `${monthNames[mIndex] || m} ${y}`;
  };

  // Formateador amigable de fechas
  const formatDateName = (dateStr) => {
    if (!dateStr || dateStr === 'todas') return 'Todo el Mes / Todas';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Extraer lista de Productos disponibles para la Fecha, Mes y Línea seleccionados
  const availableProducts = useMemo(() => {
    const lineaNum = selectedLinea === 'linea1' ? 1 : 2;
    const rawNames = new Set();

    const checkItem = (d, checkLinea = true) => {
      if (!d) return;
      if (checkLinea && d.linea !== lineaNum) return;
      if (selectedFecha !== 'todas') {
        if (d.fecha !== selectedFecha) return;
      } else if (selectedMes !== 'todos') {
        if (!d.fecha || !d.fecha.startsWith(selectedMes)) return;
      }
      const name = d.marca || d.sabor;
      if (name && strValid(name)) {
        rawNames.add(name.trim());
      }
    };

    function strValid(s) {
      const lower = String(s).toLowerCase();
      return lower !== '' && !lower.includes('parada') && !lower.includes('pausa') && lower !== 'null' && lower !== 'undefined';
    }

    bebidaData.forEach((d) => checkItem(d, true));
    torqueData.forEach((d) => checkItem(d, true));
    jarabeData.forEach((d) => checkItem(d, true));

    if (rawNames.size === 0) {
      // Si no hay mediciones específicas en ese día, mostrar los estándares oficiales
      return PRODUCT_STANDARDS;
    }

    // Mapear los nombres crudos a los estándares oficiales correspondientes
    const matchedStandards = new Map();
    rawNames.forEach((raw) => {
      const std = findProductStandard(raw);
      if (std) {
        matchedStandards.set(std.id, std);
      }
    });

    return matchedStandards.size > 0 ? Array.from(matchedStandards.values()) : PRODUCT_STANDARDS;
  }, [bebidaData, jarabeData, torqueData, selectedLinea, selectedMes, selectedFecha]);

  // Si el sabor actual no está entre los productos disponibles del día, autoseleccionar el primero
  useEffect(() => {
    if (availableProducts.length > 0) {
      const isCurrentAvailable = availableProducts.some(
        (p) => p.sabor.toLowerCase() === (selectedSabor || '').toLowerCase()
      );
      if (!isCurrentAvailable) {
        setSelectedSabor(availableProducts[0].sabor);
      }
    }
  }, [availableProducts, selectedSabor]);

  // Obtener estándar del producto seleccionado
  const currentStandard = useMemo(() => {
    return findProductStandard(selectedSabor);
  }, [selectedSabor]);

  const isSodaOrSifon = useMemo(() => {
    const s = (selectedSabor || '').toLowerCase();
    return s.includes('soda') || s.includes('sifon');
  }, [selectedSabor]);

  // Límites de torque según línea seleccionada
  const torqueLimits = useMemo(() => {
    if (!currentStandard) return null;
    if (selectedLinea === 'linea1') {
      return currentStandard.torqueLong || { min: 15, max: 20, objetivo: 17.5 };
    }
    return currentStandard.torqueShort || { min: 13, max: 17, objetivo: 15.0 };
  }, [currentStandard, selectedLinea]);

  // Helper para comparar sabor / producto
  const matchesSabor = useCallback((itemSaborOrMarca) => {
    if (!itemSaborOrMarca || !selectedSabor) return true;
    const sItem = itemSaborOrMarca.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const sTarget = selectedSabor.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (sTarget.includes('sifon')) return sItem.includes('sifon');
    if (sTarget.includes('soda')) return sItem.includes('soda');
    if (sTarget.includes('tonica')) return sItem.includes('tonica');
    if (sTarget.includes('manzana')) return sItem.includes('manzana');
    if (sTarget.includes('cola')) return sItem.includes('cola');
    if (sTarget.includes('naranja')) return sItem.includes('naranja');
    if (sTarget.includes('lima') || sTarget.includes('limon')) return sItem.includes('lima') || sItem.includes('limon');
    if (sTarget.includes('pomelo')) return sItem.includes('pomelo');

    return sItem.includes(sTarget) || sTarget.includes(sItem);
  }, [selectedSabor]);

  // Helper de filtrado por Mes y Fecha
  const matchesDateFilter = useCallback((itemDateStr) => {
    if (!itemDateStr) return false;
    if (selectedFecha !== 'todas') {
      return itemDateStr === selectedFecha;
    }
    if (selectedMes !== 'todos') {
      return itemDateStr.startsWith(selectedMes);
    }
    return true;
  }, [selectedMes, selectedFecha]);

  // Helper para formatear etiqueta de fecha/hora en los gráficos
  const formatDateTimeLabel = (dateStr, timeStr) => {
    const time = timeStr ? timeStr.slice(0, 5) : '';
    if (selectedFecha !== 'todas') {
      // Si ya filtramos por un día específico, mostrar la hora en el eje X
      return time || dateStr || '';
    }
    if (!dateStr) return time;
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const day = parts[2];
        const monthNum = parseInt(parts[1], 10);
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const month = months[monthNum - 1] || parts[1];
        return `${day} ${month} ${time}`.trim();
      }
    } catch {}
    return `${dateStr} ${time}`.trim();
  };

  // 1. Datos para gráfico de °BRIX (desde Bebida y Jarabe)
  const brixChartData = useMemo(() => {
    if (isSodaOrSifon || !currentStandard?.brix) return [];

    const lineaNum = selectedLinea === 'linea1' ? 1 : 2;

    const filteredBebida = bebidaData.filter((item) => {
      if (item.grados_brix === null || item.grados_brix === undefined) return false;
      if (item.linea !== lineaNum) return false;
      if (!matchesDateFilter(item.fecha)) return false;
      if (!matchesSabor(item.marca)) return false;
      return true;
    });

    const filteredJarabe = jarabeData.filter((item) => {
      if (item.linea !== lineaNum) return false;
      if (item.bx_patron === null || item.bx_patron === undefined) return false;
      if (!matchesDateFilter(item.fecha)) return false;
      if (!matchesSabor(item.sabor)) return false;
      return true;
    });

    // Helper to parse date for sorting
    const parseDateTime = (d, t) => {
      if (!d) return 0;
      const [year, month, day] = d.split('-');
      let [hh, mm] = ['00', '00'];
      if (t) {
        [hh, mm] = t.split(':');
      }
      return new Date(year, month - 1, day, hh, mm).getTime();
    };

    const combined = [];

    filteredBebida.forEach(item => {
      combined.push({
        type: 'bebida',
        time: parseDateTime(item.fecha, item.hora),
        label: formatDateTimeLabel(item.fecha, item.hora),
        fullTime: `${item.fecha || ''} ${item.hora || ''}`.trim(),
        valor: item.grados_brix,
        meta: { responsable: item.responsable }
      });
    });

    filteredJarabe.forEach(item => {
      combined.push({
        type: 'jarabe',
        time: parseDateTime(item.fecha, item.hora),
        label: formatDateTimeLabel(item.fecha, item.hora),
        fullTime: `${item.fecha || ''} ${item.hora || ''}`.trim(),
        valorSecundario: item.bx_patron,
        meta: { responsable: item.responsable, tanque: item.tanque }
      });
    });

    combined.sort((a, b) => a.time - b.time);

    if (combined.length === 0) return [];

    return combined.map((item) => ({
      label: item.label,
      fullTime: item.fullTime,
      valor: item.valor ?? null,
      valorSecundario: item.valorSecundario ?? null,
      limiteMin: currentStandard.brix.min,
      limiteMax: currentStandard.brix.max,
      objetivo: currentStandard.brix.objetivo,
      meta: item.meta,
    }));
  }, [bebidaData, jarabeData, currentStandard, isSodaOrSifon, matchesDateFilter, matchesSabor, selectedFecha, selectedLinea]);

  // 2. Datos para gráfico de TA (desde Jarabe)
  const taChartData = useMemo(() => {
    if (isSodaOrSifon || !currentStandard?.ta) return [];

    const lineaNum = selectedLinea === 'linea1' ? 1 : 2;
    let filtered = jarabeData.filter((item) => {
      if (item.linea !== lineaNum) return false;
      if (item.ta === null || item.ta === undefined) return false;
      if (!matchesDateFilter(item.fecha)) return false;
      if (!matchesSabor(item.sabor)) return false;
      return true;
    });

    filtered = [...filtered].sort((a, b) => `${a.fecha} ${a.hora || ''}`.localeCompare(`${b.fecha} ${b.hora || ''}`));

    if (filtered.length === 0) return [];

    return filtered.map((item) => ({
      label: formatDateTimeLabel(item.fecha, item.hora),
      fullTime: `${item.fecha || ''} ${item.hora || ''}`.trim(),
      valor: item.ta,
      limiteMin: currentStandard.ta.min,
      limiteMax: currentStandard.ta.max,
      objetivo: currentStandard.ta.objetivo,
      meta: { responsable: item.responsable, tanque: item.tanque },
    }));
  }, [jarabeData, currentStandard, isSodaOrSifon, matchesDateFilter, matchesSabor, selectedFecha, selectedLinea]);

  // 3. Datos para gráfico de Carbonatación / Vol. Gas (desde Control Bebida)
  const carbonatacionChartData = useMemo(() => {
    if (!currentStandard?.carbonatacion) return [];

    const lineaNum = selectedLinea === 'linea1' ? 1 : 2;

    let filtered = bebidaData.filter((item) => {
      if (item.vol_gas === null || item.vol_gas === undefined) return false;
      if (item.linea !== lineaNum) return false;
      if (!matchesDateFilter(item.fecha)) return false;
      if (!matchesSabor(item.marca)) return false;
      return true;
    });

    filtered = [...filtered].sort((a, b) => `${a.fecha} ${a.hora || ''}`.localeCompare(`${b.fecha} ${b.hora || ''}`));

    if (filtered.length === 0) return [];

    return filtered.map((item) => ({
      label: formatDateTimeLabel(item.fecha, item.hora),
      fullTime: `${item.fecha || ''} ${item.hora || ''}`.trim(),
      valor: item.vol_gas,
      limiteMin: currentStandard.carbonatacion.min,
      limiteMax: currentStandard.carbonatacion.max,
      objetivo: currentStandard.carbonatacion.objetivo,
      meta: { responsable: item.responsable, tamano: item.tamano },
    }));
  }, [bebidaData, currentStandard, selectedLinea, matchesDateFilter, matchesSabor, selectedFecha]);

  // 4. Datos para gráfico de Torques por Cabezal (Eje X: CAB 1 a 12/14)
  const torqueChartData = useMemo(() => {
    if (!torqueLimits) return [];

    const totalCabezales = selectedLinea === 'linea1' ? 12 : 14;
    const lineaNum = selectedLinea === 'linea1' ? 1 : 2;

    const filtered = torqueData.filter((item) => {
      if (item.linea !== lineaNum) return false;
      if (!matchesDateFilter(item.fecha)) return false;
      if (item.sabor && !matchesSabor(item.sabor)) return false;
      return true;
    });

    const cabPoints = [];
    for (let c = 1; c <= totalCabezales; c++) {
      const match = [...filtered].sort((a, b) => `${b.fecha} ${b.hora || ''}`.localeCompare(`${a.fecha} ${a.hora || ''}`)).find((item) => Number(item.numero_cabezal) === c);
      cabPoints.push({
        label: `${c}`,
        fullTime: match ? `${match.fecha || ''} ${match.hora || ''}` : `Cabezal ${c}`,
        valor: match ? match.valor : null,
        limiteMin: torqueLimits.min,
        limiteMax: torqueLimits.max,
        objetivo: torqueLimits.objetivo,
        meta: match ? { responsable: match.responsable, color: match.color } : {},
      });
    }

    return cabPoints;
  }, [torqueData, torqueLimits, selectedLinea, matchesDateFilter, matchesSabor]);

  // Resumen de estado para KPI cards
  const latestBrix = brixChartData.filter(d => Number.isFinite(d.valor)).slice(-1)[0]?.valor;
  const latestTa = taChartData.filter(d => Number.isFinite(d.valor)).slice(-1)[0]?.valor;
  const latestCarb = carbonatacionChartData.filter(d => Number.isFinite(d.valor)).slice(-1)[0]?.valor;
  const torqueValues = torqueChartData.map(d => d.valor).filter(v => v !== null);
  const avgTorque = torqueValues.length ? (torqueValues.reduce((a, b) => a + b, 0) / torqueValues.length).toFixed(1) : null;

  return { availableMonths, availableDates, availableProducts, formatMonthName, formatDateName, currentStandard, isSodaOrSifon, torqueLimits, brixChartData, taChartData, carbonatacionChartData, torqueChartData, latestBrix, latestTa, latestCarb, avgTorque };
}
