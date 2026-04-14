import { defineMiddleware } from 'astro:middleware';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './lib/database.types';

/**
 * Creamos un cliente Supabase dedicado para el middleware.
 * Usamos la clave anónima para setSession (validar JWT del usuario)
 * y un cliente con service_role para consultar roles_usuario (bypasea RLS).
 */
function getSupabaseClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  return createClient<Database>(url, anonKey);
}

function getAdminClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  return createClient<Database>(url, key);
}

export const onRequest = defineMiddleware(async ({ locals, cookies, redirect, url }, next) => {
  // Proteger rutas de /admin (excepto el login en /admin/admin)
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/admin')) {
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");

    if (!accessToken || !refreshToken) {
      return redirect("/admin/admin");
    }

    // Crear un cliente fresco por request para evitar contaminación de estado
    const supabase = getSupabaseClient();
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    });

    if (error || !session) {
      cookies.delete("sb-access-token", { path: "/" });
      cookies.delete("sb-refresh-token", { path: "/" });
      return redirect("/admin/admin");
    }

    // Validación estricta de Roles via RBAC
    const email = session.user.email;
    if (email) {
      // Usamos el cliente admin (service_role) para bypasear RLS en roles_usuario
      const adminClient = getAdminClient();
      const { data: rolData, error: rolError } = await adminClient
        .from('roles_usuario')
        .select('role')
        .eq('email', email)
        .single();

      if (rolError || !rolData || !['superadmin', 'admin', 'recepcion'].includes(rolData.role)) {
        // Acceso denegado
        cookies.delete("sb-access-token", { path: "/" });
        cookies.delete("sb-refresh-token", { path: "/" });
        return redirect("/admin/admin?error=unauthorized");
      }
      
      // Pasar datos al contexto de la aplicación
      locals.role = rolData.role;
      locals.email = email;
    }
  }

  // Proteger API routes internas para administradores
  if (url.pathname.startsWith('/api/admin-')) {
    const accessToken = cookies.get("sb-access-token");
    const refreshToken = cookies.get("sb-refresh-token");

    if (!accessToken || !refreshToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const supabase = getSupabaseClient();
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: accessToken.value,
      refresh_token: refreshToken.value,
    });

    if (error || !session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    
    const email = session.user.email;
    if (email) {
      const adminClient = getAdminClient();
      const { data: rolData } = await adminClient
        .from('roles_usuario')
        .select('role')
        .eq('email', email)
        .single();

      if (!rolData || !['superadmin', 'admin', 'recepcion'].includes(rolData.role)) {
          return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
      }
    } else {
        return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }
  }

  return next();
});
