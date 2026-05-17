import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_KEY!
)

export type Agent = {
  id: string
  slug: string
  prenom: string
  nom: string
  photo_url: string | null
  reseau: string
  ville: string
  telephone: string
  email: string
  bio: string
  instagram: string | null
  tiktok: string | null
  facebook: string | null
  linkedin: string | null
  site_web: string | null
  whatsapp: string | null
  google_place_id: string | null
  is_active: boolean
  created_at: string
}

export type Bien = {
  id: string
  agent_id: string
  titre: string
  prix: number
  surface: number | null
  pieces: number | null
  chambres: number | null
  ville: string
  quartier: string | null
  statut: 'vente' | 'sous_offre' | 'vendu'
  photos: string[]
  description: string | null
  dpe: string | null
  ges: string | null
  source_url: string
  created_at: string
}

export type Lead = {
  id: string
  agent_id: string
  bien_id: string | null
  type: string
  nom: string
  email: string
  telephone: string | null
  message: string | null
  created_at: string
}
