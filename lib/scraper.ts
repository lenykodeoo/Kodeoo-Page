export type ScrapedBien = {
  titre: string
  prix: number | null
  surface: number | null
  pieces: number | null
  chambres: number | null
  ville: string
  quartier: string | null
  description: string | null
  photos: string[]
  dpe: string | null
  ges: string | null
  source_url: string
}

export async function scrapeAnnonce(url: string): Promise<ScrapedBien> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'fr-FR,fr;q=0.9',
    }
  })

  if (!response.ok) {
    throw new Error(`Impossible de récupérer l'annonce : ${response.status}`)
  }

  const html = await response.text()

  // Extraction Open Graph (fonctionne sur tous les portails)
  const getMeta = (prop: string): string => {
    const match = html.match(new RegExp(`<meta[^>]*property="${prop}"[^>]*content="([^"]*)"`, 'i'))
      || html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*property="${prop}"`, 'i'))
    return match ? match[1].trim() : ''
  }

  const titre = getMeta('og:title').replace(/\s*[-|·]\s*.+$/, '').trim()
  const description = getMeta('og:description') || null
  const image = getMeta('og:image')

  // Extraction prix
  const prixRaw = titre + ' ' + (description || '')
  const prixMatch = prixRaw.replace(/\s/g, '').match(/(\d{3,7})/)
  const prix = prixMatch ? parseInt(prixMatch[1]) : null

  // Extraction surface
  const surfaceMatch = (titre + ' ' + (description || '')).match(/(\d+)\s*m²/)
  const surface = surfaceMatch ? parseInt(surfaceMatch[1]) : null

  // Extraction ville depuis URL
  const villes = ['paris','lyon','marseille','bordeaux','nantes','toulouse','nice','rennes','lille','strasbourg']
  let ville = ''
  for (const v of villes) {
    if (url.toLowerCase().includes(v)) {
      ville = v.charAt(0).toUpperCase() + v.slice(1)
      break
    }
  }

  return {
    titre: titre || 'Bien immobilier',
    prix,
    surface,
    pieces: null,
    chambres: null,
    ville,
    quartier: null,
    description,
    photos: image ? [image] : [],
    dpe: null,
    ges: null,
    source_url: url,
  }
}