import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const url = body.url
    const mode = body.mode

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
    const baseUrl = new URL(url).origin

    if (mode === 'list') {
      const liens = new Set<string>()
      const allLinks = [...html.matchAll(/href="([^"#?][^"]*)"/gi)]
      for (const m of allLinks) {
        let lien = m[1]
        if (!lien) continue
        if (lien.startsWith('/')) lien = baseUrl + lien
        if (!lien.startsWith('http')) continue
        if (lien === url) continue
        if (lien.length < 30) continue
        if (/\.(css|js|png|jpg|svg|ico|pdf|woff)$/i.test(lien)) continue
        if (/contact|blog|actualit|equipe|team|about|mentions|politique|cookie|login|account/i.test(lien)) continue
        if (lien.includes(baseUrl)) liens.add(lien)
      }
      const liensArray = [...liens].slice(0, 50)
      return NextResponse.json({ success: true, mode: 'list', count: liensArray.length, liens: liensArray })
    }

    const getMeta = (prop: string): string => {
      const m = html.match(new RegExp('<meta[^>]*property="' + prop + '"[^>]*content="([^"]*)"', 'i'))
        || html.match(new RegExp('<meta[^>]*content="([^"]*)"[^>]*property="' + prop + '"', 'i'))
      return m ? m[1].trim() : ''
    }

    const getMetaName = (name: string): string => {
      const m = html.match(new RegExp('<meta[^>]*name="' + name + '"[^>]*content="([^"]*)"', 'i'))
        || html.match(new RegExp('<meta[^>]*content="([^"]*)"[^>]*name="' + name + '"', 'i'))
      return m ? m[1].trim() : ''
    }

    // Titre — priorité : <title> > og:title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const rawTitle = titleMatch ? titleMatch[1].trim() : ''
    const ogTitle = getMeta('og:title')
    const ogDesc = getMeta('og:description') || getMetaName('description')
    const ogImage = getMeta('og:image')

    // Nettoyer le titre
    let titre = rawTitle || ogTitle
    titre = titre.replace(/\s*[-|–]\s*(SeLoger|Leboncoin|PAP|Logic|BienIci|Figaro Immo|LeFigaro).*/i, '').trim()

    const fullText = titre + ' ' + ogDesc + ' ' + html.slice(0, 50000)

    // Prix — chercher le plus gros nombre avec € dans le titre ou contenu
    let prix: number | null = null
    const prixMatches = [...fullText.matchAll(/(\d[\d\s]{2,8})\s*€/g)]
    for (const m of prixMatches) {
      const n = parseInt(m[1].replace(/\s/g, ''))
      if (n >= 30000 && n <= 50000000) {
        prix = n
        break
      }
    }
    // Fallback : chercher dans le titre directement
    if (!prix) {
      const prixTitre = titre.match(/(\d[\d\s]{2,8})\s*[€$]/)
      if (prixTitre) {
        const n = parseInt(prixTitre[1].replace(/\s/g, ''))
        if (n >= 30000 && n <= 50000000) prix = n
      }
    }

    // Surface
    const surfaceMatch = fullText.match(/(\d+(?:[.,]\d+)?)\s*m²/i)
    const surface = surfaceMatch ? parseFloat(surfaceMatch[1].replace(',', '.')) : null

    // Pièces
    const piecesMatch = fullText.match(/(\d+)\s*pi[eè]ces?/i) || fullText.match(/T(\d)\b/) || fullText.match(/F(\d)\b/)
    const pieces = piecesMatch ? parseInt(piecesMatch[1]) : null

    // Chambres
    const chambresMatch = fullText.match(/(\d+)\s*chambre/i) || fullText.match(/chambre[^:]*:\s*(\d+)/i)
    const chambres = chambresMatch ? parseInt(chambresMatch[1]) : null

    // DPE
    const dpeMatch = fullText.match(/DPE\s*:?\s*([A-G])\b/i)
    const dpe = dpeMatch ? dpeMatch[1].toUpperCase() : null

    // Ville — extraire depuis le titre en priorité, puis l'URL
    let ville = ''

    // 1. Depuis le titre : "À vendre Maison Golfe-Juan 375 m²" → "Golfe-Juan"
    // Pattern : mot(s) capitalisés après "vente|vendre|louer|location|maison|appartement|villa|studio"
    const villeTitreMatch = titre.match(/(?:vente|vendre|louer|location)\s+(?:maison|appartement|villa|studio|loft|terrain)?\s*([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\s-]{2,25?})\s+\d/i)
      || titre.match(/(?:maison|appartement|villa|studio|loft)\s+([A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ-]{2,25})\s+\d/i)
    if (villeTitreMatch) {
      ville = villeTitreMatch[1].trim()
      // Supprimer le type de bien s'il est inclus dans la ville
      ville = ville.replace(/^(maison|appartement|villa|studio|loft)\s+/i, '').trim()
    }

    // 2. Depuis l'URL : /a-vendre-maison-golfe-juan-375-m → "Golfe-Juan"
    if (!ville) {
      const urlPath = new URL(url).pathname
      const urlVilleMatch = urlPath.match(/(?:vente|vendre|louer|location|maison|appartement|villa|studio|achat)-([a-z-]+?)-(?:\d|m-|\d{2,4}-)/)
      if (urlVilleMatch) {
        ville = urlVilleMatch[1].split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
      }
    }

    // 3. Depuis le breadcrumb HTML
    if (!ville) {
      const breadcrumbMatch = html.match(/(?:breadcrumb|fil-ariane)[^>]*>[\s\S]*?<[^>]+>([^<]{3,30})<\/[^>]+>[\s\S]*?<[^>]+>([^<]{3,30})<\/[^>]+>/i)
      if (breadcrumbMatch) {
        const candidate = breadcrumbMatch[2].trim()
        if (candidate && !/accueil|home|acheter|vendre|louer/i.test(candidate)) {
          ville = candidate
        }
      }
    }

    // Photos — récupérer toutes les images de la page
    const photos: string[] = []
    if (ogImage) photos.push(ogImage)

    // Images depuis les balises <img> avec URLs absolues ou relatives
    const imgMatches = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)]
    for (const m of imgMatches) {
      let src = m[1]
      if (src.startsWith('/')) src = baseUrl + src
      if (!src.startsWith('http')) continue
      if (/logo|icon|sprite|blank|placeholder|avatar|thumb/i.test(src)) continue
      if (src.endsWith('.svg') || src.endsWith('.gif')) continue
      if (photos.includes(src)) continue
      // Privilégier les images de grande taille (show, large, big, full, 1920)
      if (/show|large|big|full|1920|800|1200/i.test(src)) photos.unshift(src)
      else photos.push(src)
    }

    // Liens href vers images (certains sites mettent les grandes images dans des liens)
    const aImgMatches = [...html.matchAll(/href="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)]
    for (const m of aImgMatches) {
      let src = m[1]
      if (src.startsWith('/')) src = baseUrl + src
      if (!src.startsWith('http')) continue
      if (photos.includes(src)) continue
      if (/show|large|1920/i.test(src)) photos.unshift(src)
      else photos.push(src)
    }

    const uniquePhotos = [...new Set(photos)].slice(0, 20)

    // Type de bien
    const typePatterns = [
      { p: /appartement/i, l: 'Appartement' },
      { p: /maison/i, l: 'Maison' },
      { p: /studio/i, l: 'Studio' },
      { p: /villa/i, l: 'Villa' },
      { p: /loft/i, l: 'Loft' },
      { p: /terrain/i, l: 'Terrain' },
      { p: /local\s+commercial/i, l: 'Local commercial' },
    ]
    let type = 'Bien immobilier'
    for (const { p, l } of typePatterns) {
      if (p.test(titre + ' ' + ogDesc)) { type = l; break }
    }

    return NextResponse.json({
      success: true,
      bien: {
        titre: titre || type,
        type,
        prix,
        surface,
        pieces,
        chambres,
        ville,
        description: ogDesc || null,
        photos: uniquePhotos,
        dpe,
        source_url: url
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}