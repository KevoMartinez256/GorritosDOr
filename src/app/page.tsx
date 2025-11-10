// src/app/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { createClientServer } from '@/lib/supabaseClient'

// Forzamos dinámico para que siempre lea la cookie de sesión tras el callback
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClientServer()
  const { data: { session } } = await supabase.auth.getSession()

  const user = session?.user
  const meta = (user?.user_metadata ?? {}) as Record<string, any>
  const name =
    meta.full_name ??
    meta.name ??
    meta.preferred_username ??
    user?.email ??
    'Usuario'
  const avatar = meta.avatar_url ?? meta.picture ?? '/avatar-fallback.png'

  // Cambia la ruta según el nombre real del archivo:
  // const TWITCH_BTN_SRC = '/twitch-button.png'
  const TWITCH_BTN_SRC = '/twitch-button.png'

  return (
    <main className="relative h-screen overflow-hidden">
      {/* Fondo a pantalla completa - sin blur */}
      <Image
        src="/Back.png"
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Logo pequeño en la esquina superior izquierda */}
      <div className="absolute top-6 left-6 z-20">
        <Image
          src="/chaparritaspng.png"
          alt="Gorritos D'or"
          width={50}
          height={50}
          className="w-[50px] h-[50px] object-contain"
          priority
        />
      </div>

            {/* Contenido - Todo a la derecha */}
      <div className="relative z-10 h-full flex items-center justify-end px-8 md:px-16 lg:px-24">
        
        {/* Sección derecha: Logo, Fecha, Auth */}
        <div className="flex flex-col items-center max-w-xl -mt-16">
          <Image
            src="/Logo.png"
            alt="Gorritos D'or Awards"
            width={800}
            height={300}
            className="h-auto w-[320px] md:w-[450px] lg:w-[550px]"
            priority
          />

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white -mt-8 mb-3">
            DICIEMBRE 13
          </h1>

          <p className="text-neutral-300 text-base md:text-lg mb-4">
            Vota en las categorías oficiales
          </p>

          {!user ? (
            // Estado NO autenticado → botón de Twitch
            // Importante: prefetch desactivado para evitar petición RSC con header `rsc`
            <Link prefetch={false} href="/auth/login" className="hover:scale-105 transition-transform block">
              <Image
                src={TWITCH_BTN_SRC}
                alt="Entrar con Twitch"
                width={360}
                height={100}
                className="h-auto w-[280px] md:w-[320px]"
                priority
              />
            </Link>
          ) : (
            // Estado autenticado → avatar + nombre + CTA
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-black/50 px-5 py-4 ring-1 ring-white/20 backdrop-blur-sm">
                <Image
                  src={avatar}
                  alt={name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="text-left leading-tight">
                  <div className="text-neutral-300 text-sm">Bienvenido</div>
                  <div className="text-white font-semibold text-lg max-w-[200px] truncate">
                    {name}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/vote/2025"
                  className="rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-500 transition-colors"
                >
                  Ir a votar
                </Link>

                <form action="/auth/logout" method="post">
                  <button className="rounded-xl bg-neutral-800 px-5 py-3 hover:bg-neutral-700 transition-colors">
                    Salir
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
