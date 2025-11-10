'use client'
import { createClientBrowser } from '@/lib/supabaseClient'

export default function AuthButton() {
  const login = async () => {
    const supabase = createClientBrowser()
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const logout = async () => {
    const supabase = createClientBrowser()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex gap-2">
      <button onClick={login} className="rounded-2xl px-4 py-2 bg-purple-600 hover:bg-purple-500">
        Entrar con Twitch
      </button>
      <button onClick={logout} className="rounded-2xl px-4 py-2 bg-neutral-800 hover:bg-neutral-700">
        Salir
      </button>
    </div>
  )
}
