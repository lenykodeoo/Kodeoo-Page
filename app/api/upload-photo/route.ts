import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const agent_id = formData.get('agent_id') as string
    const file = formData.get('file') as File

    if (!agent_id || !file) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${agent_id}/photo.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabaseAdmin.storage
      .from('photos')
      .getPublicUrl(fileName)

    const photo_url = urlData.publicUrl

    await supabaseAdmin
      .from('agents')
      .update({ photo_url })
      .eq('id', agent_id)

    return NextResponse.json({ success: true, photo_url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}