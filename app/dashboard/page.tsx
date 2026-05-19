'use client'

import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [url, setUrl] = useState('')
  const [listUrl, setListUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAll, setLoadingAll] = useState(false)
  const [saving, setSaving] = useState(false)
  const [biens, setBiens] = useState<any[]>([])
  const [preview, setPreview] = useState<any>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [agentSlug, setAgentSlug] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Lire l'agent_id depuis le cookie
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? match[2] : null
    }

    const id = getCookie('kodeoo_agent_id')
    const slug = getCookie('kodeoo_slug')

    if (!id) {
      setNotFound(true)
      return
    }

    setAgentId(id)
    setAgentSlug(slug)
    loadBiens(id)
  }, [])

  const loadBiens = async (id: string) => {
    const res = await fetch(`/api/biens?agent_id=${id}`)
    const data = await res.json()
    if (data.success) setBiens(data.biens)
  }

  const scrape = async () => {
    if (!url.trim() || !agentId) return
    setLoading(true)
    setPreview(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      if (data.success) setPreview({ ...data.bien, prix_saisi: data.bien.prix || '' })
      else alert('Erreur : ' + data.error)
    } catch { alert('Erreur réseau') }
    setLoading(false)
  }

  const importAll = async () => {
    if (!listUrl.trim() || !agentId) return
    setLoadingAll(true)
    try {
      const res = await fetch('/api/import-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, list_url: listUrl })
      })
      const data = await res.json()
      if (data.success) {
        alert(`✅ ${data.importes} biens importés automatiquement !`)
        setListUrl('')
        loadBiens(agentId)
      } else alert('Erreur : ' + data.error)
    } catch { alert('Erreur réseau') }
    setLoadingAll(false)
  }

  const saveBien = async () => {
    if (!preview || !agentId) return
    setSaving(true)
    try {
      const res = await fetch('/api/biens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          titre: preview.titre,
          prix: preview.prix_saisi ? parseInt(String(preview.prix_saisi)) : null,
          surface: preview.surface,
          pieces: preview.pieces,
          chambres: preview.chambres,
          ville: preview.ville,
          description: preview.description,
          photos: preview.photos,
          dpe: preview.dpe,
          source_url: preview.source_url,
        })
      })
      const data = await res.json()
      if (data.success) {
        setPreview(null)
        setUrl('')
        loadBiens(agentId)
      } else alert('Erreur : ' + data.error)
    } catch { alert('Erreur réseau') }
    setSaving(false)
  }

  const deleteBien = async (bien_id: string) => {
    if (!agentId) return
    await fetch('/api/biens', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bien_id, agent_id: agentId })
    })
    loadBiens(agentId)
  }

  if (notFound) {
    return (
      <div style={{fontFamily:'system-ui,sans-serif',maxWidth:480,margin:'80px auto',padding:'0 16px',textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:16}}>🔒</div>
        <div style={{fontSize:20,fontWeight:600,color:'#0D0D12',marginBottom:8}}>Accès non autorisé</div>
        <div style={{fontSize:14,color:'#6B6B80',marginBottom:24}}>Connectez-vous depuis votre espace membre Kodeoo pour accéder à votre dashboard.</div>
        <a href="https://kodeoo.fr/espace-membre" style={{display:'inline-flex',alignItems:'center',height:42,padding:'0 20px',background:'#6347FF',color:'#fff',borderRadius:9,textDecoration:'none',fontSize:13,fontWeight:500}}>
          Retour sur Kodeoo →
        </a>
      </div>
    )
  }

  if (!agentId) {
    return (
      <div style={{fontFamily:'system-ui,sans-serif',maxWidth:480,margin:'80px auto',padding:'0 16px',textAlign:'center'}}>
        <div style={{fontSize:14,color:'#6B6B80'}}>Chargement...</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F7F7FA;font-family:system-ui,sans-serif}
        .wrap{max-width:680px;margin:0 auto;padding:28px 16px 80px}
        .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}
        .logo{display:flex;align-items:center;gap:8px;text-decoration:none}
        .logo-k{width:28px;height:28px;background:#6347FF;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff}
        .logo-name{font-size:15px;font-weight:600;color:#0D0D12}
        .view-link{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:#EEF0FF;border:1px solid rgba(99,71,255,0.2);border-radius:20px;font-size:12px;font-weight:500;color:#6347FF;text-decoration:none}
        .page-title{font-size:22px;font-weight:600;color:#0D0D12;margin-bottom:6px;letter-spacing:-0.02em}
        .page-sub{font-size:14px;color:#6B6B80;margin-bottom:24px}
        .card{background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;padding:20px;margin-bottom:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04)}
        .card-title{font-size:13px;font-weight:600;color:#0D0D12;margin-bottom:14px}
        .card-sub{font-size:12px;color:#A0A0B8;margin-bottom:12px}
        .import-row{display:flex;gap:8px}
        .import-input{flex:1;height:42px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.1);border-radius:9px;padding:0 13px;font-family:inherit;font-size:13px;color:#0D0D12;outline:none}
        .import-input:focus{border-color:rgba(99,71,255,0.4);background:#fff}
        .import-input::placeholder{color:#A0A0B8}
        .btn-import{height:42px;padding:0 18px;background:#6347FF;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px}
        .btn-import:disabled{opacity:0.6;cursor:not-allowed}
        .btn-import-all{height:42px;padding:0 18px;background:#00B37D;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px}
        .btn-import-all:disabled{opacity:0.6;cursor:not-allowed}
        .hint{font-size:11px;color:#A0A0B8;margin-top:8px}
        .preview{background:#F0EEFF;border:1px solid rgba(99,71,255,0.2);border-radius:12px;padding:16px;margin-top:14px}
        .preview-title{font-size:12px;font-weight:600;color:#6347FF;margin-bottom:10px}
        .preview-grid{display:grid;grid-template-columns:80px 1fr;gap:12px;align-items:start}
        .preview-img{width:80px;height:80px;border-radius:8px;overflow:hidden;background:#E0DCFF;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
        .preview-img img{width:100%;height:100%;object-fit:cover}
        .preview-info-title{font-size:13px;font-weight:600;color:#0D0D12;margin-bottom:6px;line-height:1.3}
        .specs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px}
        .spec{font-size:11px;color:#6B6B80;background:#fff;padding:3px 7px;border-radius:5px;border:1px solid rgba(0,0,0,0.07)}
        .prix-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
        .prix-label{font-size:12px;color:#6B6B80;white-space:nowrap}
        .prix-input{height:34px;background:#fff;border:1px solid rgba(99,71,255,0.3);border-radius:7px;padding:0 10px;font-family:inherit;font-size:13px;font-weight:600;color:#0D0D12;outline:none;width:130px}
        .preview-actions{display:flex;gap:7px}
        .btn-save{height:34px;padding:0 16px;background:#6347FF;color:#fff;border:none;border-radius:7px;font-family:inherit;font-size:12px;font-weight:500;cursor:pointer}
        .btn-save:disabled{opacity:0.6}
        .btn-cancel{height:34px;padding:0 12px;background:#fff;color:#6B6B80;border:1px solid rgba(0,0,0,0.1);border-radius:7px;font-family:inherit;font-size:12px;cursor:pointer}
        .biens-list{display:flex;flex-direction:column;gap:8px}
        .bien-item{display:flex;align-items:center;gap:12px;padding:12px;background:#F7F7FA;border-radius:10px}
        .bien-thumb{width:52px;height:52px;border-radius:7px;overflow:hidden;background:linear-gradient(135deg,#EEF0FF,#E0DCFF);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px}
        .bien-thumb img{width:100%;height:100%;object-fit:cover}
        .bien-info{flex:1;min-width:0}
        .bien-name{font-size:13px;font-weight:500;color:#0D0D12;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bien-meta{font-size:11px;color:#A0A0B8}
        .bien-price{font-size:13px;font-weight:600;color:#6347FF;white-space:nowrap;margin-right:8px}
        .bien-del{width:26px;height:26px;border-radius:50%;background:#fff;border:1px solid rgba(0,0,0,0.08);cursor:pointer;display:flex;align-items:center;justify-content:center;color:#A0A0B8;font-size:14px;flex-shrink:0}
        .bien-del:hover{background:#FEE2E2;color:#EF4444}
        .empty{text-align:center;padding:28px;color:#A0A0B8;font-size:13px}
        .spinner{width:15px;height:15px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .divider{height:1px;background:rgba(0,0,0,0.06);margin:14px 0}
      `}</style>

      <div className="wrap">
        <div className="topbar">
          <a className="logo" href="https://kodeoo.fr">
            <div className="logo-k">K</div>
            <span className="logo-name">Kodeoo</span>
          </a>
          {agentSlug && (
            <a className="view-link" href={`https://go.kodeoo.fr/${agentSlug}`} target="_blank">
              Voir ma page →
            </a>
          )}
        </div>

        <div className="page-title">Mes biens</div>
        <div className="page-sub">Importez vos annonces automatiquement sur votre Kodeoo Link.</div>

        <div className="card">
          <div className="card-title">🚀 Import en masse</div>
          <div className="card-sub">Collez l'URL de votre page "Nos biens" — tous vos biens sont importés automatiquement.</div>
          <div className="import-row">
            <input
              className="import-input"
              placeholder="https://www.iadfrance.fr/conseiller-immobilier/votre.nom ou votre site agence"
              value={listUrl}
              onChange={e => setListUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && importAll()}
            />
            <button className="btn-import-all" onClick={importAll} disabled={loadingAll || !listUrl}>
              {loadingAll ? <span className="spinner"></span> : '⚡'}
              {loadingAll ? 'Import...' : 'Tout importer'}
            </button>
          </div>
          <div className="hint">✓ Compatible IAD France, Safti, sites d'agences</div>

          <div className="divider"></div>

          <div className="card-title">🔗 Import d'une annonce</div>
          <div className="card-sub">Collez le lien d'une annonce individuelle.</div>
          <div className="import-row">
            <input
              className="import-input"
              placeholder="https://www.iadfrance.fr/annonce/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && scrape()}
            />
            <button className="btn-import" onClick={scrape} disabled={loading || !url}>
              {loading ? <span className="spinner"></span> : '🔍'}
              {loading ? 'Scan...' : 'Importer'}
            </button>
          </div>

          {preview && (
            <div className="preview">
              <div className="preview-title">✦ Bien récupéré — vérifiez et ajoutez le prix</div>
              <div className="preview-grid">
                <div className="preview-img">
                  {preview.photos?.[0] ? <img src={preview.photos[0]} alt="" /> : '🏠'}
                </div>
                <div>
                  <div className="preview-info-title">{preview.titre}</div>
                  <div className="specs">
                    {preview.ville && <span className="spec">📍 {preview.ville}</span>}
                    {preview.surface && <span className="spec">{preview.surface}m²</span>}
                    {preview.pieces && <span className="spec">{preview.pieces} pièces</span>}
                    {preview.chambres && <span className="spec">{preview.chambres} ch.</span>}
                  </div>
                  <div className="prix-row">
                    <span className="prix-label">Prix (€) :</span>
                    <input
                      className="prix-input"
                      type="number"
                      placeholder="ex. 485000"
                      value={preview.prix_saisi}
                      onChange={e => setPreview((p: any) => ({ ...p, prix_saisi: e.target.value }))}
                    />
                  </div>
                  <div className="preview-actions">
                    <button className="btn-save" onClick={saveBien} disabled={saving}>
                      {saving ? 'Sauvegarde...' : '✓ Ajouter à ma page'}
                    </button>
                    <button className="btn-cancel" onClick={() => { setPreview(null); setUrl('') }}>Annuler</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">🏠 Biens sur ma page <span style={{marginLeft:'auto',fontSize:11,color:'#A0A0B8',fontWeight:400,float:'right'}}>{biens.length} bien{biens.length !== 1 ? 's' : ''}</span></div>
          <div className="biens-list">
            {biens.length === 0 ? (
              <div className="empty">Aucun bien — importez vos annonces ci-dessus</div>
            ) : (
              biens.map(bien => (
                <div key={bien.id} className="bien-item">
                  <div className="bien-thumb">
                    {bien.photos?.[0] ? <img src={bien.photos[0]} alt="" /> : '🏠'}
                  </div>
                  <div className="bien-info">
                    <div className="bien-name">{bien.titre}</div>
                    <div className="bien-meta">{bien.ville}{bien.surface ? ` · ${bien.surface}m²` : ''}{bien.pieces ? ` · ${bien.pieces} pièces` : ''}</div>
                  </div>
                  <div className="bien-price">{bien.prix ? bien.prix.toLocaleString('fr-FR') + ' €' : '–'}</div>
                  <button className="bien-del" onClick={() => deleteBien(bien.id)}>×</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}