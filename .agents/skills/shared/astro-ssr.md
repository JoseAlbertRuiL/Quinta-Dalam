# 🧙‍♂️ Master Skill: Astro SSR (Universal)

## 🎯 Context

This skill defines the optimal way to handle Server-Side Rendering (SSR) in Quinta-Dalam, ensuring high performance and security.

## 🧱 Component Logic

1. **Dynamic Data Fetching:**
   - Execute fetch calls inside the `---\n ... \n---` frontmatter block.
   - Use `Astro.props` for static-ish data passed from parents.
   - Use `Astro.request` and `Astro.url` to handle query params and headers.

2. **Islands Strategy:**
   - Use `client:load` for critical interactive elements (e.g. Navigation).
   - Use `client:visible` for elements below the fold (e.g. Forms, Carousels).
   - Use `client:only="react"` for components that rely on browser-only globals.

## 🔒 Security

- **Endpoints:** All server-side logic that performs database writes must live in `src/pages/api/*.js`.
- **Validation:** Use shared schemas to validate input on both client and server.

## ⚡ Performance

- Optimize images using `<Image />` from `astro:assets`.
- Minimize the use of complex client-side libraries unless strictly necessary.
