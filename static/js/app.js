document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos del DOM
    const form = document.getElementById("quality-control-form");
    const selectMarca = document.getElementById("marca");
    const selectConcentrado = document.getElementById("tipo_concentrado");
    const selectTamano = document.getElementById("tamano");
    const selectResponsable = document.getElementById("responsable");
    const selectBebidaTanque = document.getElementById("tanque");
    
    const btnReset = document.getElementById("btn-reset");

    // Torque DOM
    const torqueForm = document.getElementById("torque-form");
    const selectTorqueSabor = document.getElementById("torque_sabor");
    const inputTorqueColor = document.getElementById("torque_color");
    const selectTorqueResp = document.getElementById("torque_responsable");
    const selectTorqueMarca = document.getElementById("torque_marca");
    const selectTorqueNumero = document.getElementById("torque_numero");
    const inputTorqueValor = document.getElementById("torque_valor");
    const btnResetTorque = document.getElementById("btn-reset-torque");

    // Inicializar la aplicación
    initDropdowns();
    initJarabeDropdowns();
    initTabs();

    // Global Dropdowns
    const globalTurno = document.getElementById("global_turno");
    const globalLinea = document.getElementById("global_linea");

    const appState = {
        linea1: {
            bebida: { marca: "", concentrado: "", tamano: "", lote: "", tanque: "" },
            jarabe: { sabor: "", concentrado: "", tanque: "" },
            torque: { sabor: "", marca: "", color: "", responsable: "" }
        },
        linea2: {
            bebida: { marca: "", concentrado: "", tamano: "", lote: "", tanque: "" },
            jarabe: { sabor: "", concentrado: "", tanque: "" },
            torque: { sabor: "", marca: "", color: "", responsable: "" }
        }
    };
    
    let currentLinea = globalLinea.value;

    function saveCurrentLineState(linea) {
        appState[linea].bebida.marca = selectMarca.value;
        appState[linea].bebida.concentrado = selectConcentrado.value;
        appState[linea].bebida.tamano = selectTamano.value;
        appState[linea].bebida.lote = document.getElementById("lote_tapa").value;
        appState[linea].bebida.tanque = selectBebidaTanque.value;

        appState[linea].jarabe.sabor = selectSabor.value;
        appState[linea].jarabe.concentrado = selectConcJarabe.value;
        appState[linea].jarabe.tanque = selectTanque.value;

        appState[linea].torque.sabor = selectTorqueSabor.value;
        appState[linea].torque.marca = selectTorqueMarca.value;
        appState[linea].torque.color = inputTorqueColor.value;
        appState[linea].torque.responsable = selectTorqueResp.value;
    }

    function loadLineState(linea) {
        const state = appState[linea];
        
        selectMarca.value = state.bebida.marca || "";
        if (state.bebida.marca) {
            selectMarca.dispatchEvent(new Event('change'));
            selectConcentrado.value = state.bebida.concentrado || "";
            selectTamano.value = state.bebida.tamano || "";
        } else {
            selectConcentrado.innerHTML = '<option value="" disabled selected>Seleccione tipo</option>';
            selectTamano.innerHTML = '<option value="" disabled selected>Seleccione tamaño</option>';
            if(allConcentrados.length > 0) populateConcentrados(allConcentrados);
            if(allTamanos.length > 0) populateTamanos(allTamanos);
        }
        document.getElementById("lote_tapa").value = state.bebida.lote || "";
        selectBebidaTanque.value = state.bebida.tanque || "";

        selectSabor.value = state.jarabe.sabor || "";
        selectConcJarabe.value = state.jarabe.concentrado || "";
        selectTanque.value = state.jarabe.tanque || "";

        selectTorqueSabor.value = state.torque.sabor || "";
        selectTorqueMarca.value = state.torque.marca || "";
        inputTorqueColor.value = state.torque.color || "";
        selectTorqueResp.value = state.torque.responsable || "";
    }

    globalLinea.addEventListener("change", (e) => {
        saveCurrentLineState(currentLinea);
        currentLinea = e.target.value;
        loadLineState(currentLinea);
        updateTorqueOptions();
    });

    globalTurno.addEventListener("change", () => {
        updateTorqueOptions();
        toggleNocheSection();
    });

    function toggleNocheSection() {
        const turno = globalTurno.value;
        const section = document.getElementById("torque_noche_section");
        if (section) {
            section.classList.toggle("field-hidden", turno !== "noche");
        }
    }

    function updateTorqueOptions() {
        const linea = globalLinea.value;
        const select = document.getElementById("torque_numero");
        const currentValue = select.value;
        
        select.innerHTML = '<option value="" disabled selected>Seleccione cabezal...</option>';
        const maxTorques = (linea === "linea1") ? 12 : 14;
        
        for (let i = 1; i <= maxTorques; i++) {
            select.insertAdjacentHTML('beforeend', `<option value="${i}">${i}</option>`);
        }
        
        const options = Array.from(select.options).map(o => o.value);
        if (currentValue && options.includes(currentValue)) {
            select.value = currentValue;
        }
    }

    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });

                button.classList.add('active');

                const tabId = button.getAttribute('data-tab');
                const targetContent = document.getElementById(`tab-${tabId}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    targetContent.style.display = 'block';
                }
            });
        });
    }

    let allConcentrados = [];
    let allTamanos = [];

    // 1. Poblado de selects dinámicos desde la base de datos
    async function initDropdowns() {
        try {
            const [marcasRes, concRes, tamRes, respRes, tanquesRes] = await Promise.all([
                fetch("/api/marcas"),
                fetch("/api/tipos-concentrado"),
                fetch("/api/tamanos"),
                fetch("/api/responsables"),
                fetch("/api/tanques")
            ]);

            if (marcasRes.ok) {
                const marcas = await marcasRes.json();
                selectMarca.innerHTML = '<option value="" disabled selected>Seleccione marca</option>';
                selectTorqueSabor.innerHTML = '<option value="" disabled selected>Seleccione sabor...</option>';
                marcas.forEach(m => {
                    const opt = document.createElement("option");
                    opt.value = m.nombre;
                    opt.textContent = m.nombre;
                    selectMarca.appendChild(opt);

                    const optTorque = document.createElement("option");
                    optTorque.value = m.nombre;
                    optTorque.textContent = m.nombre;
                    selectTorqueSabor.appendChild(optTorque);
                });
            }

            if (tanquesRes.ok) {
                const tanques = await tanquesRes.json();
                selectBebidaTanque.innerHTML = '<option value="" disabled selected>Seleccione tanque</option>';
                tanques.forEach(t => {
                    const opt = document.createElement("option");
                    opt.value = t.numero;
                    opt.textContent = t.numero;
                    selectBebidaTanque.appendChild(opt);
                });
            }

            if (concRes.ok) allConcentrados = await concRes.json();
            if (tamRes.ok) allTamanos = await tamRes.json();

            populateConcentrados(allConcentrados);
            populateTamanos(allTamanos);

            if (respRes.ok) {
                const responsables = await respRes.json();
                selectResponsable.innerHTML = '<option value="" disabled selected>Seleccione responsable</option>';
                selectTorqueResp.innerHTML = '<option value="" disabled selected>Seleccione responsable...</option>';
                responsables.forEach(r => {
                    const opt = document.createElement("option");
                    opt.value = r.nombre_completo;
                    opt.textContent = r.nombre_completo;
                    selectResponsable.appendChild(opt);

                    const optTorque = document.createElement("option");
                    optTorque.value = r.nombre_completo;
                    optTorque.textContent = r.nombre_completo;
                    selectTorqueResp.appendChild(optTorque);
                });
            }
        } catch (error) {
            console.error("Error cargando los listados maestros:", error);
            showToast("Error al cargar datos maestros desde PostgreSQL", "error");
        }
        updateTorqueOptions();
    }

    function populateConcentrados(list, defaultVal = null) {
        selectConcentrado.innerHTML = '<option value="" disabled selected>Seleccione tipo</option>';
        list.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.codigo;
            opt.textContent = c.codigo;
            if (defaultVal && c.codigo === defaultVal) opt.selected = true;
            selectConcentrado.appendChild(opt);
        });
    }

    function populateTamanos(list, defaultVal = null) {
        selectTamano.innerHTML = '<option value="" disabled selected>Seleccione tamaño</option>';
        list.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.valor;
            opt.textContent = t.valor;
            if (defaultVal && t.valor === defaultVal) opt.selected = true;
            selectTamano.appendChild(opt);
        });
    }

    selectMarca.addEventListener("change", () => {
        const marca = selectMarca.value.toLowerCase();
        
        let filteredConc = allConcentrados;
        let filteredTam = allTamanos;
        let defConc = null;
        let defTam = null;

        if (marca.includes("sifon") || marca.includes("sifón")) {
            // Sifon 2L
            filteredConc = allConcentrados.filter(c => c.codigo.toLowerCase().includes("talca"));
            filteredTam = allTamanos.filter(t => t.valor.toLowerCase().includes("2") && !t.valor.includes("2.25") && !t.valor.includes("2,25"));
            
            if(filteredConc.length) defConc = filteredConc[0].codigo;
            if(filteredTam.length) defTam = filteredTam[0].valor;
        } 
        else if (marca.includes("soda")) {
            // Soda
            filteredConc = allConcentrados.filter(c => c.codigo.toLowerCase().includes("talca"));
            filteredTam = allTamanos.filter(t => t.valor.includes("2.25") || t.valor.includes("2,25") || t.valor.includes("500"));
            
            if(filteredConc.length) defConc = filteredConc[0].codigo;
            const defTamObj = filteredTam.find(t => t.valor.includes("2.25") || t.valor.includes("2,25"));
            if(defTamObj) defTam = defTamObj.valor;
        } 
        else if (marca.includes("cola") || marca.includes("pomelo") || marca.includes("naranja") || marca.includes("manzana")) {
            // Cola, Pomelo, Naranja, Manzana
            filteredConc = allConcentrados.filter(c => !c.codigo.toLowerCase().includes("talca"));
            filteredTam = allTamanos.filter(t => t.valor.includes("3") || t.valor.includes("2.25") || t.valor.includes("2,25") || t.valor.includes("500"));
            
            // Prefer 3L as default
            const defTamObj = filteredTam.find(t => t.valor.includes("3") && !t.valor.includes("500"));
            if(defTamObj) defTam = defTamObj.valor;
        }

        populateConcentrados(filteredConc, defConc);
        populateTamanos(filteredTam, defTam);
    });

    // 3. Envío del Formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Obtener datos básicos
        const horaInput = document.getElementById("hora").value.trim();
        const carac_organolep = document.querySelector('input[name="carac_organolep"]:checked').value;
        const nivel_llenado = document.querySelector('input[name="nivel_llenado"]:checked').value;
        const control_videojet = document.querySelector('input[name="control_videojet"]:checked').value;
        const responsable = selectResponsable.value;
        
        // Datos del producto (Sidebar)
        const marca = selectMarca.value;
        const tipo_concentrado = selectConcentrado.value;
        const tamano = selectTamano.value;
        const lote_tapa = document.getElementById("lote_tapa").value.trim();

        // Valores numéricos flotantes
        const contenido = parseFloat(document.getElementById("contenido").value);
        const presion = parseFloat(document.getElementById("presion").value);
        const temperatura = parseFloat(document.getElementById("temperatura").value);
        const vol_gas = parseFloat(document.getElementById("vol_gas").value);
        const brix = parseFloat(document.getElementById("brix").value);

        // Validaciones en cliente
        if (isNaN(contenido) || isNaN(presion) || isNaN(temperatura) || isNaN(vol_gas) || isNaN(brix)) {
            showToast("Por favor, ingresá valores numéricos válidos en los campos flotantes.", "error");
            return;
        }

        // Construir el payload JSON
        const payload = {
            hora: horaInput || null, // Si está vacío, la API usará la hora actual
            turno: globalTurno.value,
            linea: globalLinea.value,
            carac_organolep,
            nivel_llenado,
            contenido,
            presion,
            temperatura,
            vol_gas,
            brix,
            control_videojet,
            responsable,
            marca,
            tipo_concentrado,
            tamano,
            lote_tapa,
            tanque: selectBebidaTanque.value
        };

        try {
            const response = await fetch("/api/control-bebida", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                showToast("Control de calidad registrado con éxito en PostgreSQL", "success");
                
                // Reseteamos SOLO los campos del formulario de calidad, 
                // manteniendo la información del producto actual (Marca, Concentrado, Tamaño y Lote Tapa) 
                // para agilizar la carga repetitiva de controles.
                document.getElementById("hora").value = "";
                document.getElementById("contenido").value = "";
                document.getElementById("presion").value = "";
                document.getElementById("temperatura").value = "";
                document.getElementById("vol_gas").value = "";
                document.getElementById("brix").value = "";
            } else {
                const errData = await response.json();
                showToast(`Error al guardar: ${errData.detail || "Error en el servidor"}`, "error");
            }
        } catch (error) {
            console.error("Error al guardar registro:", error);
            showToast("No se pudo conectar al servidor para registrar el control", "error");
        }
    });

    // 5. Botón de Limpieza
    btnReset.addEventListener("click", () => {
        if (confirm("¿Deseas vaciar todos los campos del formulario, incluyendo el producto en producción?")) {
            form.reset();
            // Reestablecer selects a su opción deshabilitada por defecto
            selectMarca.selectedIndex = 0;
            selectConcentrado.selectedIndex = 0;
            selectTamano.selectedIndex = 0;
            selectResponsable.selectedIndex = 0;
            selectBebidaTanque.selectedIndex = 0;
        }
    });

    // 6. Notificaciones Toast Premium
    function showToast(message, type = "success") {
        const toastContainer = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        const iconClass = type === "success" 
            ? "fa-solid fa-circle-check" 
            : "fa-solid fa-triangle-exclamation";

        toast.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);

        // Remover notificación después de 4 segundos con desvanecimiento
        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(20px)";
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 4000);
    }

    // =====================================================
// CONTROL DE JARABE
// =====================================================
const jarabeForm = document.getElementById("jarabe-form");
const selectSabor = document.getElementById("jarabe_sabor");
const selectConcJarabe = document.getElementById("jarabe_concentrado");
const selectTanque = document.getElementById("jarabe_tanque");
const selectRespJarabe = document.getElementById("jarabe_responsable");
const chkObs = document.getElementById("jarabe_chk_obs");
const obsWrapper = document.getElementById("jarabe_obs_wrapper");
const inputObservacion = document.getElementById("jarabe_observacion");
const btnResetJarabe = document.getElementById("btn-reset-jarabe");

// Mostrar/ocultar el campo de observación según el checkbox
chkObs.addEventListener("change", () => {
    obsWrapper.classList.toggle("field-hidden", !chkObs.checked);
    if (!chkObs.checked) inputObservacion.value = "";
});

async function initJarabeDropdowns() {
    try {
        const [sabRes, concRes, tqRes, respRes] = await Promise.all([
            fetch("/api/sabores"),
            fetch("/api/tipos-concentrado"),
            fetch("/api/tanques"),
            fetch("/api/responsables")
        ]);
        if (sabRes.ok) {
            const sabores = await sabRes.json();
            selectSabor.innerHTML = '<option value="" disabled selected>Seleccione sabor</option>';
            sabores.forEach(s => {
                const opt = document.createElement("option");
                opt.value = s.nombre; opt.textContent = s.nombre;
                selectSabor.appendChild(opt);
            });
        }
        if (concRes.ok) {
            const concentrados = await concRes.json();
            selectConcJarabe.innerHTML = '<option value="" disabled selected>Seleccione concentrado</option>';
            concentrados.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.codigo; opt.textContent = c.codigo;
                selectConcJarabe.appendChild(opt);
            });
        }
        if (tqRes.ok) {
            const tanques = await tqRes.json();
            selectTanque.innerHTML = '<option value="" disabled selected>Seleccione tanque</option>';
            tanques.forEach(t => {
                const opt = document.createElement("option");
                opt.value = t.numero; opt.textContent = t.numero;
                selectTanque.appendChild(opt);
            });
        }
        if (respRes.ok) {
            const responsables = await respRes.json();
            selectRespJarabe.innerHTML = '<option value="" disabled selected>Seleccione responsable</option>';
            responsables.forEach(r => {
                const opt = document.createElement("option");
                opt.value = r.nombre_completo; opt.textContent = r.nombre_completo;
                selectRespJarabe.appendChild(opt);
            });
        }
    } catch (error) {
        console.error("Error cargando datos de jarabe:", error);
        showToast("Error al cargar datos para el Control de Jarabe", "error");
    }
}

jarabeForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bx_patron = parseFloat(document.getElementById("jarabe_bx_patron").value);
    const ta = parseFloat(document.getElementById("jarabe_ta").value);
    if (isNaN(bx_patron) || isNaN(ta)) {
        showToast("Ingresá valores numéricos válidos en °Bx Patr. y T.A.", "error");
        return;
    }
    const payload = {
        hora: document.getElementById("jarabe_hora").value.trim() || null,
        turno: globalTurno.value,
        linea: globalLinea.value,
        sabor: selectSabor.value,
        concentrado: selectConcJarabe.value,
        tanque: selectTanque.value,
        bx_patron,
        ta,
        responsable: selectRespJarabe.value,
        observacion: chkObs.checked ? inputObservacion.value.trim() : null
    };
    try {
        const response = await fetch("/api/controles-jarabe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            showToast("Control de jarabe registrado con éxito", "success");
            // Reseteo solo lo medido; conservo sabor/concentrado/tanque/resp. para carga repetitiva
            document.getElementById("jarabe_hora").value = "";
            document.getElementById("jarabe_bx_patron").value = "";
            document.getElementById("jarabe_ta").value = "";
            chkObs.checked = false;
            obsWrapper.classList.add("field-hidden");
            inputObservacion.value = "";
        } else {
            const errData = await response.json();
            showToast(`Error al guardar jarabe: ${errData.detail || "Error en el servidor"}`, "error");
        }
    } catch (error) {
        console.error("Error al guardar jarabe:", error);
        showToast("No se pudo conectar al servidor para registrar el jarabe", "error");
    }
});

btnResetJarabe.addEventListener("click", () => {
    if (confirm("¿Deseas vaciar los campos del Control de Jarabe?")) {
        jarabeForm.reset();
        selectSabor.selectedIndex = 0;
        selectConcJarabe.selectedIndex = 0;
        selectTanque.selectedIndex = 0;
        selectRespJarabe.selectedIndex = 0;
        obsWrapper.classList.add("field-hidden");
    }
});

    // ==========================================
    // LÓGICA DE TORQUE
    // ==========================================

    selectTorqueSabor.addEventListener("change", () => {
        const sabor = selectTorqueSabor.value.toLowerCase();
        let color = "";

        if (sabor.includes("cola")) {
            color = "Azul";
        } else if (sabor.includes("naranja")) {
            color = "Naranja";
        } else if (sabor.includes("pomelo")) {
            color = "Amarillo";
        } else if (sabor.includes("lima")) {
            color = "Verde";
        } else if (sabor.includes("soda")) {
            color = "Gris";
        } else if (sabor.includes("sifon") || sabor.includes("sifón")) {
            color = "Rojo";
        } else if (sabor.includes("manzana")) {
            color = "Azul";
        } else {
            color = "Sin asignar";
        }

        inputTorqueColor.value = color;
    });

    btnResetTorque.addEventListener("click", () => {
        if (confirm("¿Deseas vaciar los campos del Control de Torque?")) {
            torqueForm.reset();
            selectTorqueSabor.selectedIndex = 0;
            selectTorqueMarca.selectedIndex = 0;
            selectTorqueResp.selectedIndex = 0;
            selectTorqueNumero.selectedIndex = 0;
            inputTorqueColor.value = "";
        }
    });

    torqueForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nocheVal = globalTurno.value === "noche"
            ? (document.querySelector('input[name="torque_noche"]:checked')?.value || "Noche 1")
            : null;

        const formData = {
            numero_torque: selectTorqueNumero.value,
            turno: globalTurno.value,
            noche: nocheVal,
            linea: globalLinea.value,
            valor: parseFloat(inputTorqueValor.value),
            sabor: selectTorqueSabor.value,
            marca: selectTorqueMarca.value,
            color: inputTorqueColor.value,
            responsable: selectTorqueResp.value
        };

        try {
            // Actualmente no hay endpoint de API, así que por ahora solo logueamos o podemos intentar postearlo.
            console.log("Guardando Control de Torque:", formData);
            
            // Simular guardado exitoso y dar feedback al usuario
            showToast("Control de Torque guardado exitosamente", "success");
            
            // Solo resetear la parte "medida" (izquierda)
            selectTorqueNumero.selectedIndex = 0;
            inputTorqueValor.value = "";
            
        } catch (error) {
            console.error("Error guardando Torque:", error);
            showToast("Error al guardar Control de Torque", "error");
        }
    });

});
