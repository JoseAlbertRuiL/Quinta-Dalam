/**
 * src/pages/api/admin-reservas.ts
 * ─────────────────────────────────────────────────────────────
 * Endpoint protegido para operaciones administrativas sobre reservas.
 * El middleware (src/middleware.ts) valida autenticación y rol antes de llegar aquí.
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
} as const;

/**
 * Cliente admin con service_role key — sin fallback silencioso.
 */
function getAdminClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[API admin-reservas] Faltan credenciales de servicio. ' +
      'SUPABASE_SERVICE_ROLE_KEY es obligatoria para endpoints admin.'
    );
  }

  return createClient<Database>(url, key);
}

export const DELETE = async ({ request }: { request: Request }) => {
  let supabaseAdmin;
  try {
    supabaseAdmin = getAdminClient();
  } catch (err) {
    console.error((err as Error).message);
    return new Response(
      JSON.stringify({ error: 'Error de configuración del servidor.' }),
      { status: 500, headers: JSON_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const rawId = body?.id;

    // Validación estricta: id debe ser un entero positivo
    const id = Number(rawId);
    if (!Number.isInteger(id) || id < 1) {
      return new Response(
        JSON.stringify({ error: 'ID inválido. Debe ser un número entero positivo.' }),
        { status: 400, headers: JSON_HEADERS }
      );
    }

    const { error } = await supabaseAdmin.from('reservas').delete().eq('id', id);

    if (error) {
      console.error('[API admin-reservas] Error eliminando:', error.message);
      return new Response(
        JSON.stringify({ error: 'Surgió un problema eliminando el registro.' }),
        { status: 500, headers: JSON_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ success: true, mensaje: `Registro ${id} eliminado correctamente.` }),
      { status: 200, headers: JSON_HEADERS }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Petición inválida. Verifica el formato JSON.' }),
      { status: 400, headers: JSON_HEADERS }
    );
  }
};

/** Preflight CORS para el método DELETE */
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
