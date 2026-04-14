# Security Audit — Quinta-Dalam Admin Panel

Audit Date: 2026-04-13
Auditor: Claude Code (Strict Security Protocol)
Scope: `src/pages/admin/*`, `src/pages/api/*`, `src/lib/supabase.js`

---

## 1. CRITICAL VULNERABILITIES

### CORS Wildcard — `/api/reservaciones.js:123`
```javascript
'Access-Control-Allow-Origin': '*',
```
**Risk:** Any website can call this endpoint. If browser sends Supabase cookies cross-origin, attacker can extract or manipulate reservation data.
**Fix:** Replace `*` with actual domain (`https://hoteldalam.com` or similar).

### Missing `SameSite` Cookie Attribute — `admin.astro:33-42`
```javascript
Astro.cookies.set("sb-access-token", ..., {
  httpOnly: true,
  secure: true,
  // SAME SITE MISSING
});
```
**Risk:** Cookie sent in CSRF attacks. Attacker can force logout or session fixation.
**Fix:** Add `sameSite: "strict"` or `sameSite: "lax"`.

### Database Operations in Client — `database.astro:87-93`
```javascript
onclick={`confirmarAccion('EDITAR', ${res.id})`}
onclick={`confirmarAccion('ELIMINAR', ${res.id})`}
```
**Risk:** Operations execute from browser directly against Supabase. No server-side validation, no RLS enforcement. Client can manipulate any record.
**Fix:** Create API endpoints (`/api/reservas/edit`, `/api/reservas/delete`) with server-side auth and RLS validation.

### TRUNCATE TABLE Button — `database.astro:107`
```javascript
onclick="confirmarAccion('TRUNCATE TABLE', 'TODAS_LAS_RESERVAS')"
```
**Risk:** Only `confirm()` client-side separates user. No real permission check or backend verification. If implemented, wipes ALL reservations.
**Fix:** Remove or implement proper server-side DELETE with admin role verification.

---

## 2. AUTHORIZATION GAPS

### No Admin Role Verification
Every admin page (balance, stats, database, etc.) only checks:
```javascript
if (!accessToken || !refreshToken) { return Astro.redirect("/admin/admin"); }
```
**Risk:** Any authenticated Supabase user can access the entire admin panel.
**Fix:** After `setSession`, verify `data.session.user.app_metadata.role === 'admin'` or query a roles table.

### Email Enumeration — `admin.astro:30`
```javascript
errorMsg = "Credenciales inválidas. Por favor intente de nuevo.";
```
**Risk:** Attackers can confirm which emails are registered by comparing response time or behavior.
**Fix:** Use generic message for all auth failures. Add account lockout after N attempts.

### No Rate Limiting
Login endpoint has no brute-force protection.
**Fix:** Track failed attempts per IP/email, block after 5 failures for 15 minutes.

---

## 3. INFORMATION DISCLOSURE

### Verbose Error Messages — `reservaciones.js:106`
```javascript
throw new Error(`Error verificando disponibilidad: ${error.message}`);
```
**Risk:** Exposes database structure and query patterns to client.
**Fix:** Log full error server-side, return generic "Service unavailable" to client.

### Chart.js CDN — `stats.astro:162`
```javascript
<script is:inline src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```
**Risk:** Supply chain compromise. CDN can serve modified malicious version.
**Fix:** Self-host Chart.js or remove entirely.

### Full Client Name Exposure — `database.astro:81`
```javascript
<td class="has-text-white">{res.nombre_cliente}</td>
```
**Risk:** Inconsistent masking. `panel-admin.astro` correctly omits client names in error responses but `database.astro` shows them freely.
**Fix:** Apply same masking rules across all admin pages.

---

## 4. LOGIC ERRORS

### Fragile Room Matching — `panel-admin.astro:36`
```javascript
const reserva = reservasActivas.find(r => r.habitacion.includes(hab.nombre));
```
**Risk:** "Suite" matches "Deluxe Suite". False positives in room status.
**Fix:** Use exact room ID or numeric identifier, not string inclusion.

### No Token Refresh Handling
If access token expires before refresh token, user loses session with no recovery path.
**Fix:** Implement refresh token rotation or session extension on each valid request.

### Untyped Session Errors — e.g., `panel-admin.astro:16`
```javascript
const { error: authError } = await supabase.auth.setSession(...);
if (authError) { ... }
```
**Risk:** `setSession` can throw network exceptions, not just auth errors. Catch block doesn't differentiate.
**Fix:** Wrap in try/catch for network errors, handle auth errors separately.

---

## 5. PRIORITY REMEDIATION TABLE

| Priority | Issue | Fix |
|----------|-------|-----|
| CRITICAL | DB ops in client | API endpoints with server validation |
| CRITICAL | Missing SameSite | Add `sameSite: "strict"` to cookies |
| CRITICAL | CORS wildcard | Domain allowlist only |
| HIGH | No admin role check | Verify `app_metadata.role` after setSession |
| HIGH | CSRF protection | Add anti-CSRF token to all forms |
| HIGH | Rate limiting | Block after N failed login attempts |
| MEDIUM | Chart.js CDN | Self-host or remove |
| MEDIUM | Email enumeration | Generic error messages |

---

## 6. SUPABASE RLS STATUS

RLS is reported as enabled in `database.astro:59`, but:
- Client-side direct operations bypass RLS
- No server-side service role usage in admin mutations
- Admin queries (`panel-admin.astro:28-29`) use public client — relies entirely on RLS

**Recommendation:** Use service role key ONLY in API endpoints for admin operations. Public client should only read data that RLS permits.

---

## 7. RECOMMENDED MIDDLEWARE

Create `src/middleware/auth.js`:
```javascript
export const onRequest = async ({ cookies, redirect, request }) => {
  const excluded = ['/admin/admin'];
  if (excluded.includes(new URL(request.url).pathname)) return;

  const token = cookies.get('sb-access-token');
  if (!token) return redirect('/admin/admin');

  // Verify admin role here
};
```
Apply to all `/admin/*` routes.