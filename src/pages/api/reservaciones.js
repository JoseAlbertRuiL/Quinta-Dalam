/**
 * src/pages/api/reservaciones.js
 * ─────────────────────────────────────────────────────────────
 * Endpoint SSR (server-side) para crear reservaciones en Supabase.
 *
 * Método: POST
 * Ruta:   /api/reservaciones
 *
 * Flujo:
 *  1. Validar presencia y formato de todos los campos obligatorios
 *  2. Verificar disponibilidad de la habitación en las fechas solicitadas
 *     → Si ya hay una reserva activa para esa habitación ese día (fecha_entrada),
 *       se rechaza la nueva solicitud (HTTP 409 Conflict).
 *  3. Insertar la reservación en la tabla `reservas`
 *  4. Devolver confirmación JSON
 *
 * Regla de negocio clave:
 *  - Una habitación no puede tener más de una reserva que se "solape".
 *  - Dos reservaciones se solapan si sus rangos de fechas se interceptan:
 *      nueva.fecha_entrada < existente.fecha_salida
 *      AND nueva.fecha_salida > existente.fecha_entrada
 *  - La primera reserva gana; la segunda es rechazada con HTTP 409.
 * ─────────────────────────────────────────────────────────────
 */

// Este endpoint solo corre en el servidor — las vars sin PUBLIC_ son seguras aquí.
import { createClient } from '@supabase/supabase-js';

/**
 * Usamos el service_role KEY en el servidor para poder insertar sin restricciones
 * de RLS (en caso de que RLS esté habilitado con política restrictiva).
 * En producción, configura políticas RLS adecuadas y puedes bajar al anon key.
 */
function getAdminClient() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY; // fallback para desarrollo

  if (!url || !key) {
    throw new Error('[API] Faltan credenciales de Supabase en las variables de entorno.');
  }

  return createClient(url, key);
}

// ─── Helpers de validación ───────────────────────────────────

/**
 * Valida que una cadena sea una fecha ISO válida (YYYY-MM-DD).
 */
function esDateValida(str) {
  if (!str || typeof str !== 'string') return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(str)) return false;
  const d = new Date(str + 'T00:00:00');
  return !isNaN(d.getTime());
}

/**
 * Extrae y normaliza los campos del body para la tabla `reservas`.
 * Mapea los nombres del sessionStorage frontend → columnas de Supabase.
 *
 * Tabla reservas:
 *   nombre_cliente  TEXT  NOT NULL
 *   correo          TEXT  NOT NULL
 *   telefono        TEXT  (nullable)
 *   habitacion      TEXT  NOT NULL
 *   fecha_entrada   DATE  NOT NULL
 *   fecha_salida    DATE  NOT NULL
 *   personas        INT4  (nullable)
 */
function parsearBody(body) {
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

/**
 * Verifica si existe solapamiento de fechas para la habitación dada.
 *
 * Condición de solapamiento (rango abierto en extremos):
 *   nueva.fecha_entrada < existente.fecha_salida
 *   AND nueva.fecha_salida > existente.fecha_entrada
 *
 * Esto cubre todos los casos de colisión:
 *   - Check-in dentro de una estancia existente
 *   - Check-out dentro de una estancia existente
 *   - Estancia nueva engloba a una existente
 */
async function verificarDisponibilidad(supabase, { habitacion, fecha_entrada, fecha_salida }) {
  const { data, error } = await supabase
    .from('reservas')
    .select('id, fecha_entrada, fecha_salida, nombre_cliente')
    .eq('habitacion', habitacion)
    .lt('fecha_entrada', fecha_salida)   // existente empieza ANTES de que la nueva salga
    .gt('fecha_salida', fecha_entrada)   // existente termina DESPUÉS de que la nueva entre
    .limit(1);

  if (error) {
    throw new Error(`Error verificando disponibilidad: ${error.message}`);
  }

  // Si hay algún resultado, la habitación NO está disponible
  return {
    disponible: data.length === 0,
    conflicto: data[0] ?? null,
  };
}

// ─── Handler principal ────────────────────────────────────────

export const POST = async ({ request }) => {
  // Headers CORS para cuando PagosForm llama desde el cliente React
  const headers = {
    'Content-Type': 'application/json',
    // TODO: En producción, restringir '*' al dominio real (ej. 'https://hoteldalam.com') para evitar ataques CORS
    'Access-Control-Allow-Origin': '*',
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'El cuerpo de la petición no es JSON válido.' }),
      { status: 400, headers }
    );
  }

  // 1️⃣ Parsear y normalizar campos
  const datos = parsearBody(body);

  // 2️⃣ Validaciones básicas de presencia y formato
  const errores = [];

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

  // 3️⃣ Conectar a Supabase y verificar disponibilidad
  let supabaseAdmin;
  try {
    supabaseAdmin = getAdminClient();
  } catch (err) {
    console.error('[API /reservaciones] Error de configuración:', err.message);
    return new Response(
      JSON.stringify({ ok: false, error: 'Error de configuración del servidor.' }),
      { status: 500, headers }
    );
  }

  let disponibilidad;
  try {
    disponibilidad = await verificarDisponibilidad(supabaseAdmin, datos);
  } catch (err) {
    console.error('[API /reservaciones] Error verificando disponibilidad:', err.message);
    return new Response(
      JSON.stringify({ ok: false, error: 'Error al verificar la disponibilidad. Intenta más tarde.' }),
      { status: 503, headers }
    );
  }

  // 4️⃣ Rechazar si hay conflicto de fechas
  if (!disponibilidad.disponible) {
    const c = disponibilidad.conflicto;
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'La habitación ya está reservada en las fechas solicitadas.',
        codigo: 'HABITACION_NO_DISPONIBLE',
        detalles: {
          habitacion: datos.habitacion,
          fecha_entrada_solicitada: datos.fecha_entrada,
          fecha_salida_solicitada: datos.fecha_salida,
          reserva_existente: {
            fecha_entrada: c.fecha_entrada,
            fecha_salida: c.fecha_salida,
            // No exponemos nombre_cliente por privacidad
          },
          mensaje: `La habitación ${datos.habitacion} ya tiene una reservación del ${c.fecha_entrada} al ${c.fecha_salida}. Por favor elige otras fechas o una habitación diferente.`,
        },
      }),
      { status: 409, headers }
    );
  }

  // 5️⃣ Insertar la reservación
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
    console.error('[API /reservaciones] Error al insertar:', insertError.message);
    return new Response(
      JSON.stringify({ ok: false, error: 'No se pudo guardar la reservación. Intenta nuevamente.' }),
      { status: 500, headers }
    );
  }

  // 6️⃣ Éxito
  return new Response(
    JSON.stringify({
      ok: true,
      mensaje: '¡Reservación confirmada exitosamente!',
      reserva: {
        id:            nuevaReserva.id,
        habitacion:    nuevaReserva.habitacion,
        fecha_entrada: nuevaReserva.fecha_entrada,
        fecha_salida:  nuevaReserva.fecha_salida,
      },
    }),
    { status: 201, headers }
  );
};

// Manejar preflight CORS (OPTIONS)
export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      // TODO: En producción, restringir '*' al dominio real (ej. 'https://hoteldalam.com')
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
