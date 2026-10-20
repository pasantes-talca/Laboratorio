export const PREVIEW_CATALOG = [
  {
    "id": "calidad-bebida",
    "module": "calidad",
    "module_label": "Control de Calidad",
    "label": "Bebida terminada",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "marca",
        "label": "Producto",
        "type": "text",
        "required": false,
        "readonly": true,
        "max_length": 100,
        "options": null
      },
      {
        "key": "concentrado",
        "label": "Concentrado",
        "type": "text",
        "required": false,
        "readonly": true,
        "max_length": 50,
        "options": null
      },
      {
        "key": "tamano",
        "label": "Tama\u00f1o",
        "type": "text",
        "required": false,
        "readonly": true,
        "max_length": 50,
        "options": null
      },
      {
        "key": "responsable",
        "label": "Responsable del control",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 100,
        "options": null
      },
      {
        "key": "tanque",
        "label": "Tanque",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "linea",
        "label": "L\u00ednea",
        "type": "integer",
        "required": false,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "turno",
        "label": "Turno",
        "type": "text",
        "required": false,
        "readonly": true,
        "max_length": 20,
        "options": null
      },
      {
        "key": "fecha",
        "label": "Fecha del control",
        "type": "date",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora",
        "label": "Hora",
        "type": "time",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "carac_organolep",
        "label": "Caracter\u00edsticas organol\u00e9pticas",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 50,
        "options": [
          "OK",
          "NOK"
        ]
      },
      {
        "key": "nivel_llenado",
        "label": "Nivel de llenado",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 50,
        "options": [
          "OK",
          "NOK"
        ]
      },
      {
        "key": "contenido",
        "label": "Contenido",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "presion",
        "label": "Presi\u00f3n",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "temperatura",
        "label": "Temperatura (\u00b0C)",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "vol_gas",
        "label": "Volumen de gas",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "grados_brix",
        "label": "Brix",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "lote_tapa",
        "label": "Lote de tapa",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 50,
        "options": null
      },
      {
        "key": "control_video_jet",
        "label": "Control Videojet",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 50,
        "options": [
          "OK",
          "NOK"
        ]
      }
    ],
    "columns": [
      "fecha",
      "hora",
      "linea",
      "marca",
      "tanque"
    ]
  },
  {
    "id": "calidad-jarabe",
    "module": "calidad",
    "module_label": "Control de Calidad",
    "label": "Control de jarabe",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "turno",
        "label": "Turno",
        "type": "text",
        "required": false,
        "readonly": true,
        "max_length": 20,
        "options": null
      },
      {
        "key": "fecha",
        "label": "Fecha del control",
        "type": "date",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora",
        "label": "Hora",
        "type": "time",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "sabor",
        "label": "Sabor / marca",
        "type": "text",
        "required": true,
        "readonly": true,
        "max_length": 100,
        "options": null
      },
      {
        "key": "concentrado",
        "label": "Concentrado",
        "type": "text",
        "required": true,
        "readonly": true,
        "max_length": 50,
        "options": null
      },
      {
        "key": "tanque",
        "label": "Tanque",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "grados_brix_patron",
        "label": "Brix patr\u00f3n",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "t_a",
        "label": "Acidez titulable",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "responsable",
        "label": "Responsable del control",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 100,
        "options": null
      },
      {
        "key": "observacion",
        "label": "Observaciones",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "numero_carga_trilay",
        "label": "N\u00famero de carga Trilay",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 100,
        "options": null
      }
    ],
    "columns": [
      "fecha",
      "hora",
      "sabor",
      "tanque",
      "responsable"
    ]
  },
  {
    "id": "calidad-torque",
    "module": "calidad",
    "module_label": "Control de Calidad",
    "label": "Control de torque",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha",
        "label": "Fecha del control",
        "type": "date",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora",
        "label": "Hora",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "turno",
        "label": "Turno",
        "type": "text",
        "required": false,
        "readonly": true,
        "max_length": 20,
        "options": null
      },
      {
        "key": "linea",
        "label": "L\u00ednea",
        "type": "integer",
        "required": false,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "numero_cabezal",
        "label": "N\u00famero de cabezal",
        "type": "integer",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "sabor",
        "label": "Sabor / marca",
        "type": "text",
        "required": false,
        "readonly": true,
        "max_length": 50,
        "options": null
      },
      {
        "key": "color",
        "label": "Color de tapa",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 50,
        "options": null
      },
      {
        "key": "marca_tapa",
        "label": "Marca de tapa",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "valor",
        "label": "Torque (Lbs.In)",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "responsable",
        "label": "Responsable del control",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 100,
        "options": null
      }
    ],
    "columns": [
      "fecha",
      "hora",
      "linea",
      "sabor",
      "numero_cabezal"
    ]
  },
  {
    "id": "calidad-pausas",
    "module": "calidad",
    "module_label": "Control de Calidad",
    "label": "Pausas de l\u00ednea",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha",
        "label": "Fecha del control",
        "type": "date",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora",
        "label": "Hora",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "turno",
        "label": "Turno",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "linea",
        "label": "L\u00ednea",
        "type": "integer",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "motivo",
        "label": "Motivo de la pausa",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 100,
        "options": null
      },
      {
        "key": "responsable",
        "label": "Responsable del control",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 100,
        "options": null
      },
      {
        "key": "observacion",
        "label": "Observaciones",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      }
    ],
    "columns": [
      "fecha",
      "hora",
      "linea",
      "responsable"
    ]
  },
  {
    "id": "jarabe-simple",
    "module": "jarabe",
    "module_label": "Sala de Jarabe",
    "label": "Jarabe simple",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha",
        "label": "Fecha del control",
        "type": "date",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora",
        "label": "Hora",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "tanque",
        "label": "Tanque",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "volcado_numero",
        "label": "N\u00famero de volcado",
        "type": "integer",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cantidad_bolsas",
        "label": "Cantidad de bolsas",
        "type": "integer",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "azucar_tipo",
        "label": "Tipo de az\u00facar",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 50,
        "options": null
      },
      {
        "key": "azucar_marca",
        "label": "Marcas de az\u00facar",
        "type": "list",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "azucar_ntu",
        "label": "Turbidez (NTU)",
        "type": "list",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "aux_standard",
        "label": "Auxiliar Standard (kg)",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "aux_hyflo",
        "label": "Auxiliar Hyflo (kg)",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "pasteurizado_desde",
        "label": "Pasteurizado desde",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "pasteurizado_hasta",
        "label": "Pasteurizado hasta",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "pasteurizado_temp",
        "label": "Temperatura de pasteurizado (\u00b0C)",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "responsables",
        "label": "Responsables del control",
        "type": "list",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      }
    ],
    "columns": [
      "fecha",
      "hora",
      "tanque",
      "responsables"
    ]
  },
  {
    "id": "jarabe-terminado",
    "module": "jarabe",
    "module_label": "Sala de Jarabe",
    "label": "Jarabe terminado",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha",
        "label": "Fecha del control",
        "type": "date",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "sabor",
        "label": "Sabor / marca",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 100,
        "options": null
      },
      {
        "key": "concentrado",
        "label": "Concentrado",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 50,
        "options": null
      },
      {
        "key": "tanque",
        "label": "Tanque",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "unidades",
        "label": "Unidades / cargas",
        "type": "integer",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "volcado_numero",
        "label": "N\u00famero de volcado",
        "type": "list",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "tiempo_filtrado",
        "label": "Tiempo de filtrado",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 50,
        "options": null
      },
      {
        "key": "be_jarabe_simple",
        "label": "Brix del jarabe simple",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "vol_jarabe_simple",
        "label": "Volumen de jarabe simple (L)",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "lts_jarabe_terminado",
        "label": "Jarabe terminado (L)",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "responsables",
        "label": "Responsables del control",
        "type": "list",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      }
    ],
    "columns": [
      "fecha",
      "sabor",
      "tanque",
      "responsables"
    ]
  },
  {
    "id": "jarabe-saneo",
    "module": "jarabe",
    "module_label": "Sala de Jarabe",
    "label": "Saneo de tanques",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha",
        "label": "Fecha del control",
        "type": "date",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora_inicio",
        "label": "Hora de inicio",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora_fin",
        "label": "Hora de finalizaci\u00f3n",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "tanque",
        "label": "Tanque",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "producto",
        "label": "Producto de saneo",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 255,
        "options": null
      },
      {
        "key": "responsables",
        "label": "Responsables del control",
        "type": "list",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "numero_saneo",
        "label": "N\u00famero de saneo",
        "type": "integer",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      }
    ],
    "columns": [
      "fecha",
      "tanque",
      "responsables"
    ]
  },
  {
    "id": "jarabe-parte",
    "module": "jarabe",
    "module_label": "Sala de Jarabe",
    "label": "Parte de jarabe",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha",
        "label": "Fecha del control",
        "type": "date",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "turno",
        "label": "Turno",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "tanque",
        "label": "Tanque",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "sabor",
        "label": "Sabor / marca",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 100,
        "options": null
      },
      {
        "key": "numero_carga_trilay",
        "label": "N\u00famero de carga Trilay",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 100,
        "options": null
      },
      {
        "key": "responsables",
        "label": "Responsables del control",
        "type": "list",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "azucar",
        "label": "Azucar",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "sucralosa",
        "label": "Sucralosa",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "reforzado_citrico",
        "label": "Reforzado citrico",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "acesulfame_k",
        "label": "Acesulfame k",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "benzoato_sodio",
        "label": "Benzoato sodio",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "sorbato_potasio",
        "label": "Sorbato potasio",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "citrato_sodio",
        "label": "Citrato sodio",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "acido_citrico",
        "label": "Acido citrico",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "acido_fosforico",
        "label": "Acido fosforico",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "acido_ascorbico",
        "label": "Acido ascorbico",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cafeina",
        "label": "Cafeina",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "colorante_caramelo",
        "label": "Colorante caramelo",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      }
    ],
    "columns": [
      "fecha",
      "sabor",
      "tanque",
      "responsables"
    ]
  },
  {
    "id": "agua-fisico-quimico",
    "module": "agua",
    "module_label": "Control de Agua",
    "label": "Control f\u00edsico qu\u00edmico",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha_registro",
        "label": "Fecha de registro",
        "type": "datetime",
        "required": false,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "tipo_agua",
        "label": "Tipo de agua",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 50,
        "options": null
      },
      {
        "key": "fecha",
        "label": "Fecha del control",
        "type": "date",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora",
        "label": "Hora",
        "type": "time",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "k",
        "label": "K",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "dureza",
        "label": "Dureza",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cloruros",
        "label": "Cloruros",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "sulfatos",
        "label": "Sulfatos",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "alcalinidad",
        "label": "Alcalinidad",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cloro_libre",
        "label": "Cloro libre",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "ph",
        "label": "pH",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "responsable",
        "label": "Responsable del control",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 100,
        "options": null
      }
    ],
    "columns": [
      "fecha",
      "fecha_registro",
      "hora",
      "tipo_agua",
      "responsable"
    ]
  },
  {
    "id": "agua-cloro",
    "module": "agua",
    "module_label": "Control de Agua",
    "label": "An\u00e1lisis de cloro",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha_registro",
        "label": "Fecha de registro",
        "type": "datetime",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora",
        "label": "Hora",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "tanque_agua_osmosis",
        "label": "Tanque de agua de \u00f3smosis (ppm)",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "filtro_carbon_a",
        "label": "Filtro de carb\u00f3n A",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": [
          "Cumple",
          "No Cumple"
        ]
      },
      {
        "key": "filtro_carbon_b",
        "label": "Filtro de carb\u00f3n B",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": [
          "Cumple",
          "No Cumple"
        ]
      },
      {
        "key": "filtro_carbon_c",
        "label": "Filtro de carb\u00f3n C",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": [
          "Cumple",
          "No Cumple"
        ]
      },
      {
        "key": "contralavado_tanque_a",
        "label": "Hora de contralavado A",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "contralavado_tanque_b",
        "label": "Hora de contralavado B",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cloro_riser_linea",
        "label": "L\u00ednea del rinser",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": [
          "Linea 1",
          "Linea 2"
        ]
      },
      {
        "key": "cloro_riser_resultado",
        "label": "Cloro rinser (ppm)",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "acondicionamiento_rinser",
        "label": "Presi\u00f3n del rinser",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "responsable",
        "label": "Responsable del control",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 100,
        "options": null
      }
    ],
    "columns": [
      "fecha_registro",
      "hora",
      "cloro_riser_resultado",
      "responsable"
    ]
  },
  {
    "id": "agua-osmosis",
    "module": "agua",
    "module_label": "Control de Agua",
    "label": "\u00d3smosis inversa",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha_registro",
        "label": "Fecha de registro",
        "type": "datetime",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora",
        "label": "Hora",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "k",
        "label": "Conductividad",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "h",
        "label": "H",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "q_perm",
        "label": "Caudal permeado",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "q_mezcla",
        "label": "Caudal de mezcla",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "q_rechazo",
        "label": "Caudal de rechazo",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "p_select",
        "label": "Punto de presi\u00f3n",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 10,
        "options": null
      },
      {
        "key": "p_valor",
        "label": "Valor de presi\u00f3n",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      }
    ],
    "columns": [
      "fecha_registro",
      "hora"
    ]
  },
  {
    "id": "agua-filtro-arena",
    "module": "agua",
    "module_label": "Control de Agua",
    "label": "Filtro de arena",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha_registro",
        "label": "Fecha de registro",
        "type": "datetime",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "hora",
        "label": "Hora",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "presion_interno",
        "label": "Presi\u00f3n interna",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "presion_externo",
        "label": "Presi\u00f3n externa",
        "type": "number",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha_contralavado",
        "label": "Fecha de contralavado",
        "type": "date",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      }
    ],
    "columns": [
      "fecha_registro",
      "hora"
    ]
  },
  {
    "id": "saneado-control",
    "module": "saneado",
    "module_label": "Saneado",
    "label": "Control de saneado",
    "fields": [
      {
        "key": "id",
        "label": "ID",
        "type": "integer",
        "required": true,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "fecha_registro",
        "label": "Fecha de registro",
        "type": "datetime",
        "required": false,
        "readonly": true,
        "max_length": null,
        "options": null
      },
      {
        "key": "linea",
        "label": "L\u00ednea",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": null
      },
      {
        "key": "post_mantenimiento",
        "label": "Despu\u00e9s de mantenimiento",
        "type": "boolean",
        "required": true,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "tipo_limpieza",
        "label": "Tipo de limpieza",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 20,
        "options": [
          "COP",
          "CIP"
        ]
      },
      {
        "key": "responsable",
        "label": "Responsable del control",
        "type": "text",
        "required": true,
        "readonly": false,
        "max_length": 100,
        "options": null
      },
      {
        "key": "cop_quimico",
        "label": "Qu\u00edmico COP",
        "type": "text",
        "required": false,
        "readonly": false,
        "max_length": 100,
        "options": null
      },
      {
        "key": "cop_hora_inicio",
        "label": "Inicio COP",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cop_hora_fin",
        "label": "Fin COP",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_sanitizante_temp",
        "label": "CIP \u00b7 sanitizante temperatura (\u00b0C)",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_sanitizante_inicio",
        "label": "CIP \u00b7 sanitizante inicio",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_sanitizante_fin",
        "label": "CIP \u00b7 sanitizante fin",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_desinfectante_temp",
        "label": "CIP \u00b7 desinfectante temperatura (\u00b0C)",
        "type": "number",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_desinfectante_inicio",
        "label": "CIP \u00b7 desinfectante inicio",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_desinfectante_fin",
        "label": "CIP \u00b7 desinfectante fin",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_enjuague_sanitizante_inicio",
        "label": "CIP \u00b7 enjuague sanitizante inicio",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_enjuague_sanitizante_fin",
        "label": "CIP \u00b7 enjuague sanitizante fin",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_enjuague_desinfectante_inicio",
        "label": "CIP \u00b7 enjuague desinfectante inicio",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      },
      {
        "key": "cip_enjuague_desinfectante_fin",
        "label": "CIP \u00b7 enjuague desinfectante fin",
        "type": "time",
        "required": false,
        "readonly": false,
        "max_length": null,
        "options": null
      }
    ],
    "columns": [
      "fecha_registro",
      "linea",
      "responsable"
    ]
  }
];
