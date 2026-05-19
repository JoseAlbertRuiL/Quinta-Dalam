/**
 * lib/supabase.ts
 * ─────────────────────────────────────────────────────────────
 * Cliente singleton de Supabase para toda la aplicación (TypeScript).
 *
 * Astro + @supabase/supabase-js v2:
 *   - import.meta.env.PUBLIC_* → disponible en cliente Y servidor
 *   - import.meta.env.*        → SOLO servidor
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Faltan variables de entorno.\n' +
    'Asegúrate de tener PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY en tu archivo .env'
  );
}

/**
 * Cliente público estructurado.
 * Usa la clave anónima. Beneficio: TypeScript validará cada consulta.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
