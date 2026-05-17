import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      }
    })

    if (!response.ok) return NextResponse.json({ error: 'Page inaccessible' }, { status: 400 })

    const html = await response.text()

    const getMeta = (prop: string): string => {
      const m = html.match(new RegExp(`<meta[^>]*property=["\']${prop}["\'][^>]*content=["\']([^"\']*)["\']`, 'i'))
        || html.match(new RegExp(`<meta[^>]*content=["\']([^"\']*)["\'][^>]*property=["\']${prop}["\']`, 'i'))
      return m ? m[1].trim() : ''
    }

    const ogTitle = getMeta('og:title').replace(/\s*[-|·|–]\s*(SeLoger|Leboncoin|PAP|Logic|BienIci).*/i, '').trim()
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

    const piecesMatch = fullText.match(/(\d+)\s*pièces?/i) || fullText.match(/T(\d)\b/) || fullText.match(/F(\d)\b/)
    const pieces = piecesMatch ? parseInt(piecesMatch[1]) : null

    const chambresMatch = fullText.match(/(\d+)\s*chambre/i)
    const chambres = chambresMatch ? parseInt(chambresMatch[1]) : null

    const dpeMatch = fullText.match(/DPE\s*:?\s*([A-G])\b/i)
    const dpe = dpeMatch ? dpeMatch[1].toUpperCase() : null

    const villes = ['paris','lyon','marseille','bordeaux','nantes','toulouse','nice','rennes','lille','strasbourg','montpellier','grenoble']
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
    ]
    let type = 'Bien immobilier'
    for (const { p, l } of typePatterns) {
      if (p.test(ogTitle + ogDesc)) { type = l; break }
    }

    const photos = ogImage ? [ogImage] : []

    return NextResponse.json({
      success: true,
      bien: {
        titre: ogTitle || type,
        type,
        prix,
        surface,
        pieces,
        chambres,
        ville,
        description: ogDesc || null,
        photos,
        dpe,
        source_url: url,
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
