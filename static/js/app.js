document.addEventListener("DOMContentLoaded", () => {
    // DOM refs — all null-safe; each section checks existence before wiring events
    const form             = document.getElementById("quality-control-form");
    const selectMarca      = document.getElementById("marca");
    const selectConcentrado= document.getElementById("tipo_concentrado");
    const selectTamano     = document.getElementById("tamano");
    const selectResponsable= document.getElementById("responsable");
    const selectBebidaTanque=document.getElementById("tanque");
    const btnReset         = document.getElementById("btn-reset");

    const torqueForm       = document.getElementById("torque-form");
    const selectTorqueSabor= document.getElementById("torque_sabor");
    const inputTorqueColor = document.getElementById("torque_color");
    const selectTorqueResp = document.getElementById("torque_responsable");
    const selectTorqueMarca= document.getElementById("torque_marca");
    const selectTorqueNumero=document.getElementById("torque_numero");
    const inputTorqueValor = document.getElementById("torque_valor");
    const btnResetTorque   = document.getElementById("btn-reset-torque");

    const btnOpenPausa  = document.getElementById("btn-open-pausa");
    const btnClosePausa = document.getElementById("btn-close-pausa");
    const btnCancelPausa= document.getElementById("btn-cancel-pausa");
    const modalPausa    = document.getElementById("modal-pausa");
    const pausaForm     = document.getElementById("pausa-form");
    const selectPausaMotivo = document.getElementById("pausa_motivo");
    const selectPausaResp   = document.getElementById("pausa_responsable");
    const inputPausaObs     = document.getElementById("pausa_observacion");
    const pausaCtxLinea = document.getElementById("pausa-ctx-linea");
    const pausaCtxTurno = document.getElementById("pausa-ctx-turno");

    const globalTurno = document.getElementById("global_turno");
    const globalLinea = document.getElementById("global_linea");

    // ==========================================
    // UTILITY: Toast
    // ==========================================
    function showToast(message, type = "success") {
        const tc = document.getElementById("toast-container");
        if (!tc) return;
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        const icon = type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-triangle-exclamation";
        toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
        tc.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(20px)";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ==========================================
    // GLOBAL: Linea/Turno changes (any page)
    // ==========================================
    function toggleNocheSection() {
        const turno = globalTurno ? globalTurno.value : "";
        const section = document.getElementById("torque_noche_section");
        if (section) section.classList.toggle("field-hidden", turno !== "noche");
    }

    function updateTorqueOptions() {
        if (!globalLinea || !globalTurno) return;
        const select = document.getElementById("torque_numero");
        if (!select) return;
        const currentValue = select.value;
        const linea = globalLinea.value;
        const turno = globalTurno.value;
        select.innerHTML = '<option value="" disabled selected>Seleccione cabezal...</option>';
        const maxTorques = (linea === "linea1") ? 12 : 14;
        const isNoche = (turno === "noche");
        const nocheRadio = document.querySelector('input[name="torque_noche"]:checked');
        const nocheTag = nocheRadio ? nocheRadio.value : "Noche 1";
        for (let i = 1; i <= maxTorques; i++) {
            const label = isNoche ? `Cabezal ${i} - ${nocheTag}` : `Cabezal ${i}`;
            select.insertAdjacentHTML("beforeend", `<option value="${i}">${label}</option>`);
        }
        const opts = Array.from(select.options).map(o => o.value);
        if (currentValue && opts.includes(currentValue)) select.value = currentValue;
    }

    // ==========================================
    // ASIGNACIÓN DE PRODUCCIÓN POR LÍNEA
    // ==========================================
    const DEFAULT_LINE_CONFIGS = {
        linea1: {
            marca: "Cola",
            concentrado: "IFF",
            tamano: "2L",
            tanque: "Tanque 4"
        },
        linea2: {
            marca: "Naranja",
            concentrado: "KG",
            tamano: "2.25L",
            tanque: "Tanque 5"
        }
    };

    function getLineConfigs() {
        try {
            const saved = localStorage.getItem("produccion_lineas_asignadas");
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Error al leer asignaciones:", e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_LINE_CONFIGS));
    }

    function saveLineConfigs(configs) {
        localStorage.setItem("produccion_lineas_asignadas", JSON.stringify(configs));
    }

    function ensureOptionExists(selectElem, val, text = null) {
        if (!selectElem || !val) return;
        let opt = Array.from(selectElem.options).find(o => o.value.toLowerCase().trim() === String(val).toLowerCase().trim());
        if (!opt) {
            opt = document.createElement("option");
            opt.value = val;
            opt.textContent = text || val;
            selectElem.appendChild(opt);
        }
        selectElem.value = opt.value;
    }

    function applyActiveLineProduction() {
        const configs = getLineConfigs();
        const currentLine = (globalLinea && globalLinea.value) ? globalLinea.value : "linea1";
        const cfg = configs[currentLine] || DEFAULT_LINE_CONFIGS.linea1;
        const lineLabel = (currentLine === "linea1") ? "Línea 1" : "Línea 2";

        // 1. Actualizar Badges
        ["badge-bebida-linea", "badge-jarabe-linea", "badge-torque-linea"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<i class="fa-solid fa-lock"></i> ${lineLabel}`;
        });

        // 2. Aplicar en Bebida Terminada
        if (selectMarca) {
            ensureOptionExists(selectMarca, cfg.marca);
            selectMarca.classList.add("input-locked");
            selectMarca.setAttribute("tabindex", "-1");
        }
        if (selectConcentrado) {
            ensureOptionExists(selectConcentrado, cfg.concentrado);
            selectConcentrado.classList.add("input-locked");
            selectConcentrado.setAttribute("tabindex", "-1");
        }
        if (selectTamano) {
            ensureOptionExists(selectTamano, cfg.tamano);
            selectTamano.classList.add("input-locked");
            selectTamano.setAttribute("tabindex", "-1");
        }
        if (selectBebidaTanque) {
            const tqVal = cfg.tanque.replace("Tanque ", "").trim();
            ensureOptionExists(selectBebidaTanque, tqVal, cfg.tanque);
            selectBebidaTanque.classList.add("input-locked");
            selectBebidaTanque.setAttribute("tabindex", "-1");
        }

        // 3. Aplicar en Control de Jarabe
        const selectSaborJarabe = document.getElementById("jarabe_sabor");
        const selectConcJarabe = document.getElementById("jarabe_concentrado");
        const selectTanqueJarabe = document.getElementById("jarabe_tanque");

        if (selectSaborJarabe) {
            ensureOptionExists(selectSaborJarabe, cfg.marca);
            selectSaborJarabe.classList.add("input-locked");
            selectSaborJarabe.setAttribute("tabindex", "-1");
        }
        if (selectConcJarabe) {
            ensureOptionExists(selectConcJarabe, cfg.concentrado);
            selectConcJarabe.classList.add("input-locked");
            selectConcJarabe.setAttribute("tabindex", "-1");
        }
        if (selectTanqueJarabe) {
            const tqVal = cfg.tanque.replace("Tanque ", "").trim();
            ensureOptionExists(selectTanqueJarabe, tqVal, cfg.tanque);
            selectTanqueJarabe.classList.add("input-locked");
            selectTanqueJarabe.setAttribute("tabindex", "-1");
        }

        // 4. Aplicar en Control de Torque
        if (selectTorqueSabor) {
            ensureOptionExists(selectTorqueSabor, cfg.marca);
            selectTorqueSabor.classList.add("input-locked");
            selectTorqueSabor.setAttribute("tabindex", "-1");
            selectTorqueSabor.dispatchEvent(new Event("change"));
        }
    }

    // Control del Modal de Asignar Producción
    const btnOpenAsignar = document.getElementById("btn-open-asignar");
    const btnCloseAsignar = document.getElementById("btn-close-asignar");
    const btnCancelAsignar = document.getElementById("btn-cancel-asignar");
    const modalAsignar = document.getElementById("modal-asignar-produccion");
    const formAsignar = document.getElementById("asignar-produccion-form");
    const tabModalLinea1 = document.getElementById("modal-tab-linea1");
    const tabModalLinea2 = document.getElementById("modal-tab-linea2");
    const ctxModalLinea = document.getElementById("asignar-ctx-linea");

    const inputCfgMarca = document.getElementById("cfg_marca");
    const inputCfgConc = document.getElementById("cfg_concentrado");
    const inputCfgTam = document.getElementById("cfg_tamano");
    const inputCfgTanque = document.getElementById("cfg_tanque");

    let modalEditingLine = "linea1";

    function loadModalLineValues(targetLine) {
        modalEditingLine = targetLine;
        const configs = getLineConfigs();
        const cfg = configs[targetLine] || DEFAULT_LINE_CONFIGS[targetLine];
        const label = (targetLine === "linea1") ? "Línea 1" : "Línea 2";

        if (tabModalLinea1 && tabModalLinea2) {
            tabModalLinea1.classList.toggle("active", targetLine === "linea1");
            tabModalLinea2.classList.toggle("active", targetLine === "linea2");
        }

        if (ctxModalLinea) {
            ctxModalLinea.innerHTML = `<i class="fa-solid fa-industry"></i> Editando configuración: <strong>${label}</strong>`;
        }

        if (inputCfgMarca && cfg.marca) inputCfgMarca.value = cfg.marca;
        if (inputCfgConc && cfg.concentrado) inputCfgConc.value = cfg.concentrado;
        if (inputCfgTam && cfg.tamano) inputCfgTam.value = cfg.tamano;
        if (inputCfgTanque && cfg.tanque) inputCfgTanque.value = cfg.tanque;
    }

    if (btnOpenAsignar) {
        btnOpenAsignar.addEventListener("click", () => {
            const activeLine = (globalLinea && globalLinea.value) ? globalLinea.value : "linea1";
            loadModalLineValues(activeLine);
            if (modalAsignar) modalAsignar.classList.remove("field-hidden");
        });
    }

    if (tabModalLinea1) tabModalLinea1.addEventListener("click", () => loadModalLineValues("linea1"));
    if (tabModalLinea2) tabModalLinea2.addEventListener("click", () => loadModalLineValues("linea2"));

    function closeAsignarModal() {
        if (modalAsignar) modalAsignar.classList.add("field-hidden");
    }

    if (btnCloseAsignar) btnCloseAsignar.addEventListener("click", closeAsignarModal);
    if (btnCancelAsignar) btnCancelAsignar.addEventListener("click", closeAsignarModal);
    if (modalAsignar) {
        modalAsignar.addEventListener("click", (e) => {
            if (e.target === modalAsignar) closeAsignarModal();
        });
    }

    if (formAsignar) {
        formAsignar.addEventListener("submit", (e) => {
            e.preventDefault();
            const configs = getLineConfigs();
            configs[modalEditingLine] = {
                marca: inputCfgMarca ? inputCfgMarca.value : "Cola",
                concentrado: inputCfgConc ? inputCfgConc.value : "IFF",
                tamano: inputCfgTam ? inputCfgTam.value : "2L",
                tanque: inputCfgTanque ? inputCfgTanque.value : "Tanque 4"
            };
            saveLineConfigs(configs);
            applyActiveLineProduction();
            const label = (modalEditingLine === "linea1") ? "Línea 1" : "Línea 2";
            showToast(`Asignación guardada para ${label}: ${configs[modalEditingLine].marca} (${configs[modalEditingLine].tamano})`, "success");
            closeAsignarModal();
        });
    }

    if (globalLinea) globalLinea.addEventListener("change", () => {
        if (torqueForm) updateTorqueOptions();
        applyActiveLineProduction();
    });
    if (globalTurno) globalTurno.addEventListener("change", () => {
        if (torqueForm) { updateTorqueOptions(); toggleNocheSection(); }
    });
    document.querySelectorAll('input[name="torque_noche"]').forEach(radio => {
        radio.addEventListener("change", () => { if (torqueForm) updateTorqueOptions(); });
    });

    // ==========================================
    // TABS NAVIGATION (Controles de Calidad)
    // ==========================================
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");

    if (tabButtons.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const targetTab = btn.getAttribute("data-tab");
                tabButtons.forEach(b => b.classList.remove("active"));
                tabContents.forEach(tc => {
                    tc.classList.remove("active");
                    tc.style.display = "none";
                });

                btn.classList.add("active");
                const activeContent = document.getElementById(`tab-${targetTab}`);
                if (activeContent) {
                    activeContent.classList.add("active");
                    activeContent.style.display = "block";
                }
            });
        });
    }

    // ==========================================
    // PAGE: BEBIDA TERMINADA
    // ==========================================
    let allConcentrados = [], allTamanos = [];

    function populateConcentrados(list, def = null) {
        if (!selectConcentrado) return;
        selectConcentrado.innerHTML = '<option value="" disabled selected>Seleccione tipo</option>';
        list.forEach(c => {
            const o = document.createElement("option");
            o.value = c.codigo; o.textContent = c.codigo;
            if (def && c.codigo === def) o.selected = true;
            selectConcentrado.appendChild(o);
        });
    }
    function populateTamanos(list, def = null) {
        if (!selectTamano) return;
        selectTamano.innerHTML = '<option value="" disabled selected>Seleccione tamaño</option>';
        list.forEach(t => {
            const o = document.createElement("option");
            o.value = t.valor; o.textContent = t.valor;
            if (def && t.valor === def) o.selected = true;
            selectTamano.appendChild(o);
        });
    }

    if (form) {
        async function initDropdowns() {
            try {
                const [mR, cR, tR, rR, tqR] = await Promise.all([
                    fetch("/api/marcas"), fetch("/api/tipos-concentrado"),
                    fetch("/api/tamanos"), fetch("/api/responsables"), fetch("/api/tanques")
                ]);
                if (mR.ok) {
                    const marcas = await mR.json();
                    selectMarca.innerHTML = '<option value="" disabled selected>Seleccione marca</option>';
                    marcas.forEach(m => { const o=document.createElement("option"); o.value=m.nombre; o.textContent=m.nombre; selectMarca.appendChild(o); });
                }
                if (tqR.ok) {
                    const tanques = await tqR.json();
                    selectBebidaTanque.innerHTML = '<option value="" disabled selected>Seleccione tanque</option>';
                    tanques.forEach(t => { const o=document.createElement("option"); o.value=t.numero; o.textContent=t.numero; selectBebidaTanque.appendChild(o); });
                }
                if (cR.ok) allConcentrados = await cR.json();
                if (tR.ok) allTamanos = await tR.json();
                populateConcentrados(allConcentrados);
                populateTamanos(allTamanos);
                if (rR.ok) {
                    const responsables = await rR.json();
                    selectResponsable.innerHTML = '<option value="" disabled selected>Seleccione responsable</option>';
                    responsables.forEach(r => { const o=document.createElement("option"); o.value=r.nombre_completo; o.textContent=r.nombre_completo; selectResponsable.appendChild(o); });
                }
                applyActiveLineProduction();
            } catch(e) { console.error(e); showToast("Error al cargar datos maestros desde PostgreSQL", "error"); }
        }
        initDropdowns();

        selectMarca.addEventListener("change", () => {
            const marca = selectMarca.value.toLowerCase();
            let fc = allConcentrados, ft = allTamanos, dc = null, dt = null;
            if (marca.includes("sifon") || marca.includes("sif\xf3n")) {
                fc = allConcentrados.filter(c => c.codigo.toLowerCase().includes("talca"));
                ft = allTamanos.filter(t => t.valor.toLowerCase().includes("2") && !t.valor.includes("2.25") && !t.valor.includes("2,25"));
                if(fc.length) dc = fc[0].codigo;
                if(ft.length) dt = ft[0].valor;
            } else if (marca.includes("soda")) {
                fc = allConcentrados.filter(c => c.codigo.toLowerCase().includes("talca"));
                ft = allTamanos.filter(t => t.valor.includes("2.25") || t.valor.includes("2,25") || t.valor.includes("500"));
                if(fc.length) dc = fc[0].codigo;
                const d = ft.find(t => t.valor.includes("2.25") || t.valor.includes("2,25"));
                if(d) dt = d.valor;
            } else if (marca.includes("cola") || marca.includes("pomelo") || marca.includes("naranja") || marca.includes("manzana")) {
                fc = allConcentrados.filter(c => !c.codigo.toLowerCase().includes("talca"));
                ft = allTamanos.filter(t => t.valor.includes("3") || t.valor.includes("2.25") || t.valor.includes("2,25") || t.valor.includes("500"));
                const d = ft.find(t => t.valor.includes("3") && !t.valor.includes("500"));
                if(d) dt = d.valor;
            }
            populateConcentrados(fc, dc);
            populateTamanos(ft, dt);
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const horaInput = document.getElementById("hora").value.trim();
            const carac_organolep = document.querySelector('input[name="carac_organolep"]:checked').value;
            const nivel_llenado = document.querySelector('input[name="nivel_llenado"]:checked').value;
            const control_videojet = document.querySelector('input[name="control_videojet"]:checked').value;
            const contenido = parseFloat(document.getElementById("contenido").value);
            const presion = parseFloat(document.getElementById("presion").value);
            const temperatura = parseFloat(document.getElementById("temperatura").value);
            const vol_gas = parseFloat(document.getElementById("vol_gas").value);
            const brix = parseFloat(document.getElementById("brix").value);
            if (isNaN(contenido) || isNaN(presion) || isNaN(temperatura) || isNaN(vol_gas) || isNaN(brix)) {
                showToast("Por favor, ingres\xe1 valores num\xe9ricos v\xe1lidos.", "error"); return;
            }
            const payload = {
                hora: horaInput || null,
                turno: globalTurno ? globalTurno.value : "ma\xf1ana",
                linea: globalLinea ? globalLinea.value : "linea1",
                carac_organolep, nivel_llenado, contenido, presion,
                temperatura, vol_gas, brix, control_videojet,
                responsable: selectResponsable.value,
                marca: selectMarca.value,
                tipo_concentrado: selectConcentrado.value,
                tamano: selectTamano.value,
                lote_tapa: document.getElementById("lote_tapa").value.trim(),
                tanque: selectBebidaTanque.value
            };
            try {
                const res = await fetch("/api/control-bebida", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
                if (res.ok) {
                    showToast("Control de calidad registrado con \xe9xito en PostgreSQL", "success");
                    ["hora","contenido","presion","temperatura","vol_gas","brix"].forEach(id => { document.getElementById(id).value = ""; });
                } else {
                    const err = await res.json();
                    showToast(`Error al guardar: ${err.detail || "Error en el servidor"}`, "error");
                }
            } catch(e) { console.error(e); showToast("No se pudo conectar al servidor", "error"); }
        });

        if (btnReset) {
            btnReset.addEventListener("click", () => {
                if (confirm("¿Deseas vaciar todos los campos del formulario?")) {
                    form.reset();
                    if (selectResponsable) selectResponsable.selectedIndex = 0;
                    applyActiveLineProduction();
                }
            });
        }
    }

    // ==========================================
    // PAGE: JARABE
    // ==========================================
    const jarabeForm = document.getElementById("jarabe-form");
    if (jarabeForm) {
        const selectSabor = document.getElementById("jarabe_sabor");
        const selectConcJarabe = document.getElementById("jarabe_concentrado");
        const selectTanque = document.getElementById("jarabe_tanque");
        const selectRespJarabe = document.getElementById("jarabe_responsable");
        const chkObs = document.getElementById("jarabe_chk_obs");
        const obsWrapper = document.getElementById("jarabe_obs_wrapper");
        const inputObservacion = document.getElementById("jarabe_observacion");
        const btnResetJarabe = document.getElementById("btn-reset-jarabe");

        chkObs.addEventListener("change", () => {
            obsWrapper.classList.toggle("field-hidden", !chkObs.checked);
            if (!chkObs.checked) inputObservacion.value = "";
        });

        async function initJarabeDropdowns() {
            try {
                const [sR, cR, tR, rR] = await Promise.all([
                    fetch("/api/sabores"), fetch("/api/tipos-concentrado"),
                    fetch("/api/tanques"), fetch("/api/responsables")
                ]);
                if (sR.ok) {
                    const sabores = await sR.json();
                    selectSabor.innerHTML = '<option value="" disabled selected>Seleccione sabor</option>';
                    sabores.forEach(s => { const o=document.createElement("option"); o.value=s.nombre; o.textContent=s.nombre; selectSabor.appendChild(o); });
                }
                if (cR.ok) {
                    const concs = await cR.json();
                    selectConcJarabe.innerHTML = '<option value="" disabled selected>Seleccione concentrado</option>';
                    concs.forEach(c => { const o=document.createElement("option"); o.value=c.codigo; o.textContent=c.codigo; selectConcJarabe.appendChild(o); });
                }
                if (tR.ok) {
                    const tanques = await tR.json();
                    selectTanque.innerHTML = '<option value="" disabled selected>Seleccione tanque</option>';
                    tanques.forEach(t => { const o=document.createElement("option"); o.value=t.numero; o.textContent=t.numero; selectTanque.appendChild(o); });
                }
                if (rR.ok) {
                    const responsables = await rR.json();
                    selectRespJarabe.innerHTML = '<option value="" disabled selected>Seleccione responsable</option>';
                    responsables.forEach(r => { const o=document.createElement("option"); o.value=r.nombre_completo; o.textContent=r.nombre_completo; selectRespJarabe.appendChild(o); });
                }
                applyActiveLineProduction();
            } catch(e) { console.error(e); showToast("Error al cargar datos para el Control de Jarabe", "error"); }
        }
        initJarabeDropdowns();

        jarabeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const bx_patron = parseFloat(document.getElementById("jarabe_bx_patron").value);
            const ta = parseFloat(document.getElementById("jarabe_ta").value);
            if (isNaN(bx_patron) || isNaN(ta)) { showToast("Ingresá valores numéricos válidos en °Bx Patr. y T.A.", "error"); return; }
            const payload = {
                hora: document.getElementById("jarabe_hora").value.trim() || null,
                turno: globalTurno ? globalTurno.value : "mañana",
                linea: globalLinea ? globalLinea.value : "linea1",
                sabor: selectSabor.value, concentrado: selectConcJarabe.value,
                tanque: selectTanque.value, bx_patron, ta, responsable: selectRespJarabe.value,
                observacion: chkObs.checked ? inputObservacion.value.trim() : null
            };
            try {
                const res = await fetch("/api/controles-jarabe", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
                if (res.ok) {
                    showToast("Control de jarabe registrado con éxito", "success");
                    ["jarabe_hora","jarabe_bx_patron","jarabe_ta"].forEach(id => { document.getElementById(id).value = ""; });
                    chkObs.checked = false; obsWrapper.classList.add("field-hidden"); inputObservacion.value = "";
                } else {
                    const err = await res.json();
                    showToast(`Error al guardar jarabe: ${err.detail || "Error en el servidor"}`, "error");
                }
            } catch(e) { console.error(e); showToast("No se pudo conectar al servidor para registrar el jarabe", "error"); }
        });

        if (btnResetJarabe) {
            btnResetJarabe.addEventListener("click", () => {
                if (confirm("¿Deseas vaciar los campos del Control de Jarabe?")) {
                    jarabeForm.reset();
                    if (selectRespJarabe) selectRespJarabe.selectedIndex = 0;
                    obsWrapper.classList.add("field-hidden");
                    applyActiveLineProduction();
                }
            });
        }
    }

    // ==========================================
    // PAGE: TORQUE
    // ==========================================
    if (torqueForm) {
        async function initTorqueDropdowns() {
            try {
                const [mR, rR] = await Promise.all([fetch("/api/marcas"), fetch("/api/responsables")]);
                if (mR.ok && selectTorqueSabor) {
                    const marcas = await mR.json();
                    selectTorqueSabor.innerHTML = '<option value="" disabled selected>Seleccione sabor...</option>';
                    marcas.forEach(m => { const o=document.createElement("option"); o.value=m.nombre; o.textContent=m.nombre; selectTorqueSabor.appendChild(o); });
                }
                if (rR.ok) {
                    const responsables = await rR.json();
                    if (selectTorqueResp) {
                        selectTorqueResp.innerHTML = '<option value="" disabled selected>Seleccione responsable...</option>';
                        responsables.forEach(r => { const o=document.createElement("option"); o.value=r.nombre_completo; o.textContent=r.nombre_completo; selectTorqueResp.appendChild(o); });
                    }
                    if (selectPausaResp) {
                        selectPausaResp.innerHTML = '<option value="" disabled selected>Seleccione responsable...</option>';
                        responsables.forEach(r => { const o=document.createElement("option"); o.value=r.nombre_completo; o.textContent=r.nombre_completo; selectPausaResp.appendChild(o); });
                    }
                }
                applyActiveLineProduction();
            } catch(e) { console.error(e); showToast("Error al cargar datos para el Control de Torque", "error"); }
            updateTorqueOptions();
            toggleNocheSection();
        }
        initTorqueDropdowns();

        if (selectTorqueSabor) {
            selectTorqueSabor.addEventListener("change", () => {
                const sabor = selectTorqueSabor.value.toLowerCase();
                let color = "Sin asignar";
                if (sabor.includes("cola")) color = "Azul";
                else if (sabor.includes("naranja")) color = "Naranja";
                else if (sabor.includes("pomelo")) color = "Amarillo";
                else if (sabor.includes("lima")) color = "Verde";
                else if (sabor.includes("soda")) color = "Gris";
                else if (sabor.includes("sifon") || sabor.includes("sifón")) color = "Rojo";
                else if (sabor.includes("manzana")) color = "Azul";
                if (inputTorqueColor) inputTorqueColor.value = color;
            });
        }

        if (btnResetTorque) {
            btnResetTorque.addEventListener("click", () => {
                if (confirm("¿Deseas vaciar los campos del Control de Torque?")) {
                    torqueForm.reset();
                    if (selectTorqueMarca) selectTorqueMarca.selectedIndex = 0;
                    if (selectTorqueResp) selectTorqueResp.selectedIndex = 0;
                    if (selectTorqueNumero) selectTorqueNumero.selectedIndex = 0;
                    applyActiveLineProduction();
                }
            });
        }

        torqueForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const cabezalVal = parseInt(selectTorqueNumero.value, 10);
            const valorVal = parseFloat(inputTorqueValor.value);
            if (isNaN(cabezalVal)) { showToast("Selecion\xe1 un n\xfamero de cabezal", "error"); return; }
            if (isNaN(valorVal)) { showToast("Ingres\xe1 un valor num\xe9rico para el torque", "error"); return; }
            const turnoActual = globalTurno ? globalTurno.value : "ma\xf1ana";
            const nocheVal = turnoActual === "noche"
                ? (document.querySelector('input[name="torque_noche"]:checked')?.value || "Noche 1") : null;
            const formData = {
                numero_cabezal: cabezalVal, turno: turnoActual, noche: nocheVal,
                linea: globalLinea ? globalLinea.value : "linea1",
                valor: valorVal,
                sabor: selectTorqueSabor ? selectTorqueSabor.value : "",
                marca: selectTorqueMarca ? selectTorqueMarca.value : "",
                color: inputTorqueColor ? inputTorqueColor.value : "",
                responsable: selectTorqueResp ? selectTorqueResp.value : ""
            };
            try {
                const res = await fetch("/api/controles-torque", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(formData) });
                if (res.ok) {
                    showToast("Control de Torque guardado exitosamente", "success");
                    if (selectTorqueNumero) selectTorqueNumero.selectedIndex = 0;
                    if (inputTorqueValor) inputTorqueValor.value = "";
                } else {
                    const err = await res.json();
                    showToast(`Error al guardar torque: ${err.detail || "Error en el servidor"}`, "error");
                }
            } catch(e) { console.error(e); showToast("No se pudo conectar al servidor para registrar el torque", "error"); }
        });
    }

    // ==========================================
    // PAUSA (any page that has the modal)
    // ==========================================
    if (btnOpenPausa) {
        btnOpenPausa.addEventListener("click", () => {
            if (pausaCtxLinea && globalLinea) {
                pausaCtxLinea.innerHTML = `<i class="fa-solid fa-industry"></i> ${globalLinea.options[globalLinea.selectedIndex]?.text || "L\xednea 1"}`;
            }
            if (pausaCtxTurno && globalTurno) {
                pausaCtxTurno.innerHTML = `<i class="fa-solid fa-clock"></i> Turno ${globalTurno.options[globalTurno.selectedIndex]?.text || "Ma\xf1ana"}`;
            }
            if (modalPausa) modalPausa.classList.remove("field-hidden");
            // Lazy-load responsables for pausa if not loaded
            if (selectPausaResp && selectPausaResp.options.length <= 1) {
                fetch("/api/responsables").then(r => r.json()).then(rs => {
                    selectPausaResp.innerHTML = '<option value="" disabled selected>Seleccione responsable...</option>';
                    rs.forEach(r => { const o=document.createElement("option"); o.value=r.nombre_completo; o.textContent=r.nombre_completo; selectPausaResp.appendChild(o); });
                });
            }
        });
    }

    function closePausaModal() {
        if (modalPausa) modalPausa.classList.add("field-hidden");
        if (pausaForm) pausaForm.reset();
    }

    if (btnClosePausa) btnClosePausa.addEventListener("click", closePausaModal);
    if (btnCancelPausa) btnCancelPausa.addEventListener("click", closePausaModal);
    if (modalPausa) modalPausa.addEventListener("click", e => { if (e.target === modalPausa) closePausaModal(); });

    if (pausaForm) {
        pausaForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (!selectPausaMotivo || !selectPausaMotivo.value.trim()) {
                showToast("Escrib\xed el motivo de la pausa antes de registrar", "error");
                if (selectPausaMotivo) selectPausaMotivo.focus(); return;
            }
            if (!selectPausaResp || !selectPausaResp.value) {
                showToast("Selecion\xe1 el responsable antes de registrar", "error"); return;
            }
            const payload = {
                motivo: selectPausaMotivo.value, responsable: selectPausaResp.value,
                observacion: inputPausaObs ? (inputPausaObs.value.trim() || null) : null,
                turno: globalTurno ? globalTurno.value : "ma\xf1ana",
                linea: globalLinea ? globalLinea.value : "linea1"
            };
            try {
                const res = await fetch("/api/pausas", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
                if (res.ok) { showToast("Pausa de línea registrada con éxito en PostgreSQL", "success"); closePausaModal(); }
                else { const err = await res.json(); showToast(`Error al registrar pausa: ${err.detail || "Error en el servidor"}`, "error"); }
            } catch(e) { console.error(e); showToast("No se pudo conectar al servidor para registrar la pausa", "error"); }
        });
    }

    // ==========================================
    // PAGE: PREPARACIÓN DE JARABE SIMPLE
    // ==========================================
    const formJarabeSimple = document.getElementById("form-jarabe-simple");
    if (formJarabeSimple) {
        const selectTanqueSimple = document.getElementById("tanque_numero");
        const selectRespSimple = document.getElementById("preparacion_responsable");
        const btnResetSimple = document.getElementById("btn-reset-jarabe-simple");

        // Cargar dropdowns de Tanques y Responsables
        async function initJarabeSimpleDropdowns() {
            try {
                const [tR, rR] = await Promise.all([
                    fetch("/api/tanques"),
                    fetch("/api/responsables")
                ]);

                if (tR.ok && selectTanqueSimple) {
                    const tanques = await tR.json();
                    selectTanqueSimple.innerHTML = '<option value="" disabled selected>Seleccione tanque...</option>';
                    tanques.forEach(t => {
                        const opt = document.createElement("option");
                        opt.value = t.numero;
                        opt.textContent = `Tanque ${t.numero}`;
                        selectTanqueSimple.appendChild(opt);
                    });
                }

                if (rR.ok && selectRespSimple) {
                    const responsables = await rR.json();
                    selectRespSimple.innerHTML = '<option value="" disabled selected>Seleccione responsable...</option>';
                    responsables.forEach(r => {
                        const opt = document.createElement("option");
                        opt.value = r.nombre_completo;
                        opt.textContent = r.nombre_completo;
                        selectRespSimple.appendChild(opt);
                    });
                }
            } catch (e) {
                console.error("Error al cargar datos de tanques o responsables:", e);
            }
        }
        initJarabeSimpleDropdowns();

        // Botón limpiar
        if (btnResetSimple) {
            btnResetSimple.addEventListener("click", () => {
                if (confirm("¿Deseas vaciar todos los campos del formulario de Jarabe Simple?")) {
                    formJarabeSimple.reset();
                    if (selectTanqueSimple) selectTanqueSimple.selectedIndex = 0;
                    if (selectRespSimple) selectRespSimple.selectedIndex = 0;
                }
            });
        }

        // Envío del formulario
        formJarabeSimple.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Formulario de Preparación de Jarabe Simple completado correctamente", "success");
        });
    }

    // ==========================================
    // PAGE: PREPARACIÓN DE JARABE TERMINADO
    // ==========================================
    const formJarabeTerminado = document.getElementById("form-jarabe-terminado");
    if (formJarabeTerminado) {
        const selectSaborTerminado = document.getElementById("terminado_sabor");
        const selectConcTerminado = document.getElementById("terminado_concentrado");
        const selectTanqueTerminado = document.getElementById("terminado_tanque");
        const selectRespTerminado = document.getElementById("terminado_responsable");
        const btnResetTerminado = document.getElementById("btn-reset-jarabe-terminado");

        async function initJarabeTerminadoDropdowns() {
            try {
                const [sR, cR, tR, rR] = await Promise.all([
                    fetch("/api/sabores"),
                    fetch("/api/tipos-concentrado"),
                    fetch("/api/tanques"),
                    fetch("/api/responsables")
                ]);

                if (sR.ok && selectSaborTerminado) {
                    const sabores = await sR.json();
                    selectSaborTerminado.innerHTML = '<option value="" disabled selected>Seleccione sabor...</option>';
                    sabores.forEach(s => {
                        const opt = document.createElement("option");
                        opt.value = s.nombre;
                        opt.textContent = s.nombre;
                        selectSaborTerminado.appendChild(opt);
                    });
                }

                if (cR.ok && selectConcTerminado) {
                    const concs = await cR.json();
                    selectConcTerminado.innerHTML = '<option value="" disabled selected>Seleccione concentrado...</option>';
                    concs.forEach(c => {
                        const opt = document.createElement("option");
                        opt.value = c.codigo;
                        opt.textContent = c.codigo;
                        selectConcTerminado.appendChild(opt);
                    });
                }

                if (tR.ok && selectTanqueTerminado) {
                    const tanques = await tR.json();
                    selectTanqueTerminado.innerHTML = '<option value="" disabled selected>Seleccione tanque...</option>';
                    tanques.forEach(t => {
                        const opt = document.createElement("option");
                        opt.value = t.numero;
                        opt.textContent = `Tanque ${t.numero}`;
                        selectTanqueTerminado.appendChild(opt);
                    });
                }

                if (rR.ok && selectRespTerminado) {
                    const responsables = await rR.json();
                    selectRespTerminado.innerHTML = '<option value="" disabled selected>Seleccione responsable...</option>';
                    responsables.forEach(r => {
                        const opt = document.createElement("option");
                        opt.value = r.nombre_completo;
                        opt.textContent = r.nombre_completo;
                        selectRespTerminado.appendChild(opt);
                    });
                }
            } catch (e) {
                console.error("Error al cargar datos para Jarabe Terminado:", e);
            }
        }
        initJarabeTerminadoDropdowns();

        if (btnResetTerminado) {
            btnResetTerminado.addEventListener("click", () => {
                if (confirm("¿Deseas vaciar todos los campos del formulario de Jarabe Terminado?")) {
                    formJarabeTerminado.reset();
                    [selectSaborTerminado, selectConcTerminado, selectTanqueTerminado, selectRespTerminado]
                        .forEach(s => { if (s) s.selectedIndex = 0; });
                }
            });
        }

        formJarabeTerminado.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Formulario de Preparación de Jarabe Terminado completado correctamente", "success");
        });
    }

    // ==========================================
    // PAGE: SANEO DE TANQUES
    // ==========================================
    const formSaneoTanques = document.getElementById("form-saneo-tanques");
    if (formSaneoTanques) {
        const selectTanqueSaneo = document.getElementById("saneo_tanque");
        const selectRespSaneo = document.getElementById("saneo_responsable");
        const btnResetSaneo = document.getElementById("btn-reset-saneo");

        async function initSaneoDropdowns() {
            try {
                const [tR, rR] = await Promise.all([
                    fetch("/api/tanques"),
                    fetch("/api/responsables")
                ]);

                if (tR.ok && selectTanqueSaneo) {
                    const tanques = await tR.json();
                    selectTanqueSaneo.innerHTML = '<option value="" disabled selected>Seleccione tanque...</option>';
                    tanques.forEach(t => {
                        const opt = document.createElement("option");
                        opt.value = t.numero;
                        opt.textContent = `Tanque ${t.numero}`;
                        selectTanqueSaneo.appendChild(opt);
                    });
                }

                if (rR.ok && selectRespSaneo) {
                    const responsables = await rR.json();
                    selectRespSaneo.innerHTML = '<option value="" disabled selected>Seleccione responsable...</option>';
                    responsables.forEach(r => {
                        const opt = document.createElement("option");
                        opt.value = r.nombre_completo;
                        opt.textContent = r.nombre_completo;
                        selectRespSaneo.appendChild(opt);
                    });
                }
            } catch (e) {
                console.error("Error al cargar datos para Saneo de Tanques:", e);
            }
        }
        initSaneoDropdowns();

        if (btnResetSaneo) {
            btnResetSaneo.addEventListener("click", () => {
                if (confirm("¿Deseas vaciar los campos del formulario de Saneo de Tanques?")) {
                    formSaneoTanques.reset();
                    if (selectTanqueSaneo) selectTanqueSaneo.selectedIndex = 0;
                    if (selectRespSaneo) selectRespSaneo.selectedIndex = 0;
                }
            });
        }

        formSaneoTanques.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Registro de Saneo de Tanques completado correctamente", "success");
        });
    }

    // ==========================================
    // PAGE: PARTE DE JARABE
    // ==========================================
    const formParteJarabe = document.getElementById("form-parte-jarabe");
    if (formParteJarabe) {
        const inputParteFecha = document.getElementById("parte_fecha");
        const selectParteTanque = document.getElementById("parte_tanque");
        const selectParteSabor = document.getElementById("parte_sabor");
        const btnResetParte = document.getElementById("btn-reset-parte-jarabe");

        // Set default date to today
        if (inputParteFecha && !inputParteFecha.value) {
            inputParteFecha.value = new Date().toISOString().split("T")[0];
        }

        async function initParteJarabeDropdowns() {
            try {
                const [tR, sR] = await Promise.all([
                    fetch("/api/tanques"),
                    fetch("/api/sabores")
                ]);

                if (tR.ok && selectParteTanque) {
                    const tanques = await tR.json();
                    selectParteTanque.innerHTML = '<option value="" disabled selected>Seleccione tanque...</option>';
                    tanques.forEach(t => {
                        const opt = document.createElement("option");
                        opt.value = t.numero;
                        opt.textContent = `Tanque ${t.numero}`;
                        selectParteTanque.appendChild(opt);
                    });
                }

                if (sR.ok && selectParteSabor) {
                    const sabores = await sR.json();
                    selectParteSabor.innerHTML = '<option value="" disabled selected>Seleccione sabor...</option>';
                    sabores.forEach(s => {
                        const opt = document.createElement("option");
                        opt.value = s.nombre;
                        opt.textContent = s.nombre;
                        selectParteSabor.appendChild(opt);
                    });
                }
            } catch (e) {
                console.error("Error al cargar datos para Parte de Jarabe:", e);
            }
        }
        initParteJarabeDropdowns();

        if (btnResetParte) {
            btnResetParte.addEventListener("click", () => {
                if (confirm("¿Deseas vaciar los campos del Parte de Jarabe?")) {
                    formParteJarabe.reset();
                    if (inputParteFecha) inputParteFecha.value = new Date().toISOString().split("T")[0];
                    if (selectParteTanque) selectParteTanque.selectedIndex = 0;
                    if (selectParteSabor) selectParteSabor.selectedIndex = 0;
                }
            });
        }

        // Cargar Reporte Excel y Auto-completar
        const btnUploadExcel = document.getElementById("btn_upload_excel_parte");
        const inputExcel = document.getElementById("input_excel_parte");

        if (btnUploadExcel && inputExcel) {
            btnUploadExcel.addEventListener("click", () => inputExcel.click());

            inputExcel.addEventListener("change", async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);

                btnUploadExcel.disabled = true;
                btnUploadExcel.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

                try {
                    const res = await fetch("/api/parse-jarabe-excel", {
                        method: "POST",
                        body: formData
                    });

                    if (res.ok) {
                        const json = await res.json();
                        const d = json.data;

                        // 1. Fecha
                        if (d.fecha && inputParteFecha) inputParteFecha.value = d.fecha;

                        // 2. Tanque
                        if (d.tanque && selectParteTanque) {
                            const tqNum = d.tanque.replace("Tanque", "").trim();
                            ensureOptionExists(selectParteTanque, tqNum, `Tanque ${tqNum}`);
                        }

                        // 3. Sabor
                        if (d.sabor && selectParteSabor) {
                            ensureOptionExists(selectParteSabor, d.sabor);
                        }

                        // 4. Componentes e Ingredientes
                        const fieldsMap = {
                            "parte_azucar": d.azucar,
                            "parte_acido_citrico": d.acido_citrico,
                            "parte_benzoato": d.benzoato_sodio,
                            "parte_sorbato": d.sorbato_potasio,
                            "parte_sucralosa": d.sucralosa,
                            "parte_acesulfame": d.acesulfame_k,
                            "parte_citrato": d.citrato_sodio,
                            "parte_colorante_caramelo": d.colorante_caramelo,
                            "parte_acido_fosforico": d.acido_fosforico,
                            "parte_cafeina": d.cafeina,
                            "parte_acido_ascorbico": d.acido_ascorbico
                        };

                        Object.entries(fieldsMap).forEach(([elemId, val]) => {
                            const inp = document.getElementById(elemId);
                            if (inp) {
                                inp.value = (val !== null && val !== undefined) ? val : "";
                                inp.style.transition = "all 0.3s ease";
                                inp.style.borderColor = "rgba(16, 185, 129, 0.6)";
                                inp.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
                                setTimeout(() => {
                                    inp.style.borderColor = "";
                                    inp.style.backgroundColor = "";
                                }, 2500);
                            }
                        });

                        showToast(`Reporte importado con éxito: ${file.name}`, "success");
                    } else {
                        const err = await res.json();
                        showToast(`Error al procesar archivo: ${err.detail || "Formato no válido"}`, "error");
                    }
                } catch (err) {
                    console.error("Error al procesar excel:", err);
                    showToast("No se pudo conectar con el servidor para leer el archivo", "error");
                } finally {
                    btnUploadExcel.disabled = false;
                    btnUploadExcel.innerHTML = '<i class="fa-solid fa-file-arrow-up"></i> Cargar Reporte Excel';
                    inputExcel.value = "";
                }
            });
        }

        formParteJarabe.addEventListener("submit", (e) => {
            e.preventDefault();
            showToast("Parte de Jarabe guardado correctamente", "success");
        });
    }
});
