'use client'

import { useState, useEffect } from 'react'

const LEAD_MAGNETS = [
  {
    id: 'guide_vendeur',
    titre: 'Guide vendeur 2026',
    description: 'Les étapes clés pour vendre son bien rapidement et au meilleur prix',
  },
  {
    id: 'checklist_estimation',
    titre: 'Checklist estimation',
    description: 'Découvrez où se situe votre bien sur le marché',
  },
]

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
  const [ressources, setRessources] = useState<any[]>([])
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [tab, setTab] = useState<'biens' | 'ressources' | 'leads'>('biens')
  const [leads, setLeads] = useState<any[]>([])

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? match[2] : null
    }
    const id = getCookie('kodeoo_agent_id')
    const slug = getCookie('kodeoo_slug')
    if (!id) { setNotFound(true); return }
    setAgentId(id)
    setAgentSlug(slug)
    loadBiens(id)
    loadRessources(id)
    loadLeads(id)
  }, [])

  const loadBiens = async (id: string) => {
    const res = await fetch(`/api/biens?agent_id=${id}`)
    const data = await res.json()
    if (data.success) setBiens(data.biens)
  }

  const loadRessources = async (id: string) => {
    const res = await fetch(`/api/ressources?agent_id=${id}`)
    const data = await res.json()
    if (data.success) setRessources(data.ressources)
  }

  const loadLeads = async (id: string) => {
    const res = await fetch(`/api/leads?agent_id=${id}`)
    const data = await res.json()
    if (data.success) setLeads(data.leads)
  }

  const getRessource = (lm_id: string) => ressources.find(r => r.lead_magnet_id === lm_id)

  const toggleRessource = async (lm_id: string, actif: boolean) => {
    if (!agentId) return
    if (!actif) {
      await fetch('/api/ressources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, lead_magnet_id: lm_id })
      })
    } else {
      const fd = new FormData()
      fd.append('agent_id', agentId)
      fd.append('lead_magnet_id', lm_id)
      await fetch('/api/ressources', { method: 'POST', body: fd })
    }
    loadRessources(agentId)
  }

  const uploadPdf = async (lm_id: string, file: File) => {
    if (!agentId) return
    setUploadingId(lm_id)
    const fd = new FormData()
    fd.append('agent_id', agentId)
    fd.append('lead_magnet_id', lm_id)
    fd.append('file', file)
    await fetch('/api/ressources', { method: 'POST', body: fd })
    await loadRessources(agentId)
    setUploadingId(null)
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
        alert(`✅ ${data.importes} biens importés !`)
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
      if (data.success) { setPreview(null); setUrl(''); loadBiens(agentId) }
      else alert('Erreur : ' + data.error)
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

  if (notFound) return (
    <div style={{fontFamily:'system-ui,sans-serif',maxWidth:480,margin:'80px auto',padding:'0 16px',textAlign:'center'}}>
      <div style={{fontSize:40,marginBottom:16}}>🔒</div>
      <div style={{fontSize:20,fontWeight:600,color:'#0D0D12',marginBottom:8}}>Accès non autorisé</div>
      <div style={{fontSize:14,color:'#6B6B80',marginBottom:24}}>Connectez-vous depuis votre espace membre Kodeoo.</div>
      <a href="https://kodeoo.fr/espace-membre" style={{display:'inline-flex',alignItems:'center',height:42,padding:'0 20px',background:'#1C1C1E',color:'#fff',borderRadius:9,textDecoration:'none',fontSize:13,fontWeight:500}}>
        Retour sur Kodeoo →
      </a>
    </div>
  )

  if (!agentId) return (
    <div style={{fontFamily:'system-ui,sans-serif',maxWidth:480,margin:'80px auto',padding:'0 16px',textAlign:'center',color:'#8E8E93',fontSize:14}}>
      Chargement...
    </div>
  )

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F5F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
        .wrap{max-width:680px;margin:0 auto;padding:0 0 80px}
        .topbar{background:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #EBEBEB;position:sticky;top:0;z-index:10}
        .logo{display:flex;align-items:center;gap:7px;text-decoration:none}
        .logo-k{width:26px;height:26px;background:#1C1C1E;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff}
        .logo-name{font-size:14px;font-weight:600;color:#1C1C1E}
        .view-link{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;background:#F5F5F0;border:1px solid #E0E0DB;border-radius:20px;font-size:12px;font-weight:500;color:#1C1C1E;text-decoration:none}
        .tabs{display:flex;background:#fff;border-bottom:1px solid #EBEBEB;padding:0 16px}
        .tab{padding:12px 16px;font-size:13px;font-weight:500;color:#8E8E93;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s}
        .tab.on{color:#1C1C1E;border-bottom-color:#1C1C1E;font-weight:600}
        .content{padding:16px}
        .card{background:#fff;border:1px solid #EBEBEB;border-radius:12px;padding:18px;margin-bottom:12px}
        .card-title{font-size:13px;font-weight:600;color:#1C1C1E;margin-bottom:4px}
        .card-sub{font-size:12px;color:#8E8E93;margin-bottom:14px}
        .input-row{display:flex;gap:8px}
        .inp{flex:1;height:40px;background:#F5F5F0;border:1px solid #E0E0DB;border-radius:8px;padding:0 12px;font-family:inherit;font-size:13px;color:#1C1C1E;outline:none}
        .inp:focus{border-color:#1C1C1E;background:#fff}
        .inp::placeholder{color:#C7C7CC}
        .btn-black{height:40px;padding:0 16px;background:#1C1C1E;color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px}
        .btn-black:disabled{opacity:0.5;cursor:not-allowed}
        .btn-outline{height:40px;padding:0 16px;background:#fff;color:#1C1C1E;border:1.5px solid #1C1C1E;border-radius:8px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px}
        .hint{font-size:11px;color:#C7C7CC;margin-top:7px}
        .preview-box{background:#F0EEFF;border:1px solid #D4CCFF;border-radius:10px;padding:14px;margin-top:12px}
        .preview-title{font-size:12px;font-weight:600;color:#5B4BD5;margin-bottom:10px}
        .preview-grid{display:grid;grid-template-columns:72px 1fr;gap:10px;align-items:start}
        .preview-img{width:72px;height:72px;border-radius:7px;overflow:hidden;background:#E0DCFF;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
        .preview-img img{width:100%;height:100%;object-fit:cover}
        .preview-name{font-size:13px;font-weight:600;color:#1C1C1E;margin-bottom:5px;line-height:1.3}
        .specs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px}
        .spec{font-size:11px;color:#6B6B80;background:#fff;padding:2px 7px;border-radius:5px;border:1px solid #E0E0DB}
        .prix-row{display:flex;align-items:center;gap:7px;margin-bottom:8px}
        .prix-inp{height:32px;background:#fff;border:1px solid #D4CCFF;border-radius:6px;padding:0 9px;font-family:inherit;font-size:13px;font-weight:600;color:#1C1C1E;outline:none;width:120px}
        .action-row{display:flex;gap:6px}
        .btn-save{height:32px;padding:0 14px;background:#1C1C1E;color:#fff;border:none;border-radius:6px;font-family:inherit;font-size:12px;font-weight:500;cursor:pointer}
        .btn-cancel{height:32px;padding:0 10px;background:#fff;color:#6B6B80;border:1px solid #E0E0DB;border-radius:6px;font-family:inherit;font-size:12px;cursor:pointer}
        .biens-list{display:flex;flex-direction:column;gap:8px}
        .bien-item{display:flex;align-items:center;gap:10px;padding:10px;background:#F9F9F9;border-radius:9px}
        .bien-thumb{width:48px;height:48px;border-radius:6px;overflow:hidden;background:#EBEBEB;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px}
        .bien-thumb img{width:100%;height:100%;object-fit:cover}
        .bien-info{flex:1;min-width:0}
        .bien-name{font-size:13px;font-weight:500;color:#1C1C1E;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .bien-meta{font-size:11px;color:#C7C7CC}
        .bien-price{font-size:13px;font-weight:600;color:#1C1C1E;white-space:nowrap;margin-right:6px}
        .btn-del{width:26px;height:26px;border-radius:50%;background:#fff;border:1px solid #EBEBEB;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#C7C7CC;font-size:14px;flex-shrink:0}
        .btn-del:hover{background:#FEE2E2;color:#EF4444}
        .empty{text-align:center;padding:24px;color:#C7C7CC;font-size:13px}
        .divider{height:1px;background:#EBEBEB;margin:14px 0}
        .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* Ressources */
        .lm-card{background:#fff;border:1px solid #EBEBEB;border-radius:12px;padding:16px;margin-bottom:10px}
        .lm-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
        .lm-info{flex:1}
        .lm-titre{font-size:14px;font-weight:600;color:#1C1C1E;margin-bottom:3px}
        .lm-desc{font-size:12px;color:#8E8E93;line-height:1.5}
        .toggle{width:44px;height:26px;border-radius:13px;border:none;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0}
        .toggle.on{background:#1C1C1E}
        .toggle.off{background:#E0E0DB}
        .toggle::after{content:'';position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)}
        .toggle.on::after{left:21px}
        .toggle.off::after{left:3px}
        .lm-status{font-size:11px;color:#8E8E93;margin-bottom:10px;display:flex;align-items:center;gap:6px}
        .lm-status.active{color:#34C759}
        .status-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0}
        .upload-zone{border:1.5px dashed #E0E0DB;border-radius:8px;padding:12px;text-align:center;cursor:pointer;transition:border-color 0.15s}
        .upload-zone:hover{border-color:#1C1C1E}
        .upload-label{font-size:12px;color:#8E8E93;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
        .upload-label input{display:none}
        .pdf-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;background:#F0FFF4;border:1px solid #BBF7D0;border-radius:6px;font-size:11px;font-weight:500;color:#166534}

        /* Leads */
        .lead-item{background:#fff;border:1px solid #EBEBEB;border-radius:10px;padding:14px;margin-bottom:8px}
        .lead-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}
        .lead-name{font-size:14px;font-weight:600;color:#1C1C1E}
        .lead-type{font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:#F5F5F0;color:#6B6B80}
        .lead-email{font-size:13px;color:#6B6B80;margin-bottom:3px}
        .lead-msg{font-size:12px;color:#8E8E93;line-height:1.5}
        .lead-date{font-size:11px;color:#C7C7CC;margin-top:6px}
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

        <div className="tabs">
          <div className={`tab ${tab === 'biens' ? 'on' : ''}`} onClick={() => setTab('biens')}>
            Mes biens {biens.length > 0 && `(${biens.length})`}
          </div>
          <div className={`tab ${tab === 'ressources' ? 'on' : ''}`} onClick={() => setTab('ressources')}>
            Ressources
          </div>
          <div className={`tab ${tab === 'leads' ? 'on' : ''}`} onClick={() => setTab('leads')}>
            Leads {leads.length > 0 && `(${leads.length})`}
          </div>
        </div>

        <div className="content">

          {/* ── BIENS ── */}
          {tab === 'biens' && (
            <>
              <div className="card">
                <div className="card-title">🚀 Import en masse</div>
                <div className="card-sub">Collez l'URL de votre page avec tous vos biens.</div>
                <div className="input-row">
                  <input className="inp" placeholder="https://www.iadfrance.fr/conseiller-immobilier/votre.nom" value={listUrl} onChange={e => setListUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && importAll()} />
                  <button className="btn-black" onClick={importAll} disabled={loadingAll || !listUrl}>
                    {loadingAll ? <span className="spinner"></span> : '⚡'}
                    {loadingAll ? 'Import...' : 'Tout importer'}
                  </button>
                </div>
                <div className="hint">✓ Compatible IAD France, Safti, sites d'agences</div>

                <div className="divider"></div>

                <div className="card-title">🔗 Import d'une annonce</div>
                <div className="card-sub">Collez le lien d'une annonce individuelle.</div>
                <div className="input-row">
                  <input className="inp" placeholder="https://www.iadfrance.fr/annonce/..." value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && scrape()} />
                  <button className="btn-black" onClick={scrape} disabled={loading || !url}>
                    {loading ? <span className="spinner"></span> : '🔍'}
                    {loading ? 'Scan...' : 'Importer'}
                  </button>
                </div>

                {preview && (
                  <div className="preview-box">
                    <div className="preview-title">✦ Bien récupéré — vérifiez le prix</div>
                    <div className="preview-grid">
                      <div className="preview-img">
                        {preview.photos?.[0] ? <img src={preview.photos[0]} alt="" /> : '🏠'}
                      </div>
                      <div>
                        <div className="preview-name">{preview.titre}</div>
                        <div className="specs">
                          {preview.ville && <span className="spec">📍 {preview.ville}</span>}
                          {preview.surface && <span className="spec">{preview.surface}m²</span>}
                          {preview.pieces && <span className="spec">{preview.pieces} pièces</span>}
                        </div>
                        <div className="prix-row">
                          <span style={{fontSize:12,color:'#8E8E93'}}>Prix (€) :</span>
                          <input className="prix-inp" type="number" placeholder="ex. 485000" value={preview.prix_saisi} onChange={e => setPreview((p: any) => ({ ...p, prix_saisi: e.target.value }))} />
                        </div>
                        <div className="action-row">
                          <button className="btn-save" onClick={saveBien} disabled={saving}>{saving ? 'Sauvegarde...' : '✓ Ajouter'}</button>
                          <button className="btn-cancel" onClick={() => { setPreview(null); setUrl('') }}>Annuler</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-title">🏠 Biens sur ma page <span style={{float:'right',fontSize:11,color:'#C7C7CC',fontWeight:400}}>{biens.length} bien{biens.length !== 1 ? 's' : ''}</span></div>
                <div className="biens-list" style={{marginTop:12}}>
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
                          <div className="bien-meta">{bien.ville}{bien.surface ? ` · ${bien.surface}m²` : ''}{bien.pieces ? ` · ${bien.pieces} p.` : ''}</div>
                        </div>
                        <div className="bien-price">{bien.prix ? bien.prix.toLocaleString('fr-FR') + ' €' : '–'}</div>
                        <button className="btn-del" onClick={() => deleteBien(bien.id)}>×</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── RESSOURCES ── */}
          {tab === 'ressources' && (
            <>
              <div style={{fontSize:13,color:'#8E8E93',marginBottom:14,lineHeight:1.6}}>
                Activez les ressources que vous souhaitez afficher sur votre page et uploadez votre PDF.
              </div>
              {LEAD_MAGNETS.map(lm => {
                const r = getRessource(lm.id)
                const isActive = r?.actif === true
                const hasPdf = !!r?.pdf_url
                return (
                  <div key={lm.id} className="lm-card">
                    <div className="lm-top">
                      <div className="lm-info">
                        <div className="lm-titre">{lm.titre}</div>
                        <div className="lm-desc">{lm.description}</div>
                      </div>
                      <button
                        className={`toggle ${isActive ? 'on' : 'off'}`}
                        onClick={() => toggleRessource(lm.id, !isActive)}
                      ></button>
                    </div>

                    {isActive && (
                      <>
                        <div className={`lm-status ${hasPdf ? 'active' : ''}`}>
                          <span className="status-dot"></span>
                          {hasPdf ? 'PDF uploadé — affiché sur votre page' : 'En attente de votre PDF'}
                        </div>

                        {hasPdf ? (
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                            <span className="pdf-badge">✓ PDF disponible</span>
                            <label className="upload-label" style={{cursor:'pointer',fontSize:12,color:'#8E8E93'}}>
                              Remplacer
                              <input type="file" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if(f) uploadPdf(lm.id, f) }} />
                            </label>
                          </div>
                        ) : (
                          <div className="upload-zone">
                            <label className="upload-label">
                              {uploadingId === lm.id ? '⏳ Upload en cours...' : '📎 Cliquez pour uploader votre PDF'}
                              <input type="file" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if(f) uploadPdf(lm.id, f) }} disabled={uploadingId === lm.id} />
                            </label>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* ── LEADS ── */}
          {tab === 'leads' && (
            <>
              {leads.length === 0 ? (
                <div className="empty" style={{paddingTop:40}}>Aucun lead pour le moment — partagez votre Kodeoo Link !</div>
              ) : (
                leads.map(lead => (
                  <div key={lead.id} className="lead-item">
                    <div className="lead-top">
                      <div className="lead-name">{lead.nom}</div>
                      <span className="lead-type">{lead.type}</span>
                    </div>
                    <div className="lead-email">✉️ {lead.email}</div>
                    {lead.telephone && <div className="lead-email">📞 {lead.telephone}</div>}
                    {lead.message && <div className="lead-msg">{lead.message}</div>}
                    {lead.lead_magnet && <div className="lead-msg" style={{marginTop:4}}>📄 {lead.lead_magnet}</div>}
                    <div className="lead-date">{new Date(lead.created_at).toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                ))
              )}
            </>
          )}

        </div>
      </div>
    </>
  )
}