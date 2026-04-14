# Estructura de Archivos CSS

## Organización de estilos

Este proyecto organiza los estilos CSS en múltiples archivos para mejor mantenibilidad:

### 📄 `reset.css`

- Resetea los estilos por defecto del navegador
- Proporciona una base consistente para todos los navegadores
- Define tipografías base y márgenes por defecto

### 📄 `styles.css` (Archivo Principal)

Contiene la mayoría de los estilos del sitio, organizado en secciones:

#### Variables CSS (línea 1-11)

```css
--color-primary: #1a4d2e      /* Verde oscuro elegante */
--color-secondary: #4f7942    /* Verde medio */
--color-accent: #d4a574       /* Dorado/beige */
--color-white: #ffffff
--color-light: #f8f9fa
--color-dark: #2c3e50
--color-text: #333
--transition: all 0.3s ease
```

#### Secciones principales

1. **Iconos Font Awesome** - Estilos para iconos con efectos hover
2. **Header y Navegación** - Título del hotel y menú
3. **Secciones Hero** - Imagen de portada y bienvenida
4. **Componentes generales** - Botones, tarjetas, grids
5. **Pie de página** - Footer y redes sociales
6. **Estilos responsivos** - Media queries para móvil/tablet

### 📄 `responsive.css`

- Contiene todos los breakpoints y media queries
- Adaptación para tablets (máx. 1024px)
- Adaptación para móviles (máx. 768px y 480px)

### 📄 `habitaciones.css`

- Estilos específicos para la página de habitaciones
- Grid de tarjetas compactas (4 columnas escritorio)
- Estilos responsivos para habitaciones
- Botones de reserva

### 📄 `reservaciones.css`

- Estilos específicos para formulario de reservaciones
- Estilos de inputs y selects
- Validación visual de formularios

## Pautas de Mantenimiento

### Para agregar nuevos estilos

1. Si es un estilo global o de componente principal → **styles.css**
2. Si es específico de una página → archivo CSS aparte (ej: `habitaciones.css`)
3. Si son ajustes responsivos → considerar en el mismo archivo o en secciones @media

### Naming conventions

- Usar **kebab-case** para clases: `.btn-reservar`, `.habitacion-card`
- Variables en mayúscula: `--color-primary`
- IDs para secciones principales: `#lista-habitaciones`, `#planta-baja`

### Colores principales del sitio

```text
Verde Primario:    #1a4d2e
Verde Secundario:  #4f7942
Dorado/Accent:     #d4a574
Blanco:            #ffffff
Gris Claro:        #f8f9fa
Gris Oscuro:       #2c3e50
```

## Estructura de carpetas CSS

```text
css/
├── reset.css         (Reseteo de estilos base)
├── styles.css        (Estilos principales y globales)
├── responsive.css    (Media queries y responsivos)
├── habitaciones.css  (Página de habitaciones)
└── reservaciones.css (Página de reservaciones)
```
