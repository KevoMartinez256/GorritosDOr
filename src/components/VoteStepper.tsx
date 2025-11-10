'use client'
import { createClientBrowser } from '@/lib/supabaseClient'
import { useState } from 'react'
import CategoryCard from './CategoryCard'

type Nominee = { id: string; display_name: string; avatar_url: string | null }
type Category = { id: string; name: string; nominees: Nominee[] }

export default function VoteStepper({ editionId, categories }: { editionId: string; categories: Category[] }) {
  const [step, setStep] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>({})
  const current = categories[step]

  const selectNominee = (categoryId: string, nomineeId: string) =>
    setChoices(prev => ({ ...prev, [categoryId]: nomineeId }))

  const submitVotes = async () => {
    for (const c of categories) {
      const nomineeId = choices[c.id]
      if (!nomineeId) continue
      const res = await fetch('/vote/api/vote', {
        method: 'POST',
        body: JSON.stringify({ editionId, categoryId: c.id, nomineeId }),
      })
      if (!res.ok) {
        const e = await res.json()
        alert(`Error en "${c.name}": ${e.error}`)
        return
      }
    }
    alert('¡Votos registrados!')
  }

  if (!current) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Resumen</h2>
        <ul className="list-disc pl-4">
          {categories.map(c => (
            <li key={c.id}>{c.name}: {c.nominees.find(n => n.id === choices[c.id])?.display_name ?? '—'}</li>
          ))}
        </ul>
        <button onClick={submitVotes} className="rounded-2xl px-4 py-2 bg-green-600 hover:bg-green-500">
          Enviar votos
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl">{current.name}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.nominees?.map(n => (
          <CategoryCard
            key={n.id}
            nominee={n}
            selected={choices[current.id] === n.id}
            onSelect={() => selectNominee(current.id, n.id)}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <button disabled={step===0} onClick={() => setStep(s => s-1)} className="px-4 py-2 rounded-2xl bg-neutral-800 disabled:opacity-50">Atrás</button>
        <button onClick={() => setStep(s => s+1)} className="px-4 py-2 rounded-2xl bg-purple-700">Siguiente</button>
      </div>
    </div>
  )
}
