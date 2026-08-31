from html.parser import HTMLParser


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self.current_table = []
        self.current_row = []
        self.current_cell = []
        self.in_cell = False

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.current_table = []
        elif tag == "tr":
            self.current_row = []
        elif tag in ("td", "th"):
            self.in_cell = True
            self.current_cell = []

    def handle_endtag(self, tag):
        if tag == "table":
            if self.current_table:
                self.tables.append(self.current_table)
        elif tag == "tr":
            if self.current_row:
                self.current_table.append(self.current_row)
        elif tag in ("td", "th"):
            self.in_cell = False
            self.current_row.append(" ".join(self.current_cell).strip())

    def handle_data(self, data):
        if self.in_cell:
            text = data.strip()
            if text:
                self.current_cell.append(text)


def extraer_datos_reporte(ruta_o_contenido, es_ruta=True):
    if es_ruta:
        with open(ruta_o_contenido, "r", encoding="utf-8", errors="ignore") as f:
            html_content = f.read()
    else:
        html_content = (
            ruta_o_contenido
            if isinstance(ruta_o_contenido, str)
            else ruta_o_contenido.decode("utf-8", errors="ignore")
        )

    parser = TableParser()
    parser.feed(html_content)

    if len(parser.tables) < 4:
        raise ValueError("El archivo no contiene el formato esperado de reporte de trazabilidad.")

    tabla_detalles = parser.tables[1]
    tabla_cabecera = parser.tables[2]
    tabla_ingredientes = parser.tables[3]

    def buscar_en_tabla_clave_valor(tabla, clave):
        for fila in tabla:
            if len(fila) >= 2 and fila[0].lower().strip() == clave.lower().strip():
                return fila[1].strip()
        return None

    def buscar_ingrediente(nombre_busqueda):
        # tabla_ingredientes fila 0: ['Tipo', 'Componente', 'Clase', 'Cant.', 'UM', 'Lote']
        for fila in tabla_ingredientes[1:]:
            if len(fila) >= 4:
                componente = fila[1].lower()
                if nombre_busqueda.lower() in componente:
                    try:
                        cant_str = fila[3].replace(",", ".")
                        return float(cant_str)
                    except ValueError:
                        return fila[3]
        return 0.0

    sabor = buscar_en_tabla_clave_valor(tabla_cabecera, "Nombre") or buscar_en_tabla_clave_valor(tabla_detalles, "Nombre")
    unidades = buscar_en_tabla_clave_valor(tabla_cabecera, "Cantidad")
    tanque = buscar_en_tabla_clave_valor(tabla_detalles, "Camara")
    fecha = buscar_en_tabla_clave_valor(tabla_cabecera, "Fecha")

    # Convertir fecha DD/MM/YYYY a YYYY-MM-DD para input date si aplica
    fecha_iso = fecha
    if fecha and "/" in fecha:
        partes = fecha.split("/")
        if len(partes) == 3:
            d, m, y = partes
            fecha_iso = f"{y.zfill(4)}-{m.zfill(2)}-{d.zfill(2)}"

    datos_extraidos = {
        "fecha": fecha_iso,
        "fecha_original": fecha,
        "tanque": tanque,
        "sabor": sabor,
        "unidades": unidades,
        "azucar": buscar_ingrediente("azucar"),
        "acido_citrico": buscar_ingrediente("acido citrico") or buscar_ingrediente("ácido cítrico"),
        "benzoato_sodio": buscar_ingrediente("benzoato de sodio") or buscar_ingrediente("benzoato"),
        "sorbato_potasio": buscar_ingrediente("sorbato de potasio") or buscar_ingrediente("sorbato"),
        "sucralosa": buscar_ingrediente("sucralosa"),
        "acesulfame_k": buscar_ingrediente("acesulfame"),
        "citrato_sodio": buscar_ingrediente("citrato de sodio") or buscar_ingrediente("citrato"),
        "colorante_caramelo": buscar_ingrediente("colorante caramelo") or buscar_ingrediente("caramelo"),
        "acido_fosforico": buscar_ingrediente("acido fosforico") or buscar_ingrediente("ácido fosfórico"),
        "cafeina": buscar_ingrediente("cafeina") or buscar_ingrediente("cafeína"),
        "acido_ascorbico": buscar_ingrediente("acido ascorbico") or buscar_ingrediente("ácido ascórbico"),
    }

    return datos_extraidos
