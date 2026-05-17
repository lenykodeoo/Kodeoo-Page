import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL manquante' }, { status: 400 })

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      }
    })

    if (!response.ok) return NextResponse.json({ error: 'Page inaccessible' }, { status: 400 })

    const html = await response.text()

    // ── 1. OPEN GRAPH ──
    const getMeta = (prop: string): string => {
      const m = html.match(new RegExp(`<meta[^>]*property=["\']${prop}["\'][^>]*content=["\']([^"\']*)["\']`, 'i'))
        || html.match(new RegExp(`<meta[^>]*content=["\']([^"\']*)["\'][^>]*property=["\']${prop}["\']`, 'i'))
        || html.match(new RegExp(`<meta[^>]*name=["\']${prop}["\'][^>]*content=["\']([^"\']*)["\']`, 'i'))
      return m ? m[1].trim() : ''
    }

    const ogTitle = getMeta('og:title').replace(/\s*[-|·|–]\s*(SeLoger|Leboncoin|PAP|Logic|BienIci|Orpi|Century).*/i, '').trim()
    const ogDesc = getMeta('og:description')
    const ogImage = getMeta('og:image')

    // Toutes les images OG
    const allOgImages = [...html.matchAll(/<meta[^>]*property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']|<meta[^>]*content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']/gi)]
      .map(m => m[1] || m[2])
      .filter(Boolean)
      .slice(0, 8)

    // ── 2. JSON-LD ──
    let jsonLdData: any = {}
    const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>([\s\S]*?)<\/script>/gi)]
    for (const match of jsonLdMatches) {
      try {
        const parsed = JSON.parse(match[1])
        const data = Array.isArray(parsed) ? parsed[0] : parsed
        if (data['@type'] === 'RealEstateListing' || data.price || data.offers || data.floorSize) {
          jsonLdData = data
          break
        }
      } catch {}
    }

    // ── 3. EXTRACTION INTELLIGENTE ──
    const fullText = ogTitle + ' ' + ogDesc + ' ' + html.slice(0, 50000)

    // Prix
    let prix: number | null = null
    if (jsonLdData.price) {
      prix = parseInt(String(jsonLdData.price).replace(/\D/g, ''))
    } else if (jsonLdData.offers?.price) {
      prix = parseInt(String(jsonLdData.offers.price).replace(/\D/g, ''))
    } else {
      const prixPatterns = [
        /(\d[\d\s]{2,8})\s*€/g,
        /prix[^0-9]*(\d[\d\s]{2,8})/gi,
        /"price"\s*:\s*"?(\d+)"?/g,
        /(\d{3,7})\s*000\s*€/g,
      ]
      for (const pattern of prixPatterns) {
        const matches = [...fullText.matchAll(pattern)]
        for (const m of matches) {
          const n = parseInt(m[1].replace(/\s/g, ''))
          if (n >= 30000 && n <= 10000000) { prix = n; break }
        }
        if (prix) break
      }
    }

    // Surface
    let surface: number | null = null
    if (jsonLdData.floorSize?.value) {
      surface = parseFloat(jsonLdData.floorSize.value)
    } else {
      const surfacePatterns = [
        /(\d+(?:[.,]\d+)?)\s*m²/gi,
        /surface[^0-9]*(\d+)/gi,
        /"floorSize"[^0-9]*(\d+)/gi,
      ]
      for (const pattern of surfacePatterns) {
        const m = fullText.match(pattern)
        if (m) {
          const n = parseFloat(m[0].replace(/[^0-9.,]/g, '').replace(',', '.'))
          if (n >= 9 && n <= 2000) { surface = n; break }
        }
      }
    }

    // Pièces
    let pieces: number | null = null
    if (jsonLdData.numberOfRooms) {
      pieces = parseInt(jsonLdData.numberOfRooms)
    } else {
      const piecesPatterns = [
        /(\d+)\s*pièces?/gi,
        /(\d+)\s*rooms?/gi,
        /"numberOfRooms"[^0-9]*(\d+)/gi,
        /T(\d)\b/g,
        /F(\d)\b/g,
      ]
      for (const pattern of piecesPatterns) {
        const m = fullText.match(pattern)
        if (m) {
          const n = parseInt(m[0].replace(/\D/g, ''))
          if (n >= 1 && n <= 20) { pieces = n; break }
        }
      }
    }

    // Chambres
    let chambres: number | null = null
    if (jsonLdData.numberOfBedrooms) {
      chambres = parseInt(jsonLdData.numberOfBedrooms)
    } else {
      const chambresMatch = fullText.match(/(\d+)\s*chambre/gi)
      if (chambresMatch) {
        const n = parseInt(chambresMatch[0].replace(/\D/g, ''))
        if (n >= 1 && n <= 15) chambres = n
      }
    }

    // DPE
    let dpe: string | null = null
    const dpeMatch = fullText.match(/DPE\s*:?\s*([A-G])\b|classe\s+énergie\s*:?\s*([A-G])\b|"dpe"\s*:\s*"([A-G])"/i)
    if (dpeMatch) dpe = (dpeMatch[1] || dpeMatch[2] || dpeMatch[3]).toUpperCase()

    // GES
    let ges: string | null = null
    const gesMatch = fullText.match(/GES\s*:?\s*([A-G])\b|"ges"\s*:\s*"([A-G])"/i)
    if (gesMatch) ges = (gesMatch[1] || gesMatch[2]).toUpperCase()

    // Ville
    let ville = ''
    let quartier: string | null = null
    if (jsonLdData.address?.addressLocality) {
      ville = jsonLdData.address.addressLocality
      quartier = jsonLdData.address.addressRegion || null
    } else {
      const villesListe = ['paris','lyon','marseille','bordeaux','nantes','toulouse','nice','rennes','lille','strasbourg','montpellier','grenoble','tours','nîmes','rouen','reims','saint-étienne','toulon','angers','dijon','brest','le havre','aix-en-provence','clermont-ferrand','amiens','limoges','villeurbanne','metz','besançon','perpignan']
      for (const v of villesListe) {
        if (url.toLowerCase().includes(v) || (ogTitle + ogDesc).toLowerCase().includes(v)) {
          ville = v.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
          break
        }
      }
    }

    // Type de bien
    let typeBien = 'Bien immobilier'
    const typePatterns = [
      { pattern: /appartement/i, label: 'Appartement' },
      { pattern: /maison/i, label: 'Maison' },
      { pattern: /studio/i, label: 'Studio' },
      { pattern: /villa/i, label: 'Villa' },
      { pattern: /loft/i, label: 'Loft' },
      { pattern: /terrain/i, label: 'Terrain' },
      { pattern: /local\s+commercial/i, label: 'Local commercial' },
      { pattern: /bureau/i, label: 'Bureau' },
    ]
    for (const { pattern, label } of typePatterns) {
      if (pattern.test(ogTitle + ogDesc)) { typeBien = label; break }
    }

    // Titre propre
    let titre = ogTitle || typeBien
    if (!titre || titre.length < 5) titre = `${typeBien}${surface ? ` ${surface}m²` : ''}${ville ? ` - ${ville}` : ''}`

    // Photos
    const photos: string[] = []
    if (allOgImages.length > 0) photos.push(...allOgImages)
    
    // Cherche d'autres images dans le HTML
    const imgMatches = [...html.matchAll(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)[^"'\s]*/gi)]
    for (const m of imgMatches) {
      const imgUrl = m[0].split('?')[0]
      if (!photos.includes(imgUrl) && !imgUrl.includes('logo') && !imgUrl.includes('icon') && !imgUrl.includes('avatar')) {
        photos.push(imgUrl)
        if (photos.length >= 10) break
      }
    }

    const bien = {
      titre,
      type: typeBien,
      prix,
      surface,
      pieces,
      chambres,
      ville,
      quartier,
      description: ogDesc || null,
      photos: photos.slice(0, 10),
      dpe,
      ges,
      source_url: url,
    }

    return NextResponse.json({ success: true, bien })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}