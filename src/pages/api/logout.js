/**
 * api/logout.js
 * ─────────────────────────────────────────────────────────────
 * Endpoint para cerrar sesión de administrador de forma segura.
 * Elimina las cookies de sesión para prevenir el acceso no autorizado
 * y deshabilita la capacidad de volver atrás en el navegador.
 * ─────────────────────────────────────────────────────────────
 */

export const POST = async ({ cookies, redirect }) => {
  // Eliminamos los tokens de sesión de las cookies
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });
  
  // Redirigimos al inicio de sesión de admin
  return redirect("/admin/admin");
};
