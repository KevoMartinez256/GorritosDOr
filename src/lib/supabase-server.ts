// Cliente para el SERVIDOR (App Router + cookies)
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export const supabaseServer = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          (await cookieStore).set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          (await cookieStore).set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
};
// Alias para compatibilidad: muchos archivos importan `createClientServer`
// desde este módulo. Exportamos un alias que retorna el mismo cliente
// que `supabaseServer()` para evitar errores de compilación.
export const createClientServer = supabaseServer;
export { createServerClient };

