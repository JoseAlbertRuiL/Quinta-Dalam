import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../lib/database.types';

export const DELETE = async ({ request }: { request: Request }) => {
  // Configuración para operaciones que requiere Middleware Authentication. 
  // Nota: Este endpoint está bajo /api/admin-* así que el src/middleware.ts validará que el requerimiento 
  // contenga cookies válidas y tenga un rol válido (superadmin, admin).
  
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  // Usamos Service Role Key para anular o cumplir RLS como Admin
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY
    ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    
  if (!url || !key) {
    return new Response(JSON.stringify({ error: "Server Configuration Error" }), { status: 500 });
  }
  
  const supabaseAdmin = createClient<Database>(url, key);
  
  try {
    const { id } = await request.json();
    if (!id) throw new Error("ID es requerido");

    const { error } = await supabaseAdmin.from('reservas').delete().eq('id', id);

    if (error) {
      return new Response(JSON.stringify({ error: "Surgió un problema eliminando." }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}
