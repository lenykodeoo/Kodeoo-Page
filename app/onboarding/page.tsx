'use client'

import { useState } from 'react'

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [type, setType] = useState<'conseiller' | 'agence' | null>(null)
  const [loading, setLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [slug, setSlug] = useState('')
  const [agentId, setAgentId] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'liste' | 'unitaire'>('liste')
  const [importUrl, setImportUrl] = useState('')
  const [importUrls, setImportUrls] = useState<string[]>([''])
  const [importDone, setImportDone] = useState(false)
  const [importCount, setImportCount] = useState(0)

  const [form, setForm] = useState({
    prenom: '', nom: '', nom_agence: '', email: '', telephone: '',
    ville: '', bio: '', reseau_agence: '',
    instagram: '', tiktok: '', facebook: '', linkedin: '', youtube: '', site_web: '',
    biens_vendus: '', experience: '', google_rating: '',
  })

  const update = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }))

  const slugPreview = () => {
    const base = type === 'agence' ? form.nom_agence : `${form.prenom} ${form.nom}`
    return base.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handlePhoto = (file: File) => {
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = e => setPhotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

 const publish = async () => {
    setLoading(true)
    try {
      const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
        return match ? match[2] : null
      }
      const memberId = getCookie('kodeoo_member_id') || 'member_' + Date.now()

      const payload = type === 'agence' ? {
        kodeoo_member_id: memberId, type: 'agence',
        prenom: '', nom: form.nom_agence, email: form.email,
        telephone: form.telephone, reseau: form.nom_agence, ville: form.ville, bio: form.bio,
        instagram: form.instagram, tiktok: form.tiktok, facebook: form.facebook,
        linkedin: form.linkedin, youtube: form.youtube, site_web: form.site_web,
      } : {
        kodeoo_member_id: memberId, type: 'conseiller',
        prenom: form.prenom, nom: form.nom, email: form.email,
        telephone: form.telephone, reseau: form.reseau_agence, ville: form.ville, bio: form.bio,
        instagram: form.instagram, tiktok: form.tiktok, facebook: form.facebook,
        linkedin: form.linkedin, youtube: form.youtube, site_web: form.site_web,
      }

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!data.success) { alert('Erreur : ' + data.error); setLoading(false); return }

      const newAgentId = data.agent.id
      const newSlug = data.agent.slug
      setAgentId(newAgentId)
      setSlug(newSlug)

      // Preuves sociales
      if (form.biens_vendus || form.experience || form.google_rating) {
        await fetch('/api/agent-profil', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agent_id: newAgentId,
            biens_vendus: form.biens_vendus,
            experience: form.experience,
            google_rating: form.google_rating,
            bio: form.bio,
          })
        })
      }

      // Upload photo
      if (photoFile) {
        const fd = new FormData()
        fd.append('agent_id', newAgentId)
        fd.append('file', photoFile)
        await fetch('/api/upload-photo', { method: 'POST', body: fd })
      }

      // Slug WordPress
      const secret = 'kodeoo-secret-2026'
      const token = btoa(memberId + ':' + secret).slice(0, 32)
      try {
        await fetch('https://kodeoo.fr/wp-admin/admin-ajax.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ action: 'kodeoo_save_slug', member_id: memberId, slug: newSlug, token })
        })
      } catch {}

      // Import biens si URL fournie
      if (importUrl && importMode === 'liste') {
        setImportLoading(true)
        try {
          const importRes = await fetch('/api/import-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: newAgentId, list_url: importUrl })
          })
          const importData = await importRes.json()
          if (importData.success) { setImportCount(importData.importes); setImportDone(true) }
        } catch {}
        setImportLoading(false)
      }

      if (importMode === 'unitaire' && importUrls.filter(u => u.trim()).length > 0) {
        setImportLoading(true)
        let count = 0
        for (const url of importUrls.filter(u => u.trim())) {
          try {
            const scrapeRes = await fetch('/api/scrape', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url })
            })
            const scrapeData = await scrapeRes.json()
            if (scrapeData.success) {
              await fetch('/api/biens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agent_id: newAgentId, ...scrapeData.bien })
              })
              count++
            }
          } catch {}
        }
        setImportCount(count)
        setImportDone(true)
        setImportLoading(false)
      }

      setStep(5)
    } catch (e) {
      alert('Erreur réseau')
    }
    setLoading(false)
  }

  const steps = ['Type', 'Profil', 'Preuves', 'Réseaux', 'Biens']

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F5F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1C1C1E}
        .wrap{max-width:580px;margin:0 auto;padding:24px 16px 80px}
        .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px}
        .logo{display:flex;align-items:center;gap:8px;text-decoration:none}
        .logo-k{width:26px;height:26px;background:#1C1C1E;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff}
        .logo-name{font-size:15px;font-weight:700;color:#1C1C1E}
        .url-badge{padding:5px 12px;background:#fff;border:1px solid #E8E8E8;border-radius:20px;font-size:12px;color:#6B6B80}
        .progress{display:flex;align-items:center;gap:0;margin-bottom:28px}
        .prog-step{display:flex;align-items:center;gap:0;flex:1}
        .prog-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;transition:all 0.2s}
        .prog-dot.done{background:#1C1C1E;color:#fff}
        .prog-dot.active{background:#1C1C1E;color:#fff;box-shadow:0 0 0 4px rgba(28,28,30,0.12)}
        .prog-dot.todo{background:#fff;border:1.5px solid #E0E0DB;color:#C7C7CC}
        .prog-line{flex:1;height:1.5px;background:#E0E0DB}
        .prog-line.done{background:#1C1C1E}
        .eyebrow{font-size:11px;font-weight:600;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px}
        .title{font-size:26px;font-weight:700;color:#1C1C1E;margin-bottom:6px;letter-spacing:-0.5px;line-height:1.2}
        .sub{font-size:14px;color:#6B6B80;line-height:1.6;margin-bottom:24px}
        .card{background:#fff;border:1px solid #E8E8E8;border-radius:12px;padding:22px;margin-bottom:14px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .field{margin-bottom:12px}
        .field.full{grid-column:1/-1}
        .field label{display:block;font-size:11px;font-weight:600;color:#8E8E93;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px}
        .field input,.field textarea,.field select{width:100%;height:42px;background:#F9F9F9;border:1px solid #E8E8E8;border-radius:8px;padding:0 12px;font-family:inherit;font-size:14px;color:#1C1C1E;outline:none;-webkit-appearance:none;transition:border-color 0.15s}
        .field input:focus,.field textarea:focus{border-color:#1C1C1E;background:#fff}
        .field textarea{height:80px;padding:10px 12px;resize:none;line-height:1.5}
        .field input::placeholder,.field textarea::placeholder{color:#C7C7CC}
        .type-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px}
        .type-opt{padding:22px 16px;border:1.5px solid #E8E8E8;border-radius:10px;cursor:pointer;text-align:center;background:#fff;transition:all 0.18s}
        .type-opt:hover{border-color:#1C1C1E}
        .type-opt.on{background:#1C1C1E;border-color:#1C1C1E}
        .type-icon{font-size:30px;margin-bottom:10px}
        .type-name{font-size:15px;font-weight:600;color:#1C1C1E;margin-bottom:4px}
        .type-opt.on .type-name{color:#fff}
        .type-desc{font-size:12px;color:#8E8E93;line-height:1.4}
        .type-opt.on .type-desc{color:rgba(255,255,255,0.6)}
        .social-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#F9F9F9;border:1px solid #E8E8E8;border-radius:8px;margin-bottom:8px;transition:border-color 0.15s}
        .social-row:focus-within{border-color:#1C1C1E;background:#fff}
        .social-label{font-size:12px;font-weight:600;color:#1C1C1E;white-space:nowrap;min-width:80px}
        .social-prefix{font-size:12px;color:#C7C7CC;white-space:nowrap}
        .social-inp{flex:1;border:none;background:none;font-family:inherit;font-size:13px;color:#1C1C1E;outline:none}
        .social-inp::placeholder{color:#C7C7CC}
        .nav{display:flex;align-items:center;justify-content:space-between;margin-top:24px;padding-top:20px;border-top:1px solid #F0F0F0}
        .btn-back{height:40px;padding:0 16px;background:#fff;border:1px solid #E8E8E8;border-radius:8px;font-family:inherit;font-size:13px;font-weight:500;color:#6B6B80;cursor:pointer}
        .btn-next{height:44px;padding:0 24px;background:#1C1C1E;color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background 0.15s}
        .btn-next:hover{background:#2C2C2E}
        .btn-next:disabled{opacity:0.4;cursor:not-allowed}
        .btn-skip{height:40px;padding:0 16px;background:#fff;border:1px solid #E8E8E8;border-radius:8px;font-family:inherit;font-size:13px;font-weight:500;color:#8E8E93;cursor:pointer}
        .photo-upload{display:flex;align-items:center;gap:16px;margin-bottom:20px}
        .photo-circle{width:72px;height:72px;border-radius:50%;background:#F0F0F0;border:2px solid #E8E8E8;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0}
        .photo-circle img{width:100%;height:100%;object-fit:cover}
        .btn-photo{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;background:#F5F5F0;border:1px solid #E8E8E8;border-radius:7px;font-family:inherit;font-size:12px;font-weight:500;color:#1C1C1E;cursor:pointer}
        .proof-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
        .import-tabs{display:flex;gap:0;margin-bottom:16px;background:#F5F5F0;border-radius:8px;padding:3px}
        .import-tab{flex:1;height:34px;border:none;border-radius:6px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s;background:none;color:#8E8E93}
        .import-tab.on{background:#fff;color:#1C1C1E;font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,0.08)}
        .inp-full{width:100%;height:42px;background:#F9F9F9;border:1px solid #E8E8E8;border-radius:8px;padding:0 12px;font-family:inherit;font-size:14px;color:#1C1C1E;outline:none}
        .inp-full:focus{border-color:#1C1C1E;background:#fff}
        .inp-full::placeholder{color:#C7C7CC}
        .url-add{display:flex;gap:8px;margin-bottom:8px}
        .btn-add-url{height:42px;padding:0 14px;background:#fff;border:1.5px solid #1C1C1E;border-radius:8px;font-family:inherit;font-size:13px;font-weight:500;color:#1C1C1E;cursor:pointer;white-space:nowrap}
        .import-success{background:#F0FFF4;border:1px solid #BBF7D0;border-radius:10px;padding:16px;text-align:center;margin-top:12px}
        .success-wrap{text-align:center;padding:32px 16px}
        .success-icon{width:72px;height:72px;border-radius:50%;background:#F0F0F0;border:2px solid #E8E8E8;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px}
        .success-title{font-size:26px;font-weight:700;color:#1C1C1E;margin-bottom:8px;letter-spacing:-0.5px}
        .success-sub{font-size:14px;color:#6B6B80;line-height:1.6;margin-bottom:24px}
        .url-copy{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;background:#fff;border:1.5px solid #1C1C1E;border-radius:8px;font-size:14px;font-weight:600;color:#1C1C1E;margin-bottom:16px;cursor:pointer}
        .btn-voir{display:inline-flex;align-items:center;gap:7px;height:48px;padding:0 28px;background:#1C1C1E;color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none}
        .next-steps{margin-top:24px;background:#F9F9F9;border:1px solid #E8E8E8;border-radius:10px;padding:18px;text-align:left}
        .ns-label{font-size:11px;font-weight:600;color:#8E8E93;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px}
        .ns-item{display:flex;align-items:center;gap:10px;font-size:13px;color:#6B6B80;margin-bottom:8px}
        .ns-num{width:22px;height:22px;border-radius:50%;background:#1C1C1E;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0}
      `}</style>

      <div className="wrap">
        <div className="topbar">
          <a className="logo" href="https://kodeoo.fr">
            <div className="logo-k">K</div>
            <span className="logo-name">Kodeoo</span>
          </a>
          {slugPreview() && step > 0 && step < 5 && (
            <div className="url-badge">go.kodeoo.fr/{slugPreview()}</div>
          )}
        </div>

        {step > 0 && step < 5 && (
          <div className="progress">
            {steps.map((s, i) => (
              <div key={i} className="prog-step">
                <div className={`prog-dot ${i < step ? 'done' : i === step ? 'active' : 'todo'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`prog-line ${i < step ? 'done' : ''}`}></div>}
              </div>
            ))}
          </div>
        )}

        {/* ÉTAPE 0 — Type */}
        {step === 0 && (
          <>
            <div className="eyebrow">Bienvenue</div>
            <div className="title">Vous êtes...</div>
            <div className="sub">Choisissez votre profil pour personnaliser votre Kodeoo Link.</div>
            <div className="type-grid">
              <div className={`type-opt ${type === 'conseiller' ? 'on' : ''}`} onClick={() => setType('conseiller')}>
                <div className="type-icon">👤</div>
                <div className="type-name">Conseiller Immobilier</div>
                <div className="type-desc">Vous êtes agent indépendant au sein d'un réseau ou d'une agence</div>
              </div>
              <div className={`type-opt ${type === 'agence' ? 'on' : ''}`} onClick={() => setType('agence')}>
                <div className="type-icon">🏢</div>
                <div className="type-name">Agence</div>
                <div className="type-desc">Vous êtes une agence immobilière</div>
              </div>
            </div>
            <div className="nav">
              <div></div>
              <button className="btn-next" onClick={() => setStep(1)} disabled={!type}>Continuer →</button>
            </div>
          </>
        )}

        {/* ÉTAPE 1 — Profil */}
        {step === 1 && (
          <>
            <div className="eyebrow">Étape 1 sur 5</div>
            <div className="title">{type === 'agence' ? 'Votre agence' : 'Votre profil'}</div>
            <div className="sub">Ces informations apparaîtront sur votre Kodeoo Link.</div>
            <div className="card">
              {/* Photo */}
              <div className="photo-upload">
                <div className="photo-circle">
                  {photoPreview ? <img src={photoPreview} alt="" /> : <span>{type === 'agence' ? '🏢' : '👤'}</span>}
                </div>
                <div>
                  <label className="btn-photo">
                    📷 {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={e => { const f = e.target.files?.[0]; if(f) handlePhoto(f) }} />
                  </label>
                  <div style={{fontSize:11,color:'#C7C7CC',marginTop:5}}>JPG, PNG — recommandé</div>
                </div>
              </div>

              <div className="grid2">
                {type === 'conseiller' ? (
                  <>
                    <div className="field"><label>Prénom</label><input type="text" placeholder="Sophie" value={form.prenom} onChange={e => update('prenom', e.target.value)} /></div>
                    <div className="field"><label>Nom</label><input type="text" placeholder="Martin" value={form.nom} onChange={e => update('nom', e.target.value)} /></div>
                    <div className="field full"><label>Réseau ou Agence</label><input type="text" placeholder="IAD France, Safti, Agence Dupont..." value={form.reseau_agence} onChange={e => update('reseau_agence', e.target.value)} /></div>
                  </>
                ) : (
                  <div className="field full"><label>Nom de l'agence</label><input type="text" placeholder="Agence Dupont Immobilier" value={form.nom_agence} onChange={e => update('nom_agence', e.target.value)} /></div>
                )}
                <div className="field full"><label>Ville / Secteur</label><input type="text" placeholder="Lyon & Métropole" value={form.ville} onChange={e => update('ville', e.target.value)} /></div>
                <div className="field"><label>Téléphone</label><input type="tel" placeholder="06 00 00 00 00" value={form.telephone} onChange={e => update('telephone', e.target.value)} /></div>
                <div className="field"><label>Email</label><input type="email" placeholder="vous@exemple.fr" value={form.email} onChange={e => update('email', e.target.value)} /></div>
                <div className="field full"><label>Bio courte</label><textarea placeholder="Spécialiste du marché depuis X ans..." value={form.bio} onChange={e => update('bio', e.target.value)} /></div>
              </div>
            </div>
            <div className="nav">
              <button className="btn-back" onClick={() => setStep(0)}>← Retour</button>
              <button className="btn-next" onClick={() => setStep(2)} disabled={type === 'conseiller' ? (!form.prenom || !form.nom || !form.email) : (!form.nom_agence || !form.email)}>
                Suivant →
              </button>
            </div>
          </>
        )}

        {/* ÉTAPE 2 — Preuves sociales */}
        {step === 2 && (
          <>
            <div className="eyebrow">Étape 2 sur 5</div>
            <div className="title">Vos preuves sociales</div>
            <div className="sub">Rassurez vos prospects avec vos chiffres clés. Vous pouvez passer cette étape.</div>
            <div className="card">
              <div className="proof-grid">
                <div className="field">
                  <label>Note Google (/5)</label>
                  <input type="number" step="0.1" min="0" max="5" placeholder="ex. 4.9" value={form.google_rating} onChange={e => update('google_rating', e.target.value)} />
                </div>
                <div className="field">
                  <label>Biens vendus</label>
                  <input type="number" placeholder="ex. 47" value={form.biens_vendus} onChange={e => update('biens_vendus', e.target.value)} />
                </div>
                <div className="field">
                  <label>Années d'expérience</label>
                  <input type="number" placeholder="ex. 8" value={form.experience} onChange={e => update('experience', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="nav">
              <button className="btn-back" onClick={() => setStep(1)}>← Retour</button>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-skip" onClick={() => setStep(3)}>Passer</button>
                <button className="btn-next" onClick={() => setStep(3)}>Suivant →</button>
              </div>
            </div>
          </>
        )}

        {/* ÉTAPE 3 — Réseaux sociaux */}
        {step === 3 && (
          <>
            <div className="eyebrow">Étape 3 sur 5</div>
            <div className="title">Vos réseaux sociaux</div>
            <div className="sub">Ajoutez vos liens. Vous pouvez passer cette étape.</div>
            <div className="card">
              {[
                { label: 'Instagram', prefix: 'instagram.com/', key: 'instagram', placeholder: 'votre.compte' },
                { label: 'TikTok', prefix: 'tiktok.com/@', key: 'tiktok', placeholder: 'votre.compte' },
                { label: 'Facebook', prefix: 'facebook.com/', key: 'facebook', placeholder: 'votre.page' },
                { label: 'LinkedIn', prefix: 'linkedin.com/in/', key: 'linkedin', placeholder: 'votre-profil' },
                { label: 'YouTube', prefix: 'youtube.com/@', key: 'youtube', placeholder: 'votre-chaine' },
                { label: 'Site web', prefix: 'https://', key: 'site_web', placeholder: 'votre-site.fr' },
              ].map(s => (
                <div key={s.key} className="social-row">
                  <span className="social-label">{s.label}</span>
                  <span className="social-prefix">{s.prefix}</span>
                  <input className="social-inp" placeholder={s.placeholder} value={(form as any)[s.key]} onChange={e => update(s.key, e.target.value)} />
                </div>
              ))}
            </div>
            <div className="nav">
              <button className="btn-back" onClick={() => setStep(2)}>← Retour</button>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-skip" onClick={() => setStep(4)}>Passer</button>
                <button className="btn-next" onClick={() => setStep(4)}>Suivant →</button>
              </div>
            </div>
          </>
        )}

        {/* ÉTAPE 4 — Import biens */}
        {step === 4 && (
          <>
            <div className="eyebrow">Étape 4 sur 5</div>
            <div className="title">Vos biens</div>
            <div className="sub">Importez vos annonces automatiquement. Vous pouvez passer cette étape.</div>
            <div className="card">
              <div className="import-tabs">
                <button className={`import-tab ${importMode === 'liste' ? 'on' : ''}`} onClick={() => setImportMode('liste')}>
                  Page liste de biens
                </button>
                <button className={`import-tab ${importMode === 'unitaire' ? 'on' : ''}`} onClick={() => setImportMode('unitaire')}>
                  URL par bien
                </button>
              </div>

              {importMode === 'liste' ? (
                <>
                  <div style={{fontSize:13,color:'#6B6B80',marginBottom:12,lineHeight:1.6}}>
                    Collez l'URL de votre page avec tous vos biens — on importe tout automatiquement.
                  </div>
                  <input
                    className="inp-full"
                    placeholder="https://www.iadfrance.fr/conseiller-immobilier/votre.nom ou votre site agence"
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    style={{marginBottom:12}}
                  />
                  <div style={{fontSize:11,color:'#C7C7CC',marginBottom:12}}>✓ Compatible IAD France, Safti, sites d'agences</div>
                  {!importDone ? (
                    <button className="btn-next" style={{width:'100%'}} onClick={publish} disabled={importLoading || !importUrl}>
                      {importLoading ? '⏳ Import en cours...' : '⚡ Publier avec mes biens'}
                    </button>
                  ) : (
                    <div className="import-success">
                      <div style={{fontSize:16,fontWeight:700,color:'#166534',marginBottom:4}}>✅ {importCount} biens importés !</div>
                      <div style={{fontSize:13,color:'#166534'}}>Votre page est prête.</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{fontSize:13,color:'#6B6B80',marginBottom:12,lineHeight:1.6}}>
                    Ajoutez les URLs de vos annonces une par une.
                  </div>
                  {importUrls.map((url, i) => (
                    <div key={i} className="url-add">
                      <input
                        className="inp-full"
                        placeholder={`https://www.iadfrance.fr/annonce/...`}
                        value={url}
                        onChange={e => { const arr = [...importUrls]; arr[i] = e.target.value; setImportUrls(arr) }}
                      />
                      {i === importUrls.length - 1 && (
                        <button className="btn-add-url" onClick={() => setImportUrls([...importUrls, ''])}>+ Ajouter</button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="nav">
              <button className="btn-back" onClick={() => setStep(3)}>← Retour</button>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-skip" onClick={publish} disabled={loading}>
                  {loading ? 'Publication...' : 'Passer & Publier'}
                </button>
                {importMode === 'unitaire' && (
                  <button className="btn-next" onClick={async () => { await publish(); if(agentId) await importBiens() }} disabled={loading}>
                    {loading ? '⏳...' : '🚀 Publier'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* SUCCÈS */}
        {step === 5 && (
          <div className="success-wrap">
            <div className="success-icon">🎉</div>
            <div className="success-title">Votre Kodeoo Link est live !</div>
            <div className="success-sub">Copiez votre lien et mettez-le dans la bio de tous vos réseaux pour capter des prospects.</div>
            <div className="url-copy" onClick={() => navigator.clipboard.writeText(`https://go.kodeoo.fr/${slug}`)}>
              go.kodeoo.fr/{slug} 📋
            </div>
            <br />
            <a className="btn-voir" href={`https://go.kodeoo.fr/${slug}`} target="_blank">
              Voir mon Kodeoo Link →
            </a>
            <div className="next-steps">
              <div className="ns-label">Prochaines étapes</div>
              <div className="ns-item"><span className="ns-num">1</span>Mettez le lien dans la bio de tous vos réseaux</div>
              <div className="ns-item"><span className="ns-num">2</span>Ajoutez vos avis clients depuis votre dashboard</div>
              <div className="ns-item"><span className="ns-num">3</span>Activez vos ressources téléchargeables</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}