/**
 * src/pages/api/reservaciones.ts
 * ─────────────────────────────────────────────────────────────
 * Endpoint SSR (server-side) para crear reservaciones en Supabase usando tipado fuerte.
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';

/**
 * Crea un cliente Supabase con privilegios de administrador (service_role).
 * NUNCA hace fallback a la clave anónima — si falta, explota ruidosamente.
 */
function getAdminClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('[API] Falta PUBLIC_SUPABASE_URL en las variables de entorno.');
  }
  if (!key) {
    throw new Error(
      '[API] Falta SUPABASE_SERVICE_ROLE_KEY en las variables de entorno. ' +
      'Este endpoint requiere la clave de servicio — NUNCA uses la clave anónima aquí.'
    );
  }

  return createClient<Database>(url, key);
}

function esDateValida(str: any): boolean {
  if (!str || typeof str !== 'string') return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(str)) return false;
  const d = new Date(str + 'T00:00:00');
  return !isNaN(d.getTime());
}

function parsearBody(body: any) {
  return {
    nombre_cliente: (body.nombre_cliente ?? body.name ?? '').trim(),
    correo:         (body.correo ?? body.email ?? '').trim().toLowerCase(),
    telefono:       (body.telefono ?? body.tel ?? '').trim() || null,
    habitacion:     (body.habitacion ?? body.roomPreference ?? '').trim(),
    fecha_entrada:  (body.fecha_entrada ?? body.fechaLlegada ?? '').trim(),
    fecha_salida:   (body.fecha_salida ?? body.fechaSalida ?? '').trim(),
    personas:       parseInt(body.personas ?? body.numeroPersonas ?? '0', 10) || null,
  };
}

async function verificarDisponibilidad(supabase: ReturnType<typeof getAdminClient>, { habitacion, fecha_entrada, fecha_salida }: { habitacion: string, fecha_entrada: string, fecha_salida: string }) {
  const { data, error } = await supabase
    .from('reservas')
    .select('id, fecha_entrada, fecha_salida, nombre_cliente')
    .eq('habitacion', habitacion)
    .lt('fecha_entrada', fecha_salida)
    .gt('fecha_salida', fecha_entrada)
    .limit(1);

  if (error) {
    console.error("Error BD verificando:", error.message);
    throw new Error("Service Unavailable");
  }

  return {
    disponible: !data || data.length === 0,
    conflicto: data && data.length > 0 ? data[0] : null,
  };
}

/**
 * Genera headers de respuesta seguros.
 * CORS: usa PUBLIC_SITE_URL si existe, sino fallback a localhost:4321 (dev).
 * NUNCA usa wildcard '*' — eso permitiría requests desde cualquier dominio.
 */
function getResponseHeaders(): Record<string, string> {
  const allowOrigin = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'X-Content-Type-Options': 'nosniff',
  };
}

export const POST = async ({ request }: { request: Request }) => {
  const headers = getResponseHeaders();

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'El cuerpo de la petición no es JSON válido.' }),
      { status: 400, headers }
    );
  }

  const datos = parsearBody(body);
  const errores: string[] = [];

  if (!datos.nombre_cliente) errores.push('El nombre del cliente es requerido.');
  if (!datos.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
    errores.push('El correo electrónico no es válido.');
  }
  if (!datos.habitacion) errores.push('La habitación es requerida.');
  if (!esDateValida(datos.fecha_entrada)) errores.push('La fecha de entrada no es válida (YYYY-MM-DD).');
  if (!esDateValida(datos.fecha_salida))  errores.push('La fecha de salida no es válida (YYYY-MM-DD).');

  if (esDateValida(datos.fecha_entrada) && esDateValida(datos.fecha_salida)) {
    if (datos.fecha_salida <= datos.fecha_entrada) {
      errores.push('La fecha de salida debe ser posterior a la fecha de entrada.');
    }
  }

  if (datos.personas !== null && (isNaN(datos.personas) || datos.personas < 1 || datos.personas > 10)) {
    errores.push('El número de personas debe ser entre 1 y 10.');
  }

  if (errores.length > 0) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Datos inválidos.', detalles: errores }),
      { status: 422, headers }
    );
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = getAdminClient();
  } catch (err) {
    console.error('[API reservaciones] Error de configuración:', (err as Error).message);
    return new Response(
      JSON.stringify({ ok: false, error: 'Error de configuración del servidor.' }),
      { status: 500, headers }
    );
  }

  let disponibilidad;
  try {
    disponibilidad = await verificarDisponibilidad(supabaseAdmin, datos);
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Servicio Temporalmente Inaccesible.' }),
      { status: 503, headers }
    );
  }

  if (!disponibilidad.disponible && disponibilidad.conflicto) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Habitación ocupada en esas fechas.',
        codigo: 'HABITACION_NO_DISPONIBLE',
      }),
      { status: 409, headers }
    );
  }

  const { data: nuevaReserva, error: insertError } = await supabaseAdmin
    .from('reservas')
    .insert([{
      nombre_cliente: datos.nombre_cliente,
      correo:         datos.correo,
      telefono:       datos.telefono,
      habitacion:     datos.habitacion,
      fecha_entrada:  datos.fecha_entrada,
      fecha_salida:   datos.fecha_salida,
      personas:       datos.personas,
    }])
    .select('id, habitacion, fecha_entrada, fecha_salida, nombre_cliente')
    .single();

  if (insertError) {
    console.error('[API reservaciones] Error al insertar:', insertError.message);
    return new Response(
      JSON.stringify({ ok: false, error: 'No se pudo guardar la reservación. Intenta nuevamente.' }),
      { status: 500, headers }
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      mensaje: '¡Reservación confirmada exitosamente!',
      reserva: nuevaReserva,
    }),
    { status: 201, headers }
  );
};

export const OPTIONS = async () => {
  const allowOrigin = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
