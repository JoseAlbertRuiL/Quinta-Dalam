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
| Tecnología       | Rol                                             | Estado |
| :--------------- | :---------------------------------------------- | :----: |
| **Astro**        | Framework principal (Componentes, Enrutamiento) |   ✅    |
| **HTML5**        | Estructura semántica aplicada (SEO, Metadatos)  |   ✅    |
| **CSS3 / Tailwind**| Estilado dinámico y utilidad moderna            |   ✅    |
| **FontAwesome**  | Iconografía premium para la interfaz            |   ✅    |
| **Git**          | Control de versiones (Ramas y colaboración)     |   ✅    |

### Tecnologías en Transición / Futuras
| Tecnología                | Objetivo                                 | Estado |
| :------------------------ | :--------------------------------------- | :----: |
| **JavaScript/TypeScript** | Lógica de reservaciones y comprobaciones |   🏗️    |
| **NodeJS / NestJS**       | Escalabilidad y robustez del Backend     |   ⏳    |

---

## 🧠 Arquitectura Central: `src/` vs `public/`
Al estar desarrollado en **Astro**, el proyecto dictamina una regla de oro fundamental respecto a sus carpetas:

- 🧱 **`src/` (Código Fuente)**: Aquí vive todo lo que Astro **procesa, optimiza y compila**. Incluye nuestros componentes manejables (`.astro`), las layouts maestras de las páginas, y el enrutamiento. Astro transforma todos los elementos de esta carpeta en código super ligero.
- 🌍 **`public/` (Archivos Estáticos)**: Aquí reside todo lo que Astro **NO** alterará. Incluye imágenes crudas, videos, exportaciones y archivos legacy de HTML/CSS tradicionales. Astro simplemente toma estos archivos y los proyecta intactos, manteniendo nuestras rutas antiguas estables.

---

## 📂 Estructura del Proyecto

```text
Hotel_PaginaWeb/
├── 🌍 public/              # Archivos estáticos crudos (No procesados por Astro)
│   ├── admin/              # Panel de administración (Legacy HTML)
│   ├── css/                # Estilos tradicionales puros
│   ├── images/             # Banco de imágenes y recursos gráficos
│   ├── media/              # Videos y showcase multimedia
│   └── pages/              # Subpáginas del ecosistema tradicional
├── 🧱 src/                 # Código fuente procesado por Astro
│   ├── assets/             # Imágenes y estilos internos a procesar/optimizar
│   ├── components/         # Piezas de IU reutilizables (Header.astro, Footer.astro)
│   ├── layouts/            # Plantillas generales de la app (Layout.astro)
│   └── pages/              # Páginas conectadas al enrutador web
├── astro.config.mjs        # Configuración principal del framework Astro
├── tailwind.config.js      # Configuración y utilidades de TailwindCSS
└── package.json            # Gestor de dependencias y scripts de ejecución
```

---

## 🧞 Comandos de Desarrollo (Astro CLI)

Todos los comandos se corren desde la raíz del proyecto en la terminal:

| Comando                   | Acción                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Instala dependencias necesarias del entorno      |
| `pnpm run dev`            | Inicia tu servidor local en `localhost:4321`     |
| `pnpm run build`          | Construye la compilación estática final a `./dist/`|
| `pnpm run preview`        | Previsualiza en entorno local tu versión build   |

---

## 💻 Entorno de Desarrollo y Convenciones

### Herramientas
- **IDE**: Visual Studio Code / Antigravity
- **Formateador**: **Prettier** para mantener indentación y claridad impecables.

### 📝 Convenciones de Comentarios (Better Comments)
Utilizamos colores específicos para facilitar la lectura técnica tanto para desarrolladores como evaluadores:
*   🔴 `!` **Crítico**: Partes esenciales del núcleo. No modificar sin conocimiento previo.
*   🔵 `*` **Informativo**: Documentación de secciones, imágenes o bloques relevantes.
*   🟢 `?` **Nota**: Detalles específicos sobre funcionalidades curiosas o minimalistas.
*   🟠 `TODO` **Pendiente**: Mejoras, arreglos o cambios futuros planificados.

---

## 🗺️ Roadmap de Implementación
- [x] Maquetación inicial y estructura de páginas HTML.
- [x] Implementación de diseño responsivo.
- [x] Optimización de recursos multimedia.
- [x] **[NUEVO]** Migración e integración de Layouts/Componentes a entorno **Astro**.
- [ ] Transición total de páginas clásicas `public/pages/` al enrutador `src/pages/` formato `.astro`.
- [ ] Definir permanencia de la sección de **Tours**.
- [ ] Refactorización profunda a **Tailwind CSS**.
- [ ] Integración inicial de **NestJS** al stack Backend.
- [ ] Integración de lógica de reservaciones con **JavaScript/TypeScript**.
- [ ] Integración de base de datos con modulo de pagos (Paypal/Mastercard).

---

<p align="center">
  Hecho con ❤️ por desarrolladores del <b>Tecnológico de Morelia</b>
</p>
