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

    if (globalLinea) globalLinea.addEventListener("change", () => { if (torqueForm) updateTorqueOptions(); });
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
                if (confirm("\xbfDeseas vaciar todos los campos del formulario?")) {
                    form.reset();
                    [selectMarca, selectConcentrado, selectTamano, selectResponsable, selectBebidaTanque]
                        .forEach(s => { if(s) s.selectedIndex = 0; });
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
            } catch(e) { console.error(e); showToast("Error al cargar datos para el Control de Jarabe", "error"); }
        }
        initJarabeDropdowns();

        jarabeForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const bx_patron = parseFloat(document.getElementById("jarabe_bx_patron").value);
            const ta = parseFloat(document.getElementById("jarabe_ta").value);
            if (isNaN(bx_patron) || isNaN(ta)) { showToast("Ingres\xe1 valores num\xe9ricos v\xe1lidos en \xb0Bx Patr. y T.A.", "error"); return; }
            const payload = {
                hora: document.getElementById("jarabe_hora").value.trim() || null,
                turno: globalTurno ? globalTurno.value : "ma\xf1ana",
                linea: globalLinea ? globalLinea.value : "linea1",
                sabor: selectSabor.value, concentrado: selectConcJarabe.value,
                tanque: selectTanque.value, bx_patron, ta, responsable: selectRespJarabe.value,
                observacion: chkObs.checked ? inputObservacion.value.trim() : null
            };
            try {
                const res = await fetch("/api/controles-jarabe", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
                if (res.ok) {
                    showToast("Control de jarabe registrado con \xe9xito", "success");
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
                if (confirm("\xbfDeseas vaciar los campos del Control de Jarabe?")) {
                    jarabeForm.reset();
                    [selectSabor, selectConcJarabe, selectTanque, selectRespJarabe].forEach(s => { if(s) s.selectedIndex = 0; });
                    obsWrapper.classList.add("field-hidden");
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
                else if (sabor.includes("sifon") || sabor.includes("sif\xf3n")) color = "Rojo";
                else if (sabor.includes("manzana")) color = "Azul";
                if (inputTorqueColor) inputTorqueColor.value = color;
            });
        }

        if (btnResetTorque) {
            btnResetTorque.addEventListener("click", () => {
                if (confirm("\xbfDeseas vaciar los campos del Control de Torque?")) {
                    torqueForm.reset();
                    [selectTorqueSabor, selectTorqueMarca, selectTorqueResp, selectTorqueNumero].forEach(s => { if(s) s.selectedIndex = 0; });
                    if (inputTorqueColor) inputTorqueColor.value = "";
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
});
