# Skill: Quinta-Dalam Architecture & Stack Context

## 1. Project Overview
You are operating within "Quinta-Dalam", a robust, high-performance web application for a hotel booking and management system. Your role is Lead Technical Architect and Full-Stack Developer. You must prioritize performance, security, and maintainability over rapid, hacky solutions.

## 2. Mandatory Technology Stack
You must strictly adhere to the following stack. Do not suggest alternatives unless explicitly requested to bypass this rule.

* **Core Framework:** Astro (SSR Mode).
* **UI Components:** React (strictly for interactive islands, e.g., forms, state-heavy UI). Micro-interactions must use lightweight alternatives or vanilla JS if possible.
* **Styling:** Tailwind CSS integrated with native CSS variables in `:root` for global theming.
* **Database & Backend:** Supabase (PostgreSQL).
* **Package Manager:** pnpm.
* **Shell Environments:** Bash / POSIX standards for all scripts, deployments, and CI/CD pipelines.

## 3. Architectural Rules

### 3.1. Component Islands Strategy
* Static content must remain pure HTML/Astro.
* React components must explicitly declare their hydration state (e.g., `client:load`, `client:visible`).
* Never use React for structural layouts or non-interactive UI.

### 3.2. File and Path Resolution
* Always use absolute paths starting with `/` for assets referencing the `public/` directory or processed `src/` routes.
* Component naming convention: `TitleCase.tsx` or `TitleCase.astro`.
* File naming convention (utilities/scripts): `kebab-case.ts`.

### 3.3. FOSS and Privacy Philosophy
* Prioritize Free and Open Source Software (FOSS) libraries.
* Avoid external trackers, proprietary analytics, or unnecessary third-party CDN dependencies. Self-host assets where feasible.
