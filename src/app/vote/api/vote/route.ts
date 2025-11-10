// src/app/vote/api/vote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClientServer } from '@/lib/supabase-server' // <-- ajusta el nombre si en tu helper es distinto

type Body = {
  categoryId?: string
  nomineeId?: string
}

export async function POST(req: NextRequest) {
  const supabase = createClientServer()

  // 1) Usuario autenticado
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  }

  // 2) Body
  let json: Body
  try {
    json = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  const { categoryId, nomineeId } = json
  if (!categoryId || !nomineeId) {
    return NextResponse.json(
      { error: 'Faltan categoryId y nomineeId.' },
      { status: 400 }
    )
  }

  // 3) Validar que el nominado pertenece a esa categoría
  const { data: nominee, error: nomineeErr } = await supabase
    .from('nominees')
    .select('id, category_id')
    .eq('id', nomineeId)
    .single()

  if (nomineeErr || !nominee || nominee.category_id !== categoryId) {
    return NextResponse.json(
      { error: 'Nominado/Categoría no válidos.' },
      { status: 400 }
    )
  }

  // 4) Obtener edition_id de la categoría
  const { data: category, error: catErr } = await supabase
    .from('categories')
    .select('id, edition_id')
    .eq('id', categoryId)
    .single()

  if (catErr || !category) {
    return NextResponse.json(
      { error: 'Categoría no encontrada.' },
      { status: 400 }
    )
  }

  const editionId = category.edition_id
  if (!editionId) {
    return NextResponse.json(
      { error: 'La categoría no tiene edition_id.' },
      { status: 400 }
    )
  }

  // 5) Intentar insertar 1 voto (UNIQUE edicion+categoria+usuario)
  try {
    const { error: insertErr } = await supabase.from('votes').insert({
      voter_id: user.id,
      edition_id: editionId,
      category_id: categoryId,
      nominee_id: nomineeId,
    })

    if (insertErr) throw insertErr

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err: any) {
    // 23505 = unique_violation (ya votó en esta categoría en esta edición)
    if (err?.code === '23505') {
      return NextResponse.json(
        { status: 'already_voted', message: 'Ya votaste en esta categoría.' },
        { status: 409 }
      )
    }

    console.error('POST /vote error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Error guardando voto.' },
      { status: 400 }
    )
  }
}
