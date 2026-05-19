import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'

export default async function AgentPage(props: any) {
  const params = await props.params
  const slug = params.slug

  const { data: agent, error } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !agent) notFound()

  const { data: biens } = await supabaseAdmin
    .from('biens')
    .select('*')
    .eq('agent_id', agent.id)
    .neq('statut', 'vendu')
    .order('created_at', { ascending: false })

  const isAgence = agent.type === 'agence'
  const displayName = isAgence ? agent.nom : `${agent.prenom} ${agent.nom}`
  const initials = isAgence ? agent.nom?.[0] : `${agent.prenom?.[0] || ''}${agent.nom?.[0] || ''}`
  const agentId = agent.id

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#F2F2F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1C1C1E}
        .wrap{width:100%;max-width:480px;margin:0 auto;background:#F2F2F7;min-height:100vh}

        /* ── TOPBAR ── */
        .topbar{background:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(0,0,0,0.06)}
        .kbadge{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:#1C1C1E;text-decoration:none}
        .kdot{width:7px;height:7px;border-radius:50%;background:#6347FF}
        .live{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:500;color:#34C759}
        .ldot{width:6px;height:6px;border-radius:50%;background:#34C759;animation:lp 1.5s infinite}
        @keyframes lp{0%,100%{opacity:1}50%{opacity:0.3}}

        /* ── HERO ── */
        .hero{background:#fff;padding:20px 16px 24px;margin-bottom:8px}
        .profile-top{display:flex;align-items:center;gap:14px;margin-bottom:20px}
        .avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#E8E8FF,#D0D0FF);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#6347FF;flex-shrink:0;overflow:hidden;border:3px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,0.12)}
        .avatar img{width:100%;height:100%;object-fit:cover}
        .profile-info{flex:1;min-width:0}
        .profile-name{font-size:22px;font-weight:700;color:#1C1C1E;margin-bottom:3px;letter-spacing:-0.3px}
        .profile-sub{font-size:14px;color:#6B6B80;margin-bottom:8px}
        .profile-rating{display:flex;align-items:center;gap:5px;font-size:13px;color:#1C1C1E;font-weight:500}
        .stars-row{display:flex;gap:1px}
        .s{width:13px;height:13px;fill:#FF9500}
        .rating-count{color:#8E8E93;font-weight:400}

        /* PREUVES */
        .proofs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
        .proof{padding:6px 12px;background:#F2F2F7;border-radius:20px;font-size:12px;font-weight:500;color:#3C3C43}

        /* CTA */
        .cta-main{width:100%;height:54px;background:#6347FF;color:#fff;border:none;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;letter-spacing:-0.2px;font-family:inherit}
        .cta-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .cta-btn{height:48px;background:#F2F2F7;color:#1C1C1E;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;text-decoration:none;font-family:inherit}

        /* ── SOCIALS ── */
        .socials-bar{background:#fff;padding:14px 16px;margin-bottom:8px;display:flex;justify-content:center;gap:10px}
        .soc{width:44px;height:44px;background:#F2F2F7;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:19px}

        /* ── SECTION ── */
        .section-header{padding:16px 16px 10px;display:flex;align-items:center;justify-content:space-between}
        .section-title{font-size:18px;font-weight:700;color:#1C1C1E;letter-spacing:-0.3px}
        .section-count{font-size:14px;color:#8E8E93;font-weight:500}

        /* ── LEAD MAGNET ── */
        .lm-wrap{background:#fff;margin-bottom:8px;padding:20px 16px}
        .lm-tag{display:inline-flex;align-items:center;gap:5px;background:#F0EEFF;color:#6347FF;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;margin-bottom:12px;letter-spacing:0.02em;text-transform:uppercase}
        .lm-title{font-size:18px;font-weight:700;color:#1C1C1E;margin-bottom:6px;letter-spacing:-0.3px;line-height:1.3}
        .lm-sub{font-size:14px;color:#6B6B80;line-height:1.6;margin-bottom:16px}
        .lm-input{width:100%;height:46px;background:#F2F2F7;border:none;border-radius:12px;padding:0 14px;font-size:15px;color:#1C1C1E;outline:none;margin-bottom:10px;font-family:inherit}
        .lm-input::placeholder{color:#C7C7CC}
        .lm-btn{width:100%;height:50px;background:#6347FF;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit}

        /* ── ESTIMATION ── */
        .estim-wrap{background:#1C1C1E;margin-bottom:8px;padding:24px 16px;position:relative;overflow:hidden}
        .estim-wrap::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;background:radial-gradient(circle,rgba(99,71,255,0.25),transparent 70%);pointer-events:none}
        .estim-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(99,71,255,0.2);color:#A78BFA;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;margin-bottom:12px;letter-spacing:0.02em;text-transform:uppercase}
        .estim-title{font-size:20px;font-weight:700;color:#fff;margin-bottom:6px;letter-spacing:-0.3px;line-height:1.3}
        .estim-sub{font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:16px}
        .estim-input{width:100%;height:46px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:0 14px;font-size:15px;color:#fff;outline:none;margin-bottom:10px;font-family:inherit;-webkit-appearance:none}
        .estim-input::placeholder{color:rgba(255,255,255,0.3)}
        .estim-select{width:100%;height:46px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:0 14px;font-size:15px;color:#fff;outline:none;margin-bottom:10px;font-family:inherit;-webkit-appearance:none;cursor:pointer}
        .estim-btn{width:100%;height:50px;background:#6347FF;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:4px}

        /* ── AVIS ── */
        .avis-wrap{background:#fff;margin-bottom:8px}
        .avis-global-bar{display:flex;align-items:center;gap:12px;padding:16px 16px 12px}
        .avis-note-big{font-size:40px;font-weight:700;color:#1C1C1E;letter-spacing:-1px;line-height:1}
        .avis-note-sub{font-size:13px;color:#8E8E93;margin-top:3px}
        .avis-scroll{display:flex;gap:12px;overflow-x:auto;padding:0 16px 16px;scrollbar-width:none}
        .avis-scroll::-webkit-scrollbar{display:none}
        .avis-card{background:#F2F2F7;border-radius:16px;padding:16px;min-width:270px;max-width:270px;flex-shrink:0}
        .avis-card-stars{display:flex;gap:2px;margin-bottom:10px}
        .avis-text{font-size:14px;line-height:1.55;color:#1C1C1E;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
        .avis-meta{display:flex;align-items:center;gap:8px}
        .avis-av{width:30px;height:30px;border-radius:50%;background:#E8E8FF;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#6347FF;flex-shrink:0}
        .avis-name{font-size:13px;font-weight:600;color:#1C1C1E}
        .avis-date{font-size:12px;color:#8E8E93}

        /* ── BIENS ── */
        .biens-wrap{background:#fff;margin-bottom:8px}
        .bien-card{background:#fff;border-radius:0;overflow:hidden;border-bottom:1px solid #F2F2F7}
        .bien-card:last-child{border-bottom:none}
        .bien-slider{position:relative;height:220px;overflow:hidden;background:#E8E8F0}
        .bien-slides{display:flex;height:100%;transition:transform 0.35s ease}
        .bien-slide{min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:48px;flex-shrink:0}
        .bien-slide img{width:100%;height:100%;object-fit:cover}
        .bien-price-overlay{position:absolute;bottom:0;left:0;right:0;padding:40px 14px 14px;background:linear-gradient(transparent,rgba(0,0,0,0.5));color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.3px}
        .bien-nav-btn{position:absolute;top:50%;transform:translateY(-50%);width:32px;height:32px;background:rgba(255,255,255,0.9);border:none;border-radius:50%;cursor:pointer;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
        .bien-nav-prev{left:10px}
        .bien-nav-next{right:10px}
        .bien-img-count{position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.5);color:#fff;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;backdrop-filter:blur(4px)}
        .bien-status-pill{position:absolute;top:10px;right:10px;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px}
        .bp-vente{background:rgba(99,71,255,0.15);color:#6347FF;border:1px solid rgba(99,71,255,0.3)}
        .bp-offre{background:rgba(255,149,0,0.15);color:#FF9500;border:1px solid rgba(255,149,0,0.3)}
        .bien-body{padding:14px 16px 16px}
        .bien-loc{font-size:12px;color:#8E8E93;margin-bottom:3px;display:flex;align-items:center;gap:4px}
        .bien-title{font-size:16px;font-weight:600;color:#1C1C1E;margin-bottom:10px;line-height:1.3}
        .bien-specs-row{display:flex;gap:8px;margin-bottom:14px}
        .bspec{display:flex;align-items:center;gap:5px;background:#F2F2F7;padding:5px 10px;border-radius:8px;font-size:12px;font-weight:500;color:#3C3C43}
        .bien-cta-btn{width:100%;height:46px;background:#6347FF;color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit}

        /* ── A PROPOS ── */
        .apropos-wrap{background:#fff;margin-bottom:8px;padding:20px 16px}
        .apropos-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
        .apropos-av{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#E8E8FF,#D0D0FF);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#6347FF;flex-shrink:0;overflow:hidden}
        .apropos-av img{width:100%;height:100%;object-fit:cover}
        .apropos-name{font-size:16px;font-weight:600;color:#1C1C1E}
        .apropos-role{font-size:13px;color:#8E8E93}
        .apropos-text{font-size:15px;line-height:1.65;color:#3C3C43}

        /* ── FOOTER CTA ── */
        .footer-cta{background:#fff;margin-bottom:8px;padding:24px 16px}
        .footer-cta-title{font-size:20px;font-weight:700;color:#1C1C1E;margin-bottom:4px;letter-spacing:-0.3px}
        .footer-cta-sub{font-size:14px;color:#8E8E93;margin-bottom:18px}
        .footer-cta-main{width:100%;height:54px;background:#6347FF;color:#fff;border:none;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;margin-bottom:10px;font-family:inherit}
        .footer-cta-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .footer-cta-sec{height:48px;background:#F2F2F7;color:#1C1C1E;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;font-family:inherit}

        /* ── FOOTER ── */
        .footer{padding:20px 16px 40px;text-align:center}
        .foot-link{display:inline-flex;align-items:center;gap:6px;text-decoration:none}
        .foot-k{width:16px;height:16px;background:#6347FF;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff}
        .foot-l{font-size:12px;color:#C7C7CC;font-weight:500}

        /* ── MODALS ── */
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(8px);z-index:200;display:none;align-items:flex-end;justify-content:center}
        .overlay.open{display:flex}
        .modal{background:#F2F2F7;border-radius:24px 24px 0 0;padding:8px 0 40px;width:100%;max-width:480px;animation:slideUp .3s cubic-bezier(.16,1,.3,1);max-height:95vh;overflow-y:auto}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .modal-handle{width:36px;height:4px;background:rgba(0,0,0,0.15);border-radius:2px;margin:12px auto 20px}
        .modal-section{background:#fff;border-radius:16px;margin:0 16px 12px;padding:16px}
        .modal-title{font-size:20px;font-weight:700;color:#1C1C1E;margin-bottom:4px;letter-spacing:-0.3px;padding:0 16px}
        .modal-sub{font-size:14px;color:#8E8E93;margin-bottom:16px;padding:0 16px}
        .m-field{margin-bottom:10px}
        .m-field label{display:block;font-size:12px;font-weight:600;color:#8E8E93;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.04em}
        .m-field input,.m-field select,.m-field textarea{width:100%;height:44px;background:#F2F2F7;border:none;border-radius:10px;padding:0 13px;font-size:15px;color:#1C1C1E;outline:none;font-family:inherit;-webkit-appearance:none}
        .m-field input:focus,.m-field select:focus,.m-field textarea:focus{background:#E8E8ED}
        .m-field textarea{height:80px;padding:12px 13px;resize:none;line-height:1.5}
        .m-field input::placeholder,.m-field textarea::placeholder{color:#C7C7CC}
        .radios{display:flex;gap:8px;margin-bottom:12px}
        .radio{flex:1;height:38px;background:#F2F2F7;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#8E8E93;cursor:pointer}
        .radio.on{background:#6347FF;color:#fff}
        .m-close-btn{position:absolute;top:16px;right:16px;width:30px;height:30px;background:rgba(0,0,0,0.08);border:none;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:#6B6B80}
        .btn-submit{width:100%;height:52px;background:#6347FF;color:#fff;border:none;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;margin:0 16px;width:calc(100% - 32px);font-family:inherit}
      `}</style>

      <div className="wrap">
        {/* ── TOPBAR ── */}
        <div className="topbar">
          <a className="kbadge" href="https://kodeoo.fr">
            <span className="kdot"></span>
            Kodeoo
          </a>
          <div className="live">
            <span className="ldot"></span>
            En ligne
          </div>
        </div>

        {/* ── HERO ── */}
        <div className="hero">
          <div className="profile-top">
            <div className="avatar">
              {agent.photo_url ? <img src={agent.photo_url} alt={displayName} /> : <span>{initials}</span>}
            </div>
            <div className="profile-info">
              <div className="profile-name">{displayName}</div>
              <div className="profile-sub">{isAgence ? 'Agence immobilière' : agent.reseau || 'Conseiller immobilier'} · {agent.ville}</div>
              {agent.google_rating && (
                <div className="profile-rating">
                  <div className="stars-row">
                    {[1,2,3,4,5].map(i => <svg key={i} className="s" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  </div>
                  <span>{agent.google_rating}</span>
                  <span className="rating-count">· Avis Google</span>
                </div>
              )}
            </div>
          </div>

          {(agent.biens_vendus > 0) && (
            <div className="proofs">
              {agent.biens_vendus > 0 && <span className="proof">✅ +{agent.biens_vendus} ventes</span>}
            </div>
          )}

          <button className="cta-main" id="heroEstimBtn">
            📊 Faire estimer mon bien
          </button>
          <div className="cta-row">
            <button className="cta-btn" id="heroMsgBtn">📲 Message</button>
            <a className="cta-btn" href={`tel:${agent.telephone}`}>📞 Appeler</a>
          </div>
        </div>

        {/* ── RÉSEAUX SOCIAUX ── */}
        {(agent.instagram || agent.tiktok || agent.facebook || agent.linkedin || agent.youtube || agent.site_web) && (
          <div className="socials-bar">
            {agent.instagram && <a className="soc" href={`https://instagram.com/${agent.instagram}`} target="_blank" rel="noreferrer">📸</a>}
            {agent.tiktok && <a className="soc" href={`https://tiktok.com/@${agent.tiktok}`} target="_blank" rel="noreferrer">🎵</a>}
            {agent.facebook && <a className="soc" href={agent.facebook.startsWith('http') ? agent.facebook : `https://facebook.com/${agent.facebook}`} target="_blank" rel="noreferrer">👤</a>}
            {agent.linkedin && <a className="soc" href={agent.linkedin.startsWith('http') ? agent.linkedin : `https://linkedin.com/in/${agent.linkedin}`} target="_blank" rel="noreferrer">💼</a>}
            {agent.youtube && <a className="soc" href={`https://youtube.com/@${agent.youtube}`} target="_blank" rel="noreferrer">▶️</a>}
            {agent.site_web && <a className="soc" href={agent.site_web.startsWith('http') ? agent.site_web : `https://${agent.site_web}`} target="_blank" rel="noreferrer">🌐</a>}
          </div>
        )}

        {/* ── LEAD MAGNET ── */}
        <div className="lm-wrap">
          <div className="lm-tag">📄 Guide gratuit</div>
          <div className="lm-title">Vendre au meilleur prix en 2026</div>
          <div className="lm-sub">Téléchargez notre guide complet pour préparer votre vente et maximiser votre prix de vente.</div>
          <input className="lm-input" type="text" placeholder="Votre prénom" id="lmPrenom" />
          <input className="lm-input" type="email" placeholder="Votre email" id="lmEmail" />
          <button className="lm-btn" id="lmBtn">📩 Télécharger gratuitement</button>
        </div>

        {/* ── ESTIMATION ── */}
        <div className="estim-wrap">
          <div className="estim-tag">✨ Gratuit</div>
          <div className="estim-title">Quelle est la vraie valeur de votre bien ?</div>
          <div className="estim-sub">Recevez une estimation personnalisée sous 24h.</div>
          <input className="estim-input" type="text" placeholder="Adresse du bien" id="estimAdresse" />
          <select className="estim-select" id="estimType">
            <option value="">Type de bien</option>
            <option>Appartement</option>
            <option>Maison</option>
            <option>Villa</option>
            <option>Studio</option>
            <option>Local commercial</option>
          </select>
          <input className="estim-input" type="number" placeholder="Surface en m²" id="estimSurface" />
          <input className="estim-input" type="tel" placeholder="Votre téléphone" id="estimTel" />
          <input className="estim-input" type="email" placeholder="Votre email" id="estimEmail" />
          <button className="estim-btn" id="estimBtn">📊 Recevoir mon estimation gratuite</button>
        </div>

        {/* ── AVIS ── */}
        <div className="avis-wrap">
          <div className="section-header">
            <div className="section-title">Avis clients</div>
          </div>
          <div className="avis-global-bar">
            <div className="avis-note-big">{agent.google_rating || '5,0'}</div>
            <div>
              <div className="stars-row" style={{marginBottom:4}}>
                {[1,2,3,4,5].map(i => <svg key={i} className="s" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
              </div>
              <div className="avis-note-sub">Avis Google</div>
            </div>
          </div>
          <div className="avis-scroll">
            {[
              {i:'MR', n:'Marie R.', d:'Mars 2026', t:"Excellent accompagnement du début à la fin. Professionnel, réactif et de très bons conseils. Je recommande vivement !"},
              {i:'TC', n:'Thomas C.', d:'Fév. 2026', t:"Première acquisition et j'ai été guidé parfaitement. Une vraie expertise du marché local, très rassurant."},
              {i:'SL', n:'Sophie L.', d:'Jan. 2026', t:"Vente conclue en 3 semaines au prix demandé. Résultat exceptionnel, merci pour votre professionnalisme !"},
            ].map((avis, i) => (
              <div key={i} className="avis-card">
                <div className="avis-card-stars">
                  {[1,2,3,4,5].map(j => <svg key={j} className="s" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                </div>
                <div className="avis-text">&quot;{avis.t}&quot;</div>
                <div className="avis-meta">
                  <div className="avis-av">{avis.i}</div>
                  <div>
                    <div className="avis-name">{avis.n}</div>
                    <div className="avis-date">{avis.d}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BIENS ── */}
        {biens && biens.length > 0 && (
          <div className="biens-wrap">
            <div className="section-header">
              <div className="section-title">{isAgence ? 'Nos biens' : 'Mes biens'}</div>
              <div className="section-count">{biens.length} bien{biens.length > 1 ? 's' : ''}</div>
            </div>
            {biens.map((bien: any, idx: number) => (
              <div key={bien.id} className="bien-card">
                <div className="bien-slider">
                  <div className="bien-slides" id={`slides-${idx}`}>
                    {bien.photos && bien.photos.length > 0
                      ? bien.photos.slice(0,8).map((photo: string, pi: number) => (
                          <div key={pi} className="bien-slide">
                            <img src={photo} alt={bien.titre} />
                          </div>
                        ))
                      : <div className="bien-slide">🏠</div>
                    }
                  </div>
                  {bien.photos && bien.photos.length > 1 && (
                    <>
                      <button className="bien-nav-btn bien-nav-prev" data-idx={idx} data-dir="-1" data-total={Math.min(bien.photos.length, 8)}>‹</button>
                      <button className="bien-nav-btn bien-nav-next" data-idx={idx} data-dir="1" data-total={Math.min(bien.photos.length, 8)}>›</button>
                      <div className="bien-img-count" id={`count-${idx}`}>1/{Math.min(bien.photos.length, 8)}</div>
                    </>
                  )}
                  <div className="bien-price-overlay">
                    {bien.prix ? bien.prix.toLocaleString('fr-FR') + ' €' : 'Prix sur demande'}
                  </div>
                  <span className={`bien-status-pill ${bien.statut === 'sous_offre' ? 'bp-offre' : 'bp-vente'}`}>
                    {bien.statut === 'sous_offre' ? 'Sous offre' : 'Vente'}
                  </span>
                </div>
                <div className="bien-body">
                  <div className="bien-loc">📍 {bien.ville}{bien.quartier ? ` · ${bien.quartier}` : ''}</div>
                  <div className="bien-title">{bien.titre}</div>
                  <div className="bien-specs-row">
                    {bien.surface && <span className="bspec">⬜ {bien.surface} m²</span>}
                    {bien.pieces && <span className="bspec">🚪 {bien.pieces} p.</span>}
                    {bien.chambres && <span className="bspec">🛏 {bien.chambres} ch.</span>}
                  </div>
                  <button className="bien-cta-btn" data-modal="contact">Voir le bien →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── À PROPOS ── */}
        {agent.bio && (
          <div className="apropos-wrap">
            <div className="section-title" style={{marginBottom:16}}>À propos</div>
            <div className="apropos-top">
              <div className="apropos-av">
                {agent.photo_url ? <img src={agent.photo_url} alt={displayName} /> : <span>{initials}</span>}
              </div>
              <div>
                <div className="apropos-name">{displayName}</div>
                <div className="apropos-role">{isAgence ? 'Agence immobilière' : agent.reseau || 'Conseiller immobilier'}</div>
              </div>
            </div>
            <div className="apropos-text">{agent.bio}</div>
          </div>
        )}

        {/* ── FOOTER CTA ── */}
        <div className="footer-cta">
          <div className="footer-cta-title">Un projet immobilier ?</div>
          <div className="footer-cta-sub">{isAgence ? 'Contactez-nous, nous répondons rapidement.' : 'Contactez-moi directement, je réponds rapidement.'}</div>
          <button className="footer-cta-main" id="footerEstimBtn">📊 Faire estimer mon bien</button>
          <div className="footer-cta-row">
            <button className="footer-cta-sec" id="footerMsgBtn">📲 Message</button>
            <a className="footer-cta-sec" href={`tel:${agent.telephone}`}>📞 Appeler</a>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="footer">
          <a className="foot-link" href="https://kodeoo.fr">
            <span className="foot-k">K</span>
            <span className="foot-l">Propulsé par Kodeoo</span>
          </a>
        </div>

        {/* ── MODALS ── */}
        <div className="overlay" id="m-contact">
          <div className="modal" style={{position:'relative'}}>
            <div className="modal-handle"></div>
            <button className="m-close-btn" id="closeContact" style={{position:'absolute',top:16,right:16}}>×</button>
            <div className="modal-title">Envoyer un message</div>
            <div className="modal-sub">{displayName} vous répond rapidement</div>
            <div className="modal-section">
              <div style={{marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:600,color:'#8E8E93',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.04em'}}>Vous êtes</div>
                <div className="radios">
                  <div className="radio on" id="r-acheteur">Acheteur</div>
                  <div className="radio" id="r-vendeur">Vendeur</div>
                  <div className="radio" id="r-autre">Autre</div>
                </div>
              </div>
              <div className="m-field"><label>Prénom &amp; Nom</label><input type="text" id="cNom" placeholder="Jean Dupont"/></div>
              <div className="m-field"><label>Email</label><input type="email" id="cEmail" placeholder="jean@exemple.fr"/></div>
              <div className="m-field"><label>Téléphone</label><input type="tel" id="cTel" placeholder="06 00 00 00 00"/></div>
              <div className="m-field"><label>Votre projet</label><textarea id="cMsg" placeholder="Décrivez votre projet…"></textarea></div>
            </div>
            <button className="btn-submit" id="submitContact">Envoyer →</button>
          </div>
        </div>

        <div className="overlay" id="m-estimation">
          <div className="modal" style={{position:'relative'}}>
            <div className="modal-handle"></div>
            <button className="m-close-btn" id="closeEstim" style={{position:'absolute',top:16,right:16}}>×</button>
            <div className="modal-title">Estimer mon bien</div>
            <div className="modal-sub">Estimation gratuite sous 24h</div>
            <div className="modal-section">
              <div className="m-field"><label>Adresse</label><input type="text" id="eAdresse" placeholder="12 rue de la Paix, Nice"/></div>
              <div className="m-field"><label>Type de bien</label>
                <select id="eType"><option value="">Choisir...</option><option>Appartement</option><option>Maison</option><option>Villa</option><option>Studio</option></select>
              </div>
              <div className="m-field"><label>Surface (m²)</label><input type="number" id="eSurface" placeholder="75"/></div>
              <div className="m-field"><label>Téléphone</label><input type="tel" id="eTel" placeholder="06 00 00 00 00"/></div>
              <div className="m-field"><label>Email</label><input type="email" id="eEmail" placeholder="jean@exemple.fr"/></div>
            </div>
            <button className="btn-submit" id="submitEstim">Recevoir mon estimation →</button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          var AGENT_ID = '${agentId}';

          function openM(id) {
            var el = document.getElementById('m-' + id);
            if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
          }
          function closeM(id) {
            var el = document.getElementById('m-' + id);
            if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
          }

          document.querySelectorAll('.overlay').forEach(function(o) {
            o.addEventListener('click', function(e) {
              if (e.target === o) { o.classList.remove('open'); document.body.style.overflow = ''; }
            });
          });

          document.getElementById('closeContact')?.addEventListener('click', function() { closeM('contact'); });
          document.getElementById('closeEstim')?.addEventListener('click', function() { closeM('estimation'); });
          document.getElementById('heroEstimBtn')?.addEventListener('click', function() { openM('estimation'); });
          document.getElementById('heroMsgBtn')?.addEventListener('click', function() { openM('contact'); });
          document.getElementById('footerEstimBtn')?.addEventListener('click', function() { openM('estimation'); });
          document.getElementById('footerMsgBtn')?.addEventListener('click', function() { openM('contact'); });

          document.querySelectorAll('.radio').forEach(function(r) {
            r.addEventListener('click', function() {
              r.closest('.radios').querySelectorAll('.radio').forEach(function(x) { x.classList.remove('on'); });
              r.classList.add('on');
            });
          });

          document.querySelectorAll('.bien-cta-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { openM('contact'); });
          });

          var sliderPos = {};
          document.querySelectorAll('.bien-nav-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
              e.stopPropagation();
              var idx = parseInt(btn.getAttribute('data-idx'));
              var dir = parseInt(btn.getAttribute('data-dir'));
              var total = parseInt(btn.getAttribute('data-total'));
              if (!sliderPos[idx]) sliderPos[idx] = 0;
              sliderPos[idx] = (sliderPos[idx] + dir + total) % total;
              var slides = document.getElementById('slides-' + idx);
              if (slides) slides.style.transform = 'translateX(-' + (sliderPos[idx] * 100) + '%)';
              var count = document.getElementById('count-' + idx);
              if (count) count.textContent = (sliderPos[idx] + 1) + '/' + total;
            });
          });

          async function submitLead(type) {
            var data = { agent_id: AGENT_ID, type: type };
            if (type === 'contact') {
              data.nom = document.getElementById('cNom')?.value || '';
              data.email = document.getElementById('cEmail')?.value || '';
              data.telephone = document.getElementById('cTel')?.value || '';
              data.message = document.getElementById('cMsg')?.value || '';
            } else if (type === 'estimation') {
              data.nom = 'Prospect estimation';
              data.email = (document.getElementById('eEmail') || document.getElementById('estimEmail'))?.value || '';
              data.telephone = (document.getElementById('eTel') || document.getElementById('estimTel'))?.value || '';
              var adresse = (document.getElementById('eAdresse') || document.getElementById('estimAdresse'))?.value || '';
              var surface = (document.getElementById('eSurface') || document.getElementById('estimSurface'))?.value || '';
              var typeB = (document.getElementById('eType') || document.getElementById('estimType'))?.value || '';
              data.message = 'Adresse: ' + adresse + ' | Type: ' + typeB + ' | Surface: ' + surface + 'm²';
            } else if (type === 'lead_magnet') {
              data.nom = document.getElementById('lmPrenom')?.value || '';
              data.email = document.getElementById('lmEmail')?.value || '';
              data.lead_magnet = 'Guide Vendeur 2026';
              data.message = '';
            }
            if (!data.email) { alert('Veuillez renseigner votre email'); return; }
            try {
              var res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });
              var result = await res.json();
              if (result.success) {
                closeM('contact'); closeM('estimation');
                alert('✅ Votre demande a bien été envoyée !');
              }
            } catch(e) { alert('Erreur réseau, veuillez réessayer'); }
          }

          document.getElementById('submitContact')?.addEventListener('click', function() { submitLead('contact'); });
          document.getElementById('submitEstim')?.addEventListener('click', function() { submitLead('estimation'); });
          document.getElementById('lmBtn')?.addEventListener('click', function() { submitLead('lead_magnet'); });
          document.getElementById('estimBtn')?.addEventListener('click', function() { submitLead('estimation'); });
        })();
      `}} />
    </>
  )
}

export const revalidate = 60