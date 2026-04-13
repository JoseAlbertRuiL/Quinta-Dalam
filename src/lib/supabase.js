/**
 * lib/supabase.js
 * ─────────────────────────────────────────────────────────────
 * Cliente singleton de Supabase para toda la aplicación.
 *
 * Astro + @supabase/supabase-js v2:
 *   - import.meta.env.PUBLIC_* → disponible en cliente Y servidor
 *   - import.meta.env.*        → SOLO servidor (nunca llegan al bundle del browser)
 *
 * En Astro con output 'server' o 'hybrid', los endpoints de API corren en Node,
 * donde tanto las vars PUBLIC_ como las privadas están disponibles.
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Faltan variables de entorno.\n' +
    'Asegúrate de tener PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

/**
 * Cliente público — usa la clave anónima.
 * Respeta las políticas RLS configuradas en Supabase.
 * Úsalo en componentes React (cliente) y en endpoints Astro.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
