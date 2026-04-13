# Skill: Astro and React Boundaries

## 1. Context Trigger
Apply these rules whenever editing or generating `.astro`, `.jsx`, or `.tsx` files.

## 2. The Golden Rule of Hydration
* **Astro Files (`.astro`):** Are STRICTLY Server-Side Rendered (SSR). Never suggest React hooks (`useState`, `useEffect`) inside an Astro component.
* **React Files (`.jsx` / `.tsx`):** Are strictly for isolated interactive islands (e.g., `PagosForm.jsx`).

## 3. Component Integration Pattern
When importing a React component into an Astro file, you MUST explicitly define the client directive. Do not suggest imports without hydration rules.

**Correct Pattern:**
```astro
---
import LoginForm from '../components/LoginForm.jsx';
---
<LoginForm client:load />

<LoginForm client:visible />
```

## 4. State Management

- Do not suggest Redux, Zustand, or heavy state libraries unless explicitly requested.

- Favor native React state or Nano Stores if state must be shared across different Astro islands.
