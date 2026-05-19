<h1 align="center"> 🏨 Hotel Quinta Dalam - Vive la Magia de Michoacán</h1>

<p align="center">
  <img src="public/images/Hotel_icono.png" alt="Hotel Quinta Dalam Logo" width="150">
</p>

---

## 🌟 Propósito


El **Hotel Quinta Dalam** es una propuesta web moderna y responsiva diseñada para capturar la esencia cultural de los Pueblos Mágicos de Michoacán. Este proyecto busca proporcionar una experiencia de usuario fluida, cumpliendo con los requerimientos académicos de la materia de **Programación Web** y apuntando a ser un espacio de desarrollo para un entorno profesional.

Actualmente, el proyecto ha escalado y ha sido migrado al poderoso ecosistema de **Astro**, permitiendo una mayor modularidad de componentes, mejor experiencia de desarrollo y un rendimiento inigualable.


---

## 🚀 Características Principales

- **🎨 Experiencia Temática**: 15 habitaciones inspiradas en la riqueza de Michoacán.
- **📱 Diseño Responsive**: Optimizado para dispositivos móviles y escritorio.
- **💬 Interacción Directa**: Integración con redes sociales y reserva vía WhatsApp.
- **⚡ Rendimiento Ultra Rápido**: Gracias a la arquitectura de **Astro**, el sitio comprime y sirve código HTML optimizado.
- **🧱 Modularidad**: Uso de componentes reutilizables como Layouts, Headers y Footers.


---

## 🛠️ Stack de Desarrollo

### Lenguajes y Herramientas Base

| Tecnología          | Rol                                             | Estado |
| :------------------ | :---------------------------------------------- | :----: |
| **Astro 6.x**       | Framework principal (Componentes, Enrutamiento) |   ✅   |
| **HTML5**           | Estructura semántica aplicada (SEO, Metadatos)  |   ✅   |
| **CSS3 / Tailwind** | Estilado dinámico y utilidad moderna            |   ✅   |
| **FontAwesome**     | Iconografía premium para la interfaz            |   ✅   |
| **Git**             | Control de versiones (Ramas y colaboración)     |   ✅   |

### Tecnologías en Transición / Futuras

| Tecnología                | Objetivo                                 | Estado |
| :------------------------ | :--------------------------------------- | :----: |
| **JavaScript/TypeScript** | Lógica de reservaciones y comprobaciones |   🏗️   |
| **Supabase**              | Integración de Backend PostgreSQL        |   🏗️   |

---

## 🧠 Arquitectura Central: `src/` vs `public/`

Al estar desarrollado en **Astro**, el proyecto dictamina una regla de oro fundamental respecto a sus carpetas:

- 🧱 **`src/` (Código Fuente)**: Aquí vive todo lo que Astro **procesa, optimiza y compila**. Incluye nuestros componentes manejables (`.astro`), las layouts maestras de las páginas, y el enrutamiento. Astro transforma todos los elementos de esta carpeta en código super ligero.
- 🌍 **`public/` (Archivos Estáticos)**: Aquí reside todo lo que Astro **NO** alterará. Incluye imágenes crudas, videos, exportaciones y archivos legacy de HTML/CSS tradicionales. Astro simplemente toma estos archivos y los proyecta intactos, manteniendo nuestras rutas antiguas estables.

---

## 🔗 Sistema de Rutas y Enrutamiento en Astro

Al migrar de HTML puro a Astro, el manejo de rutas cambia radicalmente. En HTML tradicional, las rutas eran rutas de archivos reales (`pages/habitaciones.html`). En Astro, las rutas se generan **automáticamente** a partir de la estructura de carpetas. Aquí explicamos cómo funciona en detalle.

### 🌍 `public/`: La Caja Transparente

La carpeta `public/` actúa como un **estante de exhibición**: todo lo que pongas dentro se sirve directamente en la raíz (`/`) de tu sitio web. La palabra `public` **nunca** aparece en la URL del navegador.

```text
# Así está en tu disco:              →  Así lo ve el navegador:
public/css/styles.css                →  /css/styles.css
public/images/habitacion.png         →  /images/habitacion.png
public/media/showcase_hotel.mp4      →  /media/showcase_hotel.mp4
```

Por eso, en el código siempre utilizamos la ruta **sin** la palabra `public`:

- ✅ **Correcto**: `href="/css/styles.css"` o `src="/images/habitacion.png"`
- ❌ **Incorrecto**: `href="/public/css/styles.css"` o `src="public/images/habitacion.png"`

### 🧱 `src/pages/`: Las Puertas de Entrada

Astro utiliza un **enrutamiento basado en archivos**: por cada archivo `.astro` que creemos dentro de `src/pages/`, se genera automáticamente una URL. La carpeta `pages/` también es **transparente**, nunca aparece en la URL.

```text
# Tu archivo en disco:                   →  La URL que genera:
src/pages/index.astro                    →  /                    (Página principal)
src/pages/reservaciones.astro            →  /reservaciones
src/pages/acerca-de.astro                →  /acerca-de
src/pages/habitaciones.astro             →  /habitaciones
src/pages/admin/panel.astro              →  /admin/panel         (Subcarpetas = Sub-rutas)
```

### ❌ Errores Comunes al Migrar de HTML a Astro

Al trasladar un proyecto HTML clásico, los errores más frecuentes son:

| Error Común (HTML Legacy)       | Corrección en Astro      | ¿Por qué?                                       |
| :------------------------------ | :----------------------- | :---------------------------------------------- |
| `href="pages/acerca-de.html"`   | `href="/acerca-de"`      | `pages/` y `.html` ya no existen como ruta      |
| `href="../css/styles.css"`      | `href="/css/styles.css"` | `../` es innecesario, usa rutas absolutas (`/`) |
| `src="../images/foto.png"`      | `src="/images/foto.png"` | Mismo caso: la `/` busca directo en `public/`   |
| `href="/public/css/styles.css"` | `href="/css/styles.css"` | `public/` nunca aparece en la URL               |

### 🏨 Analogía Rápida para Recordar

| Concepto              | Analogía                                                                                                                       | Visibilidad en la URL |
| :-------------------- | :----------------------------------------------------------------------------------------------------------------------------- | :-------------------: |
| **`public/`**         | El **estante de exhibición** del hotel. Lo que pongas ahí, el huésped lo ve directamente sin preguntar.                        |     ❌ No aparece      |
| **`src/pages/`**      | Las **puertas de entrada** del hotel. Cada archivo `.astro` es una puerta con nombre propio.                                   |     ❌ No aparece      |
| **`src/components/`** | Las **tuberías y cables** detrás de las paredes. Son piezas vitales, pero el huésped jamás las ve.                             |     ❌ No aparece      |
| **`src/layouts/`**    | Los **planos arquitectónicos** del edificio. Definen la estructura general de cada piso, pero el huésped solo ve el resultado. |     ❌ No aparece      |

---

## 📂 Estructura del Proyecto

```text
Hotel_PaginaWeb/
├── 🌍 public/              # Archivos estáticos crudos (No procesados por Astro)
│   ├── css/                # Estilos tradicionales (Mapeados a /css/*)
│   ├── images/             # Recursos gráficos (Mapeados a /images/*)
│   └── media/              # Multimedia y Showcase (Mapeados a /media/*)
├── 🧱 src/                 # Código fuente procesado por Astro
│   ├── assets/             # Assets que Astro optimiza (Imágenes v2)
│   ├── components/         # Piezas de IU (Astro, React Islas)
│   ├── layouts/            # Esqueleto base (Layout.astro)
│   └── pages/              # Sitio Web Base (acerca-de, habitaciones, etc.)
├── astro.config.mjs        # Configuración principal del framework Astro
├── tailwind.config.js      # Configuración y utilidades de TailwindCSS
└── package.json            # Gestor de dependencias y scripts de ejecución
```

### 🤖 Arquitectura Multi-Agente (AI)

El proyecto restringe y sincroniza de manera estricta el comportamiento de diferentes inteligencias artificiales para asegurar la integridad de su código.

```text
Hotel_PaginaWeb/
├── 🤖 .agents/                 # Cerebro orquestador unificado
│   ├── common/                 # SSoT (Single Source of Truth) del Stack
│   ├── identity/               # Personalidad y comportamiento por IA
│   └── skills/                 # Skills localizadas y especializadas
│       ├── claude/             # Protocolo de QA y Auditoría
│       ├── gemini/             # Patrones React, SSR y Seguridad (Antigravity)
│       ├── github/             # Directivas restrictivas para Copilot
│       └── shared/             # Master Skills inter-agentes (ej. Astro SSR)
└── 🐙 .github/                 # Configuración de Repositorio (GitHub)
    └── copilot-instructions.md # Entrada restrictiva para GitHub Copilot
```

---

## 🧞 Comandos de Desarrollo (Astro CLI)

Todos los comandos se corren desde la raíz del proyecto en la terminal:

| Comando            | Acción                                               |
| :----------------- | :--------------------------------------------------- |
| `pnpm install`     | Instala dependencias necesarias del entorno          |
| `pnpm up`          | Actualiza las dependencias a su versión más reciente |
| `pnpm run dev`     | Inicia tu servidor local en `localhost:4321`         |
| `pnpm run build`   | Construye la compilación estática final a `./dist/`  |
| `pnpm run preview` | Previsualiza en entorno local tu versión build       |

---

## 💻 Entorno de Desarrollo y Convenciones

### Herramientas

- **IDE**: Visual Studio Code / Antigravity
- **Formateador**: **Prettier** para mantener indentación y claridad impecables.

### 📝 Convenciones de Comentarios (Better Comments)

Utilizamos colores específicos para facilitar la lectura técnica tanto para desarrolladores como evaluadores:

- 🔴 `!` **Crítico**: Partes esenciales del núcleo. No modificar sin conocimiento previo.

- 🔵 `*` **Informativo**: Documentación de secciones, imágenes o bloques relevantes.

- 🟢 `?` **Nota**: Detalles específicos sobre funcionalidades curiosas o minimalistas.

- 🟠 `TODO` **Pendiente**: Mejoras, arreglos o cambios futuros planificados.

---

## 🗺️ Roadmap de Implementación

### ✅ Fase 1 — Consolidación y Migración (Completada)

- [x] Maquetación inicial y estructura de páginas HTML.
- [x] Implementación de diseño responsivo.
- [x] Optimización de recursos multimedia.
- [x] Migración e integración de Layouts/Componentes a entorno **Astro**.
- [x] Transición total de `public/pages/` al enrutador `src/pages/`.
- [x] Migración completa del panel `public/admin/` a `src/pages/admin/` con `LayoutAdmin.astro`.
- [x] Corrección de todas las rutas relativas (`.html`) a rutas absolutas de Astro (`/ruta`).
- [x] Restauración de CSS específicos de página (`reservaciones.css`, `habitaciones.css`).
- [x] Eliminación de `public/pages/` (HTML duplicado), proyecto 100% en Astro.

### 🏗️ Fase 2 — Calidad y Accesibilidad (En Progreso)

- [x] Corrección de error de accesibilidad WCAG en `<label>` del formulario de Reservaciones.
- [x] **Optimización de Imágenes:** Migración de fotos pesadas (+2 MB) a `src/assets/` con `<Image />` de Astro.
- [x] **Auditoría de accesibilidad global:** `aria-hidden` en íconos decorativos, `for` explícito en `<label>`, `aria-label` en `<nav>` y eliminación de `role` redundantes en todo `/admin`.
- [x] **`title` y `favicon` dinámico en Layouts:** Propiedades integradas con valores default manejados eficientemente.
- [x] **Modularización del Sidebar Admin:** Pendiente de extracción a `NavAdmin.astro`.

### ✅ Fase 3 — Estilado Moderno y Diseño Premium (Completada)

- [x] **Sistema Tipográfico Unificado:** Implementación del binomio *Cormorant Garamond* (Display) y *Jost* (Cuerpo/UI) en todo el proyecto.
- [x] **Design Tokens:** Consolidación de paleta de colores y fuentes en variables CSS nativas (`:root`) para mantenibilidad.
- [x] **Micro-interacciones:** Animaciones de botones estilizadas con efectos de elevación (`translateY`), sombras profundas y realce de brillo.
- [ ] Refactorización progresiva a **Tailwind CSS** (Uso híbrido actual para páginas específicas).

### ✅ Fase 4 — Funcionalidad e Integración (Completada)

- [x] **Server-Side Rendering (SSR):** Activación de `output: "server"` con adaptador `@astrojs/node` para renderizado dinámico.
- [x] **Panel de Búsqueda Rápida:** Componente `PanelReservation.astro` con persistencia de parámetros via URL.
- [x] **Flujo de Pago Multi-step:** Integración de Isla de React (`PagosForm.jsx`) en flujo nativo de Astro.
- [x] **Persistencia y Sincronización:** Uso de `sessionStorage` y `CustomEvents` para comunicación entre Astro y React.
- [x] **Validación y Frontend Logic:** Lógica de validación nativa (Astro) y validación de tarjetas con máscaras en tiempo real (React).
- [x] **Confirmación Dinámica:** Página `exito.astro` que procesa y muestra el resumen final de la reservación.
- [x] **Protección de Rutas (Middleware):** Control de acceso estricto mediante `middleware.ts` en SSR para defender el entorno de administración `/admin/*`.
- [x] **Persistencia Permanente (Backend):** Conexión y escalabilidad migrada a **Supabase (PostgreSQL)**.

### ✅ Fase 5 — System & AI Orchestration (Completada)

- [x] **SSoT de Inteligencia Artificial:** Arquitectura jerárquica unificada bajo el directorio `.agents/`.
- [x] **Copilot Guardrails:** Restricciones técnicas rígidas aplicadas vía `.github/copilot-instructions.md`.
- [x] **Auditoría Autónoma:** Despliegue de un protocolo escéptico de QA exclusivo para Claude (SECURITY.md superado).
- [x] **Shared Master Skills:** Centralización de las directivas críticas de Astro SSR para compartir contexto sin riesgo de alucinaciones.

### 🏗️ Fase 6 — Backend Roles & Arquitectura Avanzada (En Progreso)

- [x] **Arquitectura RBAC & GoTrue (Supabase Auth):** Implementación de `service_role` transversal para resolución de Deadlocks y protección de identidades. Todo operado directamente por la API sin inserciones manuales vulnerables.
- [x] **Auditoría UI/UX Administrativa:** Redimensionamiento global asimétrico (`is-fluid`) abarcando el 100% del viewport interior y arreglo de Canvas TS para visualización de Chart.js perfecta.
- [ ] **Caja y Transacciones (`balance.astro`):** Despliegue de vistas (Views/RPC) directas en SQL para cálculos matemáticos server-side y ahorro masivo de RAM de servidor.
- [ ] **Terminal de Ingeniería (`dev.astro`):** Establecimiento de Webhooks privados (Canal Discord/GitHub Issues) para comunicación de soporte inmediato.

---

<p align="center">
  Hecho con ❤️ por desarrolladores del <b>Tecnológico de Morelia</b>
</p>
