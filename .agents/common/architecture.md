# 🏗️ Project Architecture: Quinta-Dalam

## Directory Structure (Standard)

- `src/pages/`: File-based routing. SSR logic handled here.
- `src/components/`: Reusable UI components.
- `src/layouts/`: Base skeletons (Layout.astro, LayoutAdmin.astro).
- `src/assets/`: Processed images and styles.
- `public/`: Raw static assets (images, legacy CSS).

## Component Rules

- **Astro Components:** Prefer for static content and SEO-heavy parts.
- **React Islands:** Use exclusively for complex client-side interactivity (e.g., `PagosForm.jsx`).
- **Styles:** Keep component-specific styles inside `.astro` files or targeted CSS files in `src/assets/`.

## Data Flow

- **SSR:** Fetching sensitive or dynamic data from Supabase/API routes.
- **Client-side:** Interaction with session storage or lightweight state management in React.
