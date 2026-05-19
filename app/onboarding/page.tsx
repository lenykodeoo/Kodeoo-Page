'use client'

import { useState } from 'react'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [slug, setSlug] = useState('')
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    ville: '',
    bio: '',
    reseau: 'IAD France',
    instagram: '',
    tiktok: '',
    facebook: '',
    linkedin: '',
  })

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'prenom' || key === 'nom') {
      const p = key === 'prenom' ? value : form.prenom
      const n = key === 'nom' ? value : form.nom
      setSlug((p + '-' + n).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  const submit = async () => {
  setLoading(true)
  try {
    // Récupère le member_id depuis le cookie
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
      return match ? match[2] : null
    }
    const memberId = getCookie('kodeoo_member_id') || 'member_' + Date.now()

    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, kodeoo_member_id: memberId })
    })
    const data = await res.json()

    if (data.success) {
      // Sauvegarder le slug dans WordPress
      const secret = 'kodeoo-secret-2026'
      const token = btoa(memberId + ':' + secret).slice(0, 32)

      await fetch('https://kodeoo.fr/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'kodeoo_save_slug',
          member_id: memberId,
          slug: data.agent.slug,
          token: token,
        })
      })

      setSlug(data.agent.slug)
      setStep(4)
    } else {
      alert('Erreur : ' + data.error)
    }
  } catch (e) {
    alert('Erreur réseau')
  }
  setLoading(false)
}

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F7F7FA;font-family:system-ui,sans-serif}
        .wrap{max-width:560px;margin:0 auto;padding:32px 16px 80px}
        .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px}
        .logo{display:flex;align-items:center;gap:8px;text-decoration:none}
        .logo-k{width:28px;height:28px;background:#6347FF;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff}
        .logo-name{font-size:15px;font-weight:600;color:#0D0D12}
        .url-badge{display:flex;align-items:center;gap:6px;padding:5px 12px;background:#EEF0FF;border:1px solid rgba(99,71,255,0.2);border-radius:20px;font-size:12px;font-weight:500;color:#6347FF}
        .steps{display:flex;align-items:center;gap:8px;margin-bottom:28px}
        .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0}
        .step-dot.done{background:#6347FF;color:#fff}
        .step-dot.active{background:#6347FF;color:#fff;box-shadow:0 0 0 4px rgba(99,71,255,0.15)}
        .step-dot.todo{background:#F7F7FA;border:1px solid rgba(0,0,0,0.1);color:#A0A0B8}
        .step-line{flex:1;height:1px;background:rgba(0,0,0,0.08)}
        .step-line.done{background:#6347FF}
        .card{background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 2px 12px rgba(0,0,0,0.04)}
        .card-title{font-size:14px;font-weight:600;color:#0D0D12;margin-bottom:16px;display:flex;align-items:center;gap:8px}
        .eyebrow{font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6347FF;margin-bottom:6px}
        .title{font-size:24px;font-weight:600;color:#0D0D12;margin-bottom:6px;letter-spacing:-0.02em}
        .sub{font-size:14px;color:#6B6B80;line-height:1.6;margin-bottom:24px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .field{margin-bottom:12px}
        .field.full{grid-column:1/-1}
        .field label{display:block;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#A0A0B8;margin-bottom:4px}
        .field input,.field select,.field textarea{width:100%;height:41px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.1);border-radius:9px;padding:0 12px;font-family:inherit;font-size:13px;color:#0D0D12;outline:none;-webkit-appearance:none}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:rgba(99,71,255,0.4);background:#fff}
        .field textarea{height:80px;padding:10px 12px;resize:none;line-height:1.5}
        .reseau-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:4px}
        .reseau-opt{padding:10px 8px;border:1px solid rgba(0,0,0,0.1);border-radius:9px;cursor:pointer;text-align:center;background:#F7F7FA;transition:all 0.15s}
        .reseau-opt.on{background:#EEF0FF;border-color:rgba(99,71,255,0.35)}
        .reseau-name{font-size:12px;font-weight:600;color:#6B6B80}
        .reseau-opt.on .reseau-name{color:#6347FF}
        .social-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.1);border-radius:9px;margin-bottom:8px}
        .social-prefix{font-size:12px;color:#A0A0B8;white-space:nowrap}
        .social-input{flex:1;border:none;background:none;font-family:inherit;font-size:13px;color:#0D0D12;outline:none}
        .social-input::placeholder{color:#A0A0B8}
        .nav{display:flex;align-items:center;justify-content:space-between;margin-top:24px;padding-top:20px;border-top:1px solid rgba(0,0,0,0.06)}
        .btn-back{display:flex;align-items:center;gap:6px;height:38px;padding:0 16px;background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:9px;font-family:inherit;font-size:13px;font-weight:500;color:#6B6B80;cursor:pointer}
        .btn-next{display:flex;align-items:center;gap:7px;height:42px;padding:0 24px;background:#6347FF;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:background 0.18s}
        .btn-next:hover{background:#4F35E8}
        .btn-next:disabled{opacity:0.6;cursor:not-allowed}
        .success-wrap{text-align:center;padding:40px 24px}
        .success-icon{width:72px;height:72px;border-radius:50%;background:rgba(0,179,125,0.08);border:1px solid rgba(0,179,125,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px}
        .success-title{font-size:28px;font-weight:600;color:#0D0D12;margin-bottom:8px;letter-spacing:-0.02em}
        .success-sub{font-size:14px;color:#6B6B80;line-height:1.6;margin-bottom:24px}
        .url-copy{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;background:#EEF0FF;border:1px solid rgba(99,71,255,0.2);border-radius:20px;font-size:14px;font-weight:600;color:#6347FF;margin-bottom:24px;cursor:pointer}
        .btn-voir{display:inline-flex;align-items:center;gap:7px;height:46px;padding:0 28px;background:#6347FF;color:#fff;border:none;border-radius:9px;font-family:inherit;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none}
        .next-steps{margin-top:28px;padding:20px;background:#F7F7FA;border-radius:12px;text-align:left}
        .next-step-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#A0A0B8;margin-bottom:12px}
        .next-step-item{display:flex;align-items:center;gap:10px;font-size:13px;color:#6B6B80;margin-bottom:8px}
        .ns-num{width:22px;height:22px;border-radius:50%;background:#EEF0FF;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;color:#6347FF;flex-shrink:0}
      `}</style>

      <div className="wrap">
        <div className="topbar">
          <a className="logo" href="https://kodeoo.fr">
            <div className="logo-k">K</div>
            <span className="logo-name">Kodeoo</span>
          </a>
          {slug && (
            <div className="url-badge">
              go.kodeoo.fr/{slug}
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="steps">
            <div className={`step-dot ${step > 1 ? 'done' : 'active'}`}>{step > 1 ? '✓' : '1'}</div>
            <div className={`step-line ${step > 1 ? 'done' : ''}`}></div>
            <div className={`step-dot ${step > 2 ? 'done' : step === 2 ? 'active' : 'todo'}`}>{step > 2 ? '✓' : '2'}</div>
            <div className={`step-line ${step > 2 ? 'done' : ''}`}></div>
            <div className={`step-dot ${step === 3 ? 'active' : 'todo'}`}>3</div>
          </div>
        )}

        {step === 1 && (
          <>
            <div className="eyebrow">Étape 1 sur 3</div>
            <div className="title">Votre profil agent</div>
            <div className="sub">Ces informations apparaîtront sur votre Kodeoo Page.</div>

            <div className="card">
              <div className="card-title">👤 Identité</div>
              <div className="grid2">
                <div className="field">
                  <label>Prénom</label>
                  <input type="text" placeholder="Sophie" value={form.prenom} onChange={e => updateForm('prenom', e.target.value)} />
                </div>
                <div className="field">
                  <label>Nom</label>
                  <input type="text" placeholder="Martin" value={form.nom} onChange={e => updateForm('nom', e.target.value)} />
                </div>
                <div className="field">
                  <label>Téléphone</label>
                  <input type="tel" placeholder="06 00 00 00 00" value={form.telephone} onChange={e => updateForm('telephone', e.target.value)} />
                </div>
                <div className="field">
                  <label>Email de contact</label>
                  <input type="email" placeholder="sophie@exemple.fr" value={form.email} onChange={e => updateForm('email', e.target.value)} />
                </div>
                <div className="field full">
                  <label>Ville / Secteur</label>
                  <input type="text" placeholder="Lyon & Métropole" value={form.ville} onChange={e => updateForm('ville', e.target.value)} />
                </div>
                <div className="field full">
                  <label>Bio courte</label>
                  <textarea placeholder="Spécialiste du marché depuis X ans…" value={form.bio} onChange={e => updateForm('bio', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">🏢 Votre réseau</div>
              <div className="reseau-grid">
                {['IAD France', 'Safti', 'Indépendant'].map(r => (
                  <div key={r} className={`reseau-opt ${form.reseau === r ? 'on' : ''}`} onClick={() => updateForm('reseau', r)}>
                    <div className="reseau-name">{r}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="nav">
              <div></div>
              <button className="btn-next" onClick={() => setStep(2)} disabled={!form.prenom || !form.nom || !form.email}>
                Suivant — Réseaux sociaux →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="eyebrow">Étape 2 sur 3</div>
            <div className="title">Vos réseaux sociaux</div>
            <div className="sub">Ajoutez vos liens. Ils apparaîtront sur votre page.</div>

            <div className="card">
              <div className="card-title">🔗 Liens</div>
              {[
                { icon: '📸', prefix: 'instagram.com/', key: 'instagram', placeholder: 'votre.compte' },
                { icon: '🎵', prefix: 'tiktok.com/@', key: 'tiktok', placeholder: 'votre.compte' },
                { icon: '👤', prefix: 'facebook.com/', key: 'facebook', placeholder: 'votre.page' },
                { icon: '💼', prefix: 'linkedin.com/in/', key: 'linkedin', placeholder: 'votre-profil' },
              ].map(s => (
                <div key={s.key} className="social-row">
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <span className="social-prefix">{s.prefix}</span>
                  <input className="social-input" placeholder={s.placeholder} value={(form as any)[s.key]} onChange={e => updateForm(s.key, e.target.value)} />
                </div>
              ))}
            </div>

            <div className="nav">
              <button className="btn-back" onClick={() => setStep(1)}>← Retour</button>
              <button className="btn-next" onClick={() => setStep(3)}>
                Suivant — Publier →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="eyebrow">Étape 3 sur 3</div>
            <div className="title">Tout est prêt !</div>
            <div className="sub">Vérifiez vos informations avant de publier votre page.</div>

            <div className="card">
              <div className="card-title">✅ Récapitulatif</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Nom', value: form.prenom + ' ' + form.nom },
                  { label: 'Réseau', value: form.reseau },
                  { label: 'Ville', value: form.ville },
                  { label: 'Email', value: form.email },
                  { label: 'Téléphone', value: form.telephone || '—' },
                  { label: 'Instagram', value: form.instagram || '—' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 10, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ color: '#A0A0B8', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: '#0D0D12', fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: '10px 14px', background: '#EEF0FF', borderRadius: 9, fontSize: 13, color: '#6347FF', fontWeight: 500 }}>
                🔗 go.kodeoo.fr/{slug}
              </div>
            </div>

            <div className="nav">
              <button className="btn-back" onClick={() => setStep(2)}>← Retour</button>
              <button className="btn-next" onClick={submit} disabled={loading}>
                {loading ? 'Publication...' : '🚀 Publier ma page !'}
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <div className="success-wrap">
            <div className="success-icon">🎉</div>
            <div className="success-title">Votre page est live !</div>
            <div className="success-sub">Copiez votre lien et mettez-le dans votre bio Instagram dès maintenant.</div>
            <div className="url-copy" onClick={() => navigator.clipboard.writeText(`https://go.kodeoo.fr/${slug}`)}>
              go.kodeoo.fr/{slug}
              <span>📋</span>
            </div>
            <br />
            <a className="btn-voir" href={`https://go.kodeoo.fr/${slug}`} target="_blank">
              Voir ma page →
            </a>
            <div className="next-steps">
              <div className="next-step-label">Prochaines étapes</div>
              <div className="next-step-item"><span className="ns-num">1</span>Mettez le lien dans votre bio Instagram</div>
              <div className="next-step-item"><span className="ns-num">2</span>Ajoutez vos biens depuis votre dashboard</div>
              <div className="next-step-item"><span className="ns-num">3</span>Mentionnez votre lien dans vos Reels</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}