# Sistema de Diseño: Laboratorio de Calidad Talca

**Versión:** 1.2.0
**Estado:** Activo
**Última actualización:** Septiembre 2026

**Propósito:** Establecer los lineamientos visuales, técnicos y de experiencia de usuario para la plataforma web del Laboratorio de Calidad Talca, garantizando coherencia, accesibilidad y una identidad alineada con la marca, basada en la combinación estratégica de Rojo, Blanco, Negro, Azul y Azul Marino.

## 1. Fundamentos de Marca

### 1.1 Principios de Diseño
- **Precisión Científica:** La claridad en la presentación de datos y resultados es innegociable.
- **Confianza y Seguridad:** El diseño debe transmitir profesionalismo, higiene y rigor técnico.
- **Accesibilidad Universal:** La información médica debe ser comprensible para todos los usuarios.
- **Eficiencia:** Flujos de usuario optimizados para la búsqueda de resultados y agendamiento.

### 1.2 Identidad Visual y Combinación de Colores
La identidad se basa en el logo corporativo de Talca. La combinación de los 5 colores clave se rige por la regla **60-30-10** para mantener el equilibrio visual:
- **60% Blanco:** Fondos principales, espacios en blanco, limpieza clínica.
- **30% Azul Marino y Negro:** Textos, encabezados, footers y estructuras de navegación (autoridad y legibilidad).
- **10% Rojo y Azul:** Llamados a la acción (CTAs), acentos, iconos interactivos y estados (energía y guía visual).

## 2. Paleta de Colores

### 2.1 Colores Primarios (Marca y Energía)
| Nombre | Hex | RGB | Uso Principal |
| --- | --- | --- | --- |
| **Rojo Talca** | `#E31B23` | 227, 27, 35 | Botones primarios, Logo, Acentos fuertes, CTAs. |
| **Blanco Puro** | `#FFFFFF` | 255, 255, 255 | Fondos principales, texto sobre fondos oscuros, tarjetas. |

### 2.2 Colores Secundarios (Confianza y Profundidad)
| Nombre | Hex | RGB | Uso Principal |
| --- | --- | --- | --- |
| **Azul Marino** | `#0F2C45` | 15, 44, 69 | Headers, Footer, títulos principales, fondos de secciones de autoridad. |
| **Azul Institucional** | `#1E4E8C` | 30, 78, 140 | Gráficos de evolución, sellos de certificación, acentos secundarios. |
| **Azul Clínico** | `#0077B6` | 0, 119, 182 | Enlaces (links), iconos, estados de foco (focus), elementos interactivos. |

### 2.3 Colores Neutros (Legibilidad y Estructura)
| Nombre | Hex | Uso Principal |
| --- | --- | --- |
| **Negro** | `#000000` | Texto de máximo contraste, títulos críticos, bordes de alto impacto. |
| Gris 900 | `#1A202C` | Texto principal del cuerpo (Body), preferible al negro puro para reducir fatiga visual en lectura larga. |
| Gris 700 | `#4A5568` | Texto secundario, descripciones, labels de formularios. |
| Gris 300 | `#E2E8F0` | Bordes de inputs, separadores, líneas de tablas. |
| Gris 100 | `#F7FAFC` | Fondos de página alternos, filas zebra en tablas. |

### 2.4 Colores Semánticos (Estados y Resultados)
| Nombre | Hex | Uso Principal |
| --- | --- | --- |
| Éxito / Normal | `#2F855A` | Valores dentro del rango normal, confirmaciones. |
| Alerta / Límite | `#D69E2E` | Valores en límite superior/inferior, advertencias. |
| Error / Crítico | `#E53E3E` | Valores fuera de rango, errores de sistema, invalidación. |

## 3. Tipografía

### 3.1 Familias Tipográficas
- **Títulos (Headings):** `Poppins` (Sans-serif geométrica, amigable, alineada con las curvas del logo).
- **Cuerpo y Datos (Body & UI):** `Inter` (Sans-serif altamente legible, optimizada para pantallas y tablas de datos).

### 3.2 Escala Tipográfica (Base 16px)
| Nivel | Familia | Tamaño (px) | Peso | Interlineado | Uso |
| --- | --- | --- | --- | --- | --- |
| H1 | Poppins | 40px | 700 (Bold) | 1.2 | Títulos de página, Hero sections. |
| H2 | Poppins | 32px | 600 (SemiBold) | 1.25 | Títulos de sección. |
| H3 | Poppins | 24px | 600 (SemiBold) | 1.3 | Títulos de tarjetas, Subsecciones. |
| Body | Inter | 16px | 400 (Regular) | 1.5 | Texto base de la interfaz (en Gris 900 o Negro). |
| Caption | Inter | 12px | 500 (Medium) | 1.4 | Labels de formularios, Footnotes. |

## 4. Espaciado, Grid y Layout

### 4.1 Sistema de Espaciado (Base 8px)
Todo margen y padding debe ser múltiplo de 4px, preferiblemente de 8px.
- `sp-2`: 8px (Padding de botones pequeños, gaps)
- `sp-4`: 16px (Padding estándar de tarjetas, márgenes base)
- `sp-6`: 24px (Separación entre elementos relacionados)
- `sp-8`: 32px (Separación entre secciones)

### 4.2 Sistema de Grid
- **Contenedor máximo:** `1280px` (centrado).
- **Columnas:** 12 (Desktop), 8 (Tablet), 4 (Mobile).
- **Gutter:** 24px (Desktop/Tablet), 16px (Mobile).

## 5. Bordes, Sombras y Elevación

### 5.1 Border Radius
- **Pequeño (sm):** `4px` (Inputs, botones pequeños, badges).
- **Mediano (md):** `8px` (Botones estándar, tarjetas, modales).
- **Píldora (full):** `9999px` (Tags, botones de acción flotante).

### 5.2 Sombras (Elevación)
Las sombras deben ser sutiles, usando el **Azul Marino** como base con baja opacidad para mantener la sensación de limpieza clínica.
- **Sutil:** `0 1px 3px rgba(15, 44, 69, 0.08)` (Tarjetas en reposo, Inputs).
- **Medio:** `0 4px 6px rgba(15, 44, 69, 0.1)` (Tarjetas en hover, Dropdowns).

## 6. Componentes de Interfaz (UI)

### 6.1 Botones
- **Botón Primario:** Fondo `Rojo Talca (#E31B23)`, Texto `Blanco (#FFFFFF)`, Hover `Rojo Oscuro (#B31219)`.
- **Botón Secundario:** Borde `2px solid Azul Clínico (#0077B6)`, Texto `Azul Clínico`, Hover: Fondo `Azul Clínico`, Texto `Blanco`.
- **Botón Fantasma (Ghost):** Texto `Negro (#000000)` o `Gris 900`, Hover: Fondo `Gris 100`.

### 6.2 Formularios (Inputs)
- **Altura:** `44px` (Mínimo para accesibilidad táctil).
- **Borde:** `1px solid Gris 300 (#E2E8F0)`.
- **Estado Focus:** Borde `Azul Clínico (#0077B6)`, `box-shadow: 0 0 0 3px rgba(0, 119, 182, 0.2)`.
- **Estado Error:** Borde `Error (#E53E3E)`, texto de ayuda en rojo.

### 6.3 Tablas de Datos (Resultados de Laboratorio)
- **Header:** Fondo `Azul Marino (#0F2C45)`, Texto `Blanco (#FFFFFF)`, Peso `600`. *(Cambio estratégico para mayor contraste y elegancia)*.
- **Filas:** Altura mínima `56px`. Borde inferior `1px solid Gris 300`.
- **Filas alternas (Zebra):** Fondo `Gris 100 (#F7FAFC)`.

## 7. Accesibilidad (A11y)
El Laboratorio de Calidad Talca se compromete con los estándares WCAG 2.1 Nivel AA.
- **Contraste:** El **Negro** y el **Azul Marino** sobre **Blanco** superan ampliamente el ratio 4.5:1 (llegando a 21:1 y 12.5:1 respectivamente), garantizando legibilidad perfecta.
- **Foco Visible:** Anillo de foco de `3px` en `Azul Clínico` para navegación por teclado.
- **Áreas Táctiles:** Mínimo `44x44px` en dispositivos móviles.

## 8. Variables CSS (Implementación)

```css
:root {
   /* --- Colores Primarios --- */
   --color-rojo: #E31B23;
   --color-rojo-hover: #B31219;
   --color-blanco: #FFFFFF;

   /* --- Colores Secundarios (Azules) --- */
   --color-azul-marino: #0F2C45;
   --color-azul-institucional: #1E4E8C;
   --color-azul-clinico: #0077B6;
   --color-azul-hielo: #E8F4F8;

   /* --- Colores Neutros --- */
   --color-negro: #000000;
   --color-gris-900: #1A202C;
   --color-gris-700: #4A5568;
   --color-gris-300: #E2E8F0;
   --color-gris-100: #F7FAFC;

   /* --- Colores Semánticos --- */
   --color-exito: #2F855A;
   --color-alerta: #D69E2E;
   --color-error: #E53E3E;

   /* --- Tipografía --- */
   --font-heading: 'Poppins', sans-serif;
   --font-body: 'Inter', sans-serif;

   /* --- Espaciado --- */
   --space-2: 0.5rem;  /* 8px */
   --space-4: 1rem;    /* 16px */
   --space-6: 1.5rem;  /* 24px */
   --space-8: 2rem;    /* 32px */

   /* --- Bordes y Sombras --- */
   --radius-md: 8px;
   --radius-full: 9999px;
   --shadow-sm: 0 1px 3px rgba(15, 44, 69, 0.08);
   --shadow-md: 0 4px 6px rgba(15, 44, 69, 0.1);
}

9. Patrones de Diseño (Layouts)
9.1 Header / Navegación Principal
Fondo: Blanco (#FFFFFF) con sombra sutil.
Logo: Alineado a la izquierda.
Menú: Enlaces en Negro (#000000) o Gris 900, hover en Rojo Talca.
CTA: Botón "Portal de Pacientes" en Rojo Talca.
9.2 Footer
Fondo: Azul Marino (#0F2C45).
Texto: Blanco (#FFFFFF) para títulos y Azul Hielo (#E8F4F8) para enlaces secundarios.
Contenido: Logo en versión blanca, enlaces rápidos, certificaciones de calidad (ISO).
9.3 Dashboard de Resultados (Paciente)
Sidebar: Fondo Gris 100, ítems de menú en Gris 700, ítem activo con borde izquierdo en Rojo Talca y texto en Azul Marino.
Gráficos: Línea de evolución en Azul Institucional (#1E4E8C) sobre fondo Blanco, con zona de rango normal sombreada en verde claro.
10. Guía de Contenido y Tono de Voz
Tono: Profesional, empático, claro y tranquilizador.
Microcopy de Éxito: "Sus resultados están listos para ser descargados."
Microcopy de Error: "No pudimos procesar su solicitud. Por favor, verifique los datos e intente nuevamente."