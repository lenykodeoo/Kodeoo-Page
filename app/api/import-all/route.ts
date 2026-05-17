import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'Accept': 'text/html',
  'Accept-Language': 'fr-FR,fr;q=0.9',
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) return null
    return await res.text()
  } catch { return null }
}

function scrapeBien(html: string, url: string): any {
  const getMeta = (prop: string): string => {
    const m = html.match(new RegExp('<meta[^>]*property="' + prop + '"[^>]*content="([^"]*)"', 'i'))
      || html.match(new RegExp('<meta[^>]*content="([^"]*)"[^>]*property="' + prop + '"', 'i'))
    return m ? m[1].trim() : ''
  }

  const ogTitle = getMeta('og:title').replace(/\s*[-|]\s*(SeLoger|Leboncoin|PAP|Logic|BienIci).*/i, '').trim()
  const ogDesc = getMeta('og:description')
  const ogImage = getMeta('og:image')
  const fullText = ogTitle + ' ' + ogDesc + ' ' + html.slice(0, 30000)

  let prix: number | null = null
  const prixMatch = fullText.match(/(\d[\d\s]{2,6})\s*€/)
  if (prixMatch) {
    const n = parseInt(prixMatch[1].replace(/\s/g, ''))
    if (n >= 30000 && n <= 10000000) prix = n
  }

  const surfaceMatch = fullText.match(/(\d+(?:[.,]\d+)?)\s*m²/i)
  const surface = surfaceMatch ? parseFloat(surfaceMatch[1].replace(',', '.')) : null

  const piecesMatch = fullText.match(/(\d+)\s*pieces?/i) || fullText.match(/T(\d)\b/)
  const pieces = piecesMatch ? parseInt(piecesMatch[1]) : null

  const chambresMatch = fullText.match(/(\d+)\s*chambre/i)
  const chambres = chambresMatch ? parseInt(chambresMatch[1]) : null

  const dpeMatch = fullText.match(/DPE\s*:?\s*([A-G])\b/i)
  const dpe = dpeMatch ? dpeMatch[1].toUpperCase() : null

  const villes = ['paris','lyon','marseille','bordeaux','nantes','toulouse','nice','rennes','lille','strasbourg','montpellier','grenoble','villefranche','beausoleil','roquebrune']
  let ville = ''
  for (const v of villes) {
    if (url.toLowerCase().includes(v) || fullText.toLowerCase().includes(v)) {
      ville = v.charAt(0).toUpperCase() + v.slice(1)
      break
    }
  }

  const typePatterns = [
    { p: /appartement/i, l: 'Appartement' },
    { p: /maison/i, l: 'Maison' },
    { p: /studio/i, l: 'Studio' },
    { p: /villa/i, l: 'Villa' },
    { p: /loft/i, l: 'Loft' },
    { p: /immeuble/i, l: 'Immeuble' },
  ]
  let type = 'Bien immobilier'
  for (const { p, l } of typePatterns) {
    if (p.test(ogTitle + ogDesc + url)) { type = l; break }
  }

  if (!ogTitle || ogTitle.length < 5) return null

  return { titre: ogTitle, type, prix, surface, pieces, chambres, ville, description: ogDesc || null, photos: ogImage ? [ogImage] : [], dpe, source_url: url }
}

export async function POST(req: NextRequest) {
  try {
    const { agent_id, list_url } = await req.json()
    if (!agent_id || !list_url) return NextResponse.json({ error: 'agent_id et list_url requis' }, { status: 400 })

    const baseUrl = new URL(list_url).origin
    const allLinks = new Set<string>()

    // Scraper la page principale
    const firstHtml = await fetchHtml(list_url)
    if (!firstHtml) return NextResponse.json({ error: 'Page inaccessible' }, { status: 400 })

    // Extraire tous les liens
    const extractLinks = (html: string) => {
      const matches = [...html.matchAll(/href="([^"#][^"]*)"/gi)]
      for (const m of matches) {
        let lien = m[1]
        if (lien.startsWith('/')) lien = baseUrl + lien
        if (!lien.startsWith('http')) continue
        if (lien.length < 30) continue
        if (/\.(css|js|png|jpg|svg|ico|pdf|woff)$/i.test(lien)) continue
        if (/contact|blog|actualit|equipe|about|mentions|politique|cookie|login|vendre|services|trouv|recherche/i.test(lien)) continue
        if (lien.includes(baseUrl)) allLinks.add(lien)
      }
    }

    extractLinks(firstHtml)

    // Scraper les pages de pagination
    const pageMatches = [...firstHtml.matchAll(/href="([^"]*\?page=(\d+))"/gi)]
    const pageUrls = pageMatches.map(m => m[1].startsWith('/') ? baseUrl + m[1] : m[1])

    for (const pageUrl of pageUrls.slice(0, 9)) {
      await new Promise(r => setTimeout(r, 300))
      const html = await fetchHtml(pageUrl)
      if (html) extractLinks(html)
    }

    // Filtrer uniquement les annonces
    const annonceLinks = [...allLinks].filter(l =>
      /propriete|annonce|bien|listing|vente|achat|appartement|maison|villa/i.test(l) &&
      !/(page=|\?)/i.test(l)
    )

    // Scraper chaque annonce et sauvegarder
    const importes: any[] = []
    const erreurs: string[] = []

    for (const lien of annonceLinks.slice(0, 30)) {
      await new Promise(r => setTimeout(r, 400))
      const html = await fetchHtml(lien)
      if (!html) { erreurs.push(lien); continue }

      const bien = scrapeBien(html, lien)
      if (!bien) continue

      // Vérifier si déjà importé
      const { data: existing } = await supabaseAdmin
        .from('biens')
        .select('id')
        .eq('agent_id', agent_id)
        .eq('source_url', lien)
        .single()

      if (existing) continue

      const { data, error } = await supabaseAdmin
        .from('biens')
        .insert({
          agent_id,
          titre: bien.titre,
          prix: bien.prix,
          surface: bien.surface,
          pieces: bien.pieces,
          chambres: bien.chambres,
          ville: bien.ville || '',
          description: bien.description,
          photos: bien.photos,
          dpe: bien.dpe,
          statut: 'vente',
          source_url: lien,
        })
        .select()
        .single()

      if (!error && data) importes.push(data)
    }

    return NextResponse.json({ success: true, importes: importes.length, erreurs: erreurs.length, biens: importes })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}