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
  const initials = isAgence ? agent.nom[0] : `${agent.prenom?.[0] || ''}${agent.nom?.[0] || ''}`
  const agentId = agent.id

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#EBEBF0;font-family:system-ui,sans-serif;color:#0D0D12;display:flex;justify-content:center;min-height:100vh}
        .page-wrap{width:100%;max-width:430px;background:#fff;min-height:100vh;position:relative;box-shadow:0 0 40px rgba(0,0,0,0.08)}
        .hero{background:#fff;padding:20px 16px 0}
        .hero-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
        .kodeoo-badge{display:flex;align-items:center;gap:6px;padding:5px 11px;background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:20px;font-size:11px;font-weight:600;color:#6B6B80;text-decoration:none}
        .kodeoo-dot{width:6px;height:6px;border-radius:50%;background:#6347FF}
        .live{display:flex;align-items:center;gap:5px;padding:5px 10px;background:rgba(0,179,125,0.08);border:1px solid rgba(0,179,125,0.18);border-radius:20px;font-size:11px;font-weight:500;color:#00B37D}
        .live-dot{width:5px;height:5px;border-radius:50%;background:#00B37D;animation:lp 1.5s infinite}
        @keyframes lp{0%,100%{opacity:1}50%{opacity:0.4}}
        .hero-card{background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:20px;padding:22px 18px;margin:0 0 12px;box-shadow:0 2px 16px rgba(0,0,0,0.06);position:relative}
        .hero-card::before{content:'';position:absolute;top:0;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,rgba(99,71,255,0.3),transparent)}
        .profile-row{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px}
        .avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#EEF0FF,#E0DCFF);border:2px solid rgba(99,71,255,0.15);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600;color:#6347FF;flex-shrink:0;overflow:hidden;position:relative}
        .avatar img{width:100%;height:100%;object-fit:cover}
        .avatar-status{position:absolute;bottom:2px;right:2px;width:14px;height:14px;border-radius:50%;background:#00B37D;border:2px solid #fff}
        .profile-info{flex:1;min-width:0}
        .profile-name{font-size:20px;font-weight:700;color:#0D0D12;letter-spacing:-0.02em;margin-bottom:2px;line-height:1.2}
        .profile-positioning{font-size:13px;color:#6B6B80;margin-bottom:8px;line-height:1.5}
        .profile-tags{display:flex;flex-wrap:wrap;gap:5px}
        .tag{padding:3px 9px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);border-radius:20px;font-size:11px;color:#6B6B80}
        .tag-v{background:#EEF0FF;border-color:rgba(99,71,255,0.2);color:#6347FF}
        .proofs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
        .proof{display:flex;align-items:center;gap:5px;padding:5px 10px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.07);border-radius:20px;font-size:12px;font-weight:500;color:#0D0D12}
        .cta-main{width:100%;height:52px;background:#6347FF;color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;margin-bottom:10px;transition:background 0.18s;letter-spacing:-0.01em}
        .cta-main:hover{background:#4F35E8}
        .cta-secondary{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .cta-sec{height:44px;border-radius:10px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;text-decoration:none;transition:all 0.18s;border:none}
        .cta-sec-msg{background:#F7F7FA;color:#0D0D12;border:1px solid rgba(0,0,0,0.1)}
        .cta-sec-msg:hover{border-color:rgba(99,71,255,0.3);color:#6347FF}
        .cta-sec-tel{background:#F7F7FA;color:#0D0D12;border:1px solid rgba(0,0,0,0.1)}
        .cta-sec-tel:hover{border-color:rgba(0,179,125,0.3);color:#00B37D}
        .section{padding:24px 16px}
        .section-label{font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#A0A0B8;margin-bottom:14px;display:flex;align-items:center;gap:8px}
        .section-label::after{content:'';flex:1;height:1px;background:rgba(0,0,0,0.06)}
        .lm-card{background:linear-gradient(135deg,#F5F3FF,#EEF0FF);border:1px solid rgba(99,71,255,0.15);border-radius:16px;padding:22px 18px;margin:0 16px}
        .lm-icon{width:48px;height:48px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px;box-shadow:0 2px 8px rgba(99,71,255,0.1)}
        .lm-title{font-size:18px;font-weight:700;color:#0D0D12;margin-bottom:6px;letter-spacing:-0.01em}
        .lm-sub{font-size:13px;color:#6B6B80;line-height:1.6;margin-bottom:18px}
        .lm-form{display:flex;flex-direction:column;gap:8px}
        .lm-input{height:42px;background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:9px;padding:0 13px;font-family:inherit;font-size:13px;color:#0D0D12;outline:none;width:100%}
        .lm-input:focus{border-color:rgba(99,71,255,0.4)}
        .lm-input::placeholder{color:#A0A0B8}
        .lm-btn{height:46px;background:#6347FF;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.18s;width:100%}
        .lm-btn:hover{background:#4F35E8}
        .estim-card{background:#0D0D12;border-radius:16px;padding:22px 18px;margin:0 16px;position:relative;overflow:hidden}
        .estim-card::before{content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:radial-gradient(circle,rgba(99,71,255,0.3),transparent 70%);pointer-events:none}
        .estim-label{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:8px}
        .estim-title{font-size:20px;font-weight:700;color:#fff;margin-bottom:6px;letter-spacing:-0.01em;line-height:1.3}
        .estim-sub{font-size:13px;color:rgba(255,255,255,0.55);line-height:1.6;margin-bottom:18px}
        .estim-form{display:flex;flex-direction:column;gap:8px}
        .estim-input{height:42px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:9px;padding:0 13px;font-family:inherit;font-size:13px;color:#fff;outline:none;width:100%;-webkit-appearance:none}
        .estim-input:focus{border-color:rgba(99,71,255,0.6);background:rgba(255,255,255,0.12)}
        .estim-input::placeholder{color:rgba(255,255,255,0.35)}
        .estim-select{height:42px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:9px;padding:0 13px;font-family:inherit;font-size:13px;color:#fff;outline:none;width:100%;-webkit-appearance:none;cursor:pointer}
        .estim-btn{height:46px;background:#6347FF;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.18s;width:100%;margin-top:4px}
        .estim-btn:hover{background:#4F35E8}
        .avis-header{display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:0 16px}
        .avis-global{display:flex;align-items:center;gap:10px}
        .avis-note{font-size:36px;font-weight:700;color:#0D0D12;letter-spacing:-0.03em}
        .avis-stars{display:flex;gap:2px;margin-bottom:2px}
        .star{width:14px;height:14px;fill:#F59E0B}
        .avis-count{font-size:12px;color:#A0A0B8}
        .avis-google{display:flex;align-items:center;gap:5px;margin-left:auto;padding:5px 10px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);border-radius:20px;font-size:11px;color:#6B6B80;font-weight:500}
        .avis-scroll{display:flex;gap:12px;overflow-x:auto;padding:0 16px 4px;scrollbar-width:none}
        .avis-scroll::-webkit-scrollbar{display:none}
        .avis-card{background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:14px;padding:16px;min-width:260px;max-width:260px;flex-shrink:0}
        .avis-card-stars{display:flex;gap:2px;margin-bottom:8px}
        .avis-text{font-size:13px;line-height:1.6;color:#0D0D12;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
        .avis-meta{display:flex;align-items:center;gap:8px}
        .avis-av{width:28px;height:28px;border-radius:50%;background:#EEF0FF;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#6347FF;flex-shrink:0}
        .avis-name{font-size:12px;font-weight:500;color:#0D0D12}
        .avis-date{font-size:11px;color:#A0A0B8}
        .biens-scroll{display:flex;gap:12px;overflow-x:auto;padding:0 16px 4px;scrollbar-width:none}
        .biens-scroll::-webkit-scrollbar{display:none}
        .bien-card{background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;min-width:260px;max-width:260px;flex-shrink:0;overflow:hidden;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s}
        .bien-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.1)}
        .bien-slider{position:relative;height:170px;overflow:hidden;background:linear-gradient(135deg,#F0EEFF,#E8E6F5)}
        .bien-slides{display:flex;height:100%;transition:transform 0.3s ease}
        .bien-slide{min-width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:40px;flex-shrink:0}
        .bien-slide img{width:100%;height:100%;object-fit:cover}
        .bien-slider-prev,.bien-slider-next{position:absolute;top:50%;transform:translateY(-50%);width:28px;height:28px;background:rgba(255,255,255,0.85);border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;backdrop-filter:blur(4px)}
        .bien-slider-prev{left:8px}
        .bien-slider-next{right:8px}
        .bien-dots{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:4px}
        .bien-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.5)}
        .bien-dot.on{background:#fff}
        .bien-status-badge{position:absolute;top:8px;left:8px;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:600}
        .bs-vente{background:rgba(99,71,255,0.15);border:1px solid rgba(99,71,255,0.3);color:#6347FF}
        .bs-offre{background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);color:#B45309}
        .bien-body{padding:12px}
        .bien-loc{font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6347FF;margin-bottom:3px}
        .bien-title{font-size:14px;font-weight:600;color:#0D0D12;margin-bottom:4px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .bien-price{font-size:18px;font-weight:700;color:#0D0D12;letter-spacing:-0.02em;margin-bottom:8px}
        .bien-pills{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px}
        .pill{font-size:10px;font-weight:500;color:#6B6B80;background:#F7F7FA;padding:3px 7px;border-radius:5px;border:1px solid rgba(0,0,0,0.07)}
        .bien-cta{width:100%;height:34px;background:#6347FF;color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;text-decoration:none;transition:background 0.18s}
        .bien-cta:hover{background:#4F35E8}
        .apropos{padding:24px 16px}
        .apropos-card{background:#F7F7FA;border-radius:16px;padding:20px}
        .apropos-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
        .apropos-avatar{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#EEF0FF,#E0DCFF);border:2px solid rgba(99,71,255,0.15);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:#6347FF;flex-shrink:0;overflow:hidden}
        .apropos-avatar img{width:100%;height:100%;object-fit:cover}
        .apropos-name{font-size:15px;font-weight:600;color:#0D0D12}
        .apropos-role{font-size:12px;color:#6B6B80}
        .apropos-text{font-size:14px;line-height:1.7;color:#4A4A5A}
        .socials{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:0 16px}
        .soc{width:44px;height:44px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:18px;transition:all 0.18s}
        .soc:hover{background:#EEF0FF;border-color:rgba(99,71,255,0.2)}
        .footer-cta{margin:24px 16px;background:#0D0D12;border-radius:20px;padding:28px 20px;text-align:center}
        .footer-cta-title{font-size:22px;font-weight:700;color:#fff;margin-bottom:6px;letter-spacing:-0.02em}
        .footer-cta-sub{font-size:14px;color:rgba(255,255,255,0.5);margin-bottom:20px}
        .footer-cta-btns{display:flex;flex-direction:column;gap:8px}
        .footer-btn-main{height:48px;background:#6347FF;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;transition:background 0.18s;width:100%}
        .footer-btn-main:hover{background:#4F35E8}
        .footer-btn-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .footer-btn-sec{height:44px;background:rgba(255,255,255,0.08);color:#fff;border:1px solid rgba(255,255,255,0.12);border-radius:10px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;transition:background 0.18s}
        .footer-btn-sec:hover{background:rgba(255,255,255,0.15)}
        .footer{padding:20px 16px 40px;text-align:center}
        .foot{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);border-radius:20px;text-decoration:none}
        .foot-k{width:15px;height:15px;background:#6347FF;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff}
        .foot-l{font-size:11px;font-weight:500;color:#A0A0B8}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(3px);z-index:200;display:none;align-items:flex-end;justify-content:center}
        .overlay.open{display:flex}
        .modal{background:#fff;border-radius:20px 20px 0 0;padding:20px 18px 40px;width:100%;max-width:430px;animation:su .28s ease;position:relative;max-height:92vh;overflow-y:auto}
        @keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .m-handle{width:34px;height:4px;background:rgba(0,0,0,0.1);border-radius:2px;margin:0 auto 18px}
        .m-title{font-size:20px;font-weight:700;color:#0D0D12;margin-bottom:4px;letter-spacing:-0.01em}
        .m-sub{font-size:13px;color:#6B6B80;margin-bottom:18px;line-height:1.5}
        .m-close{position:absolute;top:16px;right:16px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;color:#6B6B80}
        .field{margin-bottom:10px}
        .field label{display:block;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#A0A0B8;margin-bottom:4px}
        .field input,.field select,.field textarea{width:100%;height:41px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.1);border-radius:9px;padding:0 12px;font-family:inherit;font-size:13px;color:#0D0D12;outline:none;-webkit-appearance:none}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:rgba(99,71,255,0.4);background:#fff}
        .field textarea{height:74px;padding:10px 12px;resize:none;line-height:1.5}
        .field input::placeholder,.field textarea::placeholder{color:#A0A0B8}
        .radios{display:flex;gap:6px;margin-bottom:10px}
        .radio{flex:1;height:36px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.1);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;color:#6B6B80;cursor:pointer;font-family:inherit}
        .radio.on{background:#EEF0FF;border-color:rgba(99,71,255,0.35);color:#6347FF}
        .btn-sub{width:100%;height:48px;background:#6347FF;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;margin-top:4px;display:flex;align-items:center;justify-content:center;gap:7px;transition:background 0.18s}
        .btn-sub:hover{background:#4F35E8}
        .div{height:1px;background:rgba(0,0,0,0.06);margin:4px 16px}
      `}</style>

      <div className="page-wrap">
        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-top">
            <a className="kodeoo-badge" href="https://kodeoo.fr">
              <span className="kodeoo-dot"></span>
              Kodeoo
            </a>
            <div className="live">
              <span className="live-dot"></span>
              En ligne
            </div>
          </div>

          <div className="hero-card">
            <div className="profile-row">
              <div className="avatar">
                {agent.photo_url
                  ? <img src={agent.photo_url} alt={displayName} />
                  : <span>{initials}</span>
                }
                <span className="avatar-status"></span>
              </div>
              <div className="profile-info">
                <div className="profile-name">{displayName}</div>
                <div className="profile-positioning">
                  {isAgence ? `Agence immobilière · ${agent.ville}` : `${agent.reseau ? agent.reseau + ' · ' : ''}${agent.ville}`}
                </div>
                <div className="profile-tags">
                  <span className="tag tag-v">📍 {agent.ville}</span>
                  {agent.reseau && <span className="tag">{agent.reseau}</span>}
                </div>
              </div>
            </div>

            <div className="proofs">
              {agent.google_rating && <span className="proof">⭐ {agent.google_rating}/5 Google</span>}
              {agent.biens_vendus > 0 && <span className="proof">✅ +{agent.biens_vendus} {isAgence ? 'biens vendus' : 'ventes réalisées'}</span>}
            </div>

            <button className="cta-main" id="heroEstimBtn">
  📊 Faire estimer mon bien
</button>

            <div className="cta-secondary">
              <button className="cta-sec cta-sec-msg" id="heroMsgBtn">
  📲 Message
</button>
              <a className="cta-sec cta-sec-tel" href={`tel:${agent.telephone}`}>
                📞 Appeler
              </a>
            </div>
          </div>
        </div>

        <div className="div"></div>

        {/* ── LEAD MAGNET ── */}
        <div className="section" style={{paddingBottom:0}}>
          <div className="section-label">Guide gratuit</div>
        </div>
        <div className="lm-card">
          <div className="lm-icon">📄</div>
          <div className="lm-title">Vendre au meilleur prix en 2026</div>
          <div className="lm-sub">Téléchargez gratuitement notre guide complet pour préparer votre vente et maximiser votre prix.</div>
          <div className="lm-form">
            <input className="lm-input" type="text" placeholder="Votre prénom" id="lmPrenom" />
            <input className="lm-input" type="email" placeholder="Votre email" id="lmEmail" />
            <button className="lm-btn" id="lmBtn">
              📩 Télécharger gratuitement
            </button>
          </div>
        </div>

        <div className="div" style={{margin:'20px 16px'}}></div>

        {/* ── ESTIMATION ── */}
        <div className="section" style={{paddingBottom:0}}>
          <div className="section-label">Estimation gratuite</div>
        </div>
        <div className="estim-card">
          <div className="estim-label">Outil gratuit</div>
          <div className="estim-title">Quelle est la vraie valeur de votre bien ?</div>
          <div className="estim-sub">Recevez une estimation gratuite et personnalisée de votre bien en moins de 24h.</div>
          <div className="estim-form">
            <input className="estim-input" type="text" placeholder="Adresse du bien" id="estimAdresse" />
            <select className="estim-select" id="estimType">
              <option value="">Type de bien</option>
              <option value="appartement">Appartement</option>
              <option value="maison">Maison</option>
              <option value="villa">Villa</option>
              <option value="studio">Studio</option>
              <option value="local">Local commercial</option>
            </select>
            <input className="estim-input" type="number" placeholder="Surface en m²" id="estimSurface" />
            <input className="estim-input" type="tel" placeholder="Votre téléphone" id="estimTel" />
            <input className="estim-input" type="email" placeholder="Votre email" id="estimEmail" />
            <button className="estim-btn" id="estimBtn">
              📊 Recevoir mon estimation gratuite
            </button>
          </div>
        </div>

        <div className="div" style={{margin:'20px 16px'}}></div>

        {/* ── AVIS ── */}
        <div className="section" style={{paddingBottom:12}}>
          <div className="section-label">Avis clients</div>
        </div>
        <div className="avis-header">
          <div className="avis-global">
            <div className="avis-note">{agent.google_rating || '–'}</div>
            <div>
              <div className="avis-stars">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="star" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <div className="avis-count">Avis Google</div>
            </div>
          </div>
          <div className="avis-google">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
            Google
          </div>
        </div>
        <div className="avis-scroll">
          {[
            {initiales:'MR', nom:'Marie R.', date:'Mars 2026', texte:"Excellent accompagnement du début à la fin. Professionnel, réactif et de très bons conseils. Je recommande vivement !"},
            {initiales:'TC', nom:'Thomas C.', date:'Fév. 2026', texte:"Première acquisition et j'ai été guidé parfaitement. Une vraie expertise du marché local, très rassurant."},
            {initiales:'SL', nom:'Sophie L.', date:'Jan. 2026', texte:"Vente conclue en 3 semaines au prix demandé. Résultat exceptionnel, merci !"},
          ].map((avis, i) => (
            <div key={i} className="avis-card">
              <div className="avis-card-stars">
                {[1,2,3,4,5].map(j => (
                  <svg key={j} className="star" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <div className="avis-text">&quot;{avis.texte}&quot;</div>
              <div className="avis-meta">
                <div className="avis-av">{avis.initiales}</div>
                <div>
                  <div className="avis-name">{avis.nom}</div>
                  <div className="avis-date">{avis.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="div" style={{margin:'20px 16px'}}></div>

        {/* ── BIENS ── */}
        {biens && biens.length > 0 && (
          <>
            <div className="section" style={{paddingBottom:12}}>
              <div className="section-label">{isAgence ? 'Nos biens' : 'Mes biens'} · {biens.length}</div>
            </div>
            <div className="biens-scroll">
              {biens.map((bien: any, idx: number) => (
                <div key={bien.id} className="bien-card">
                  <div className="bien-slider" id={`slider-${idx}`}>
                    <div className="bien-slides" id={`slides-${idx}`}>
                      {bien.photos && bien.photos.length > 0
                        ? bien.photos.slice(0,5).map((photo: string, pi: number) => (
                            <div key={pi} className="bien-slide">
                              <img src={photo} alt={bien.titre} />
                            </div>
                          ))
                        : <div className="bien-slide">🏠</div>
                      }
                    </div>
                    {bien.photos && bien.photos.length > 1 && (
                      <>
                        <button className="bien-slider-prev" data-idx={idx} data-dir="-1" data-total={Math.min(bien.photos.length, 5)}>‹</button>
                        <button className="bien-slider-next" data-idx={idx} data-dir="1" data-total={Math.min(bien.photos.length, 5)}>›</button>
                        <div className="bien-dots" id={`dots-${idx}`}>
                          {bien.photos.slice(0,5).map((_: any, di: number) => (
                            <div key={di} className={`bien-dot ${di === 0 ? 'on' : ''}`}></div>
                          ))}
                        </div>
                      </>
                    )}
                    <span className={`bien-status-badge ${bien.statut === 'sous_offre' ? 'bs-offre' : 'bs-vente'}`}>
                      {bien.statut === 'sous_offre' ? 'Sous offre' : 'Vente'}
                    </span>
                  </div>
                  <div className="bien-body">
                    <div className="bien-loc">{bien.ville}{bien.quartier ? ` · ${bien.quartier}` : ''}</div>
                    <div className="bien-title">{bien.titre}</div>
                    <div className="bien-price">{bien.prix ? bien.prix.toLocaleString('fr-FR') + ' €' : 'Prix sur demande'}</div>
                    <div className="bien-pills">
                      {bien.surface && <span className="pill">{bien.surface} m²</span>}
                      {bien.pieces && <span className="pill">{bien.pieces} P.</span>}
                      {bien.chambres && <span className="pill">{bien.chambres} CH.</span>}
                      {bien.dpe && <span className="pill">DPE {bien.dpe}</span>}
                    </div>
                    <button className="bien-cta" data-modal="contact">
                      Voir ce bien →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="div" style={{margin:'20px 16px'}}></div>

        {/* ── À PROPOS ── */}
        {agent.bio && (
          <div className="apropos">
            <div className="section-label" style={{marginBottom:14}}>À propos</div>
            <div className="apropos-card">
              <div className="apropos-top">
                <div className="apropos-avatar">
                  {agent.photo_url
                    ? <img src={agent.photo_url} alt={displayName} />
                    : <span>{initials}</span>
                  }
                </div>
                <div>
                  <div className="apropos-name">{displayName}</div>
                  <div className="apropos-role">{isAgence ? 'Agence immobilière' : `${agent.reseau || 'Conseiller immobilier'}`}</div>
                </div>
              </div>
              <div className="apropos-text">{agent.bio}</div>
            </div>
          </div>
        )}

        {/* ── RÉSEAUX SOCIAUX ── */}
        {(agent.instagram || agent.tiktok || agent.facebook || agent.linkedin || agent.youtube || agent.site_web) && (
          <div style={{padding:'0 16px 24px'}}>
            <div className="section-label" style={{marginBottom:14}}>
              {isAgence ? 'Retrouvez-nous sur' : 'Retrouvez-moi sur'}
            </div>
            <div className="socials">
              {agent.instagram && <a className="soc" href={`https://instagram.com/${agent.instagram}`} target="_blank" rel="noreferrer" title="Instagram">📸</a>}
              {agent.tiktok && <a className="soc" href={`https://tiktok.com/@${agent.tiktok}`} target="_blank" rel="noreferrer" title="TikTok">🎵</a>}
              {agent.facebook && <a className="soc" href={agent.facebook.startsWith('http') ? agent.facebook : `https://facebook.com/${agent.facebook}`} target="_blank" rel="noreferrer" title="Facebook">👤</a>}
              {agent.linkedin && <a className="soc" href={agent.linkedin.startsWith('http') ? agent.linkedin : `https://linkedin.com/in/${agent.linkedin}`} target="_blank" rel="noreferrer" title="LinkedIn">💼</a>}
              {agent.youtube && <a className="soc" href={`https://youtube.com/@${agent.youtube}`} target="_blank" rel="noreferrer" title="YouTube">▶️</a>}
              {agent.site_web && <a className="soc" href={agent.site_web.startsWith('http') ? agent.site_web : `https://${agent.site_web}`} target="_blank" rel="noreferrer" title="Site web">🌐</a>}
            </div>
          </div>
        )}

        <div className="div"></div>

        {/* ── FOOTER CTA ── */}
        <div className="footer-cta">
          <div className="footer-cta-title">Un projet immobilier ?</div>
          <div className="footer-cta-sub">
            {isAgence ? 'Contactez-nous directement, nous répondons rapidement.' : 'Contactez-moi directement, je réponds rapidement.'}
          </div>
          <div className="footer-cta-btns">
            <button className="footer-btn-main" id="footerEstimBtn">
              📊 Faire estimer mon bien
            </button>
            <div className="footer-btn-row">
              <button className="footer-btn-sec" id="footerMsgBtn">📲 Message</button>
              <a className="footer-btn-sec" href={`tel:${agent.telephone}`}>📞 Appeler</a>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="footer">
          <a className="foot" href="https://kodeoo.fr">
            <span className="foot-k">K</span>
            <span className="foot-l">Propulsé par Kodeoo</span>
          </a>
        </div>

        {/* ── MODALS ── */}
        <div className="overlay" id="m-contact">
          <div className="modal">
            <div className="m-handle"></div>
            <button className="m-close" id="closeContact">×</button>
            <div className="m-title">Envoyer un message</div>
            <div className="m-sub">{displayName} vous répond rapidement</div>
            <div className="field"><label>Vous êtes</label>
              <div className="radios">
                <div className="radio on" id="r-acheteur">Acheteur</div>
                <div className="radio" id="r-vendeur">Vendeur</div>
                <div className="radio" id="r-autre">Autre</div>
              </div>
            </div>
            <div className="field"><label>Prénom &amp; Nom</label><input type="text" id="cNom" placeholder="Jean Dupont"/></div>
            <div className="field"><label>Email</label><input type="email" id="cEmail" placeholder="jean@exemple.fr"/></div>
            <div className="field"><label>Téléphone</label><input type="tel" id="cTel" placeholder="06 00 00 00 00"/></div>
            <div className="field"><label>Votre projet</label><textarea id="cMsg" placeholder="Décrivez votre projet…"></textarea></div>
            <button className="btn-sub" id="submitContact">Envoyer →</button>
          </div>
        </div>

        <div className="overlay" id="m-estimation">
          <div className="modal">
            <div className="m-handle"></div>
            <button className="m-close" id="closeEstim">×</button>
            <div className="m-title">Estimer mon bien</div>
            <div className="m-sub">Recevez votre estimation gratuite sous 24h</div>
            <div className="field"><label>Adresse</label><input type="text" id="eAdresse" placeholder="ex. 12 rue de la Paix, Nice"/></div>
            <div className="field"><label>Type de bien</label>
              <select id="eType">
                <option value="">Choisir...</option>
                <option>Appartement</option>
                <option>Maison</option>
                <option>Villa</option>
                <option>Studio</option>
              </select>
            </div>
            <div className="field"><label>Surface (m²)</label><input type="number" id="eSurface" placeholder="ex. 75"/></div>
            <div className="field"><label>Téléphone</label><input type="tel" id="eTel" placeholder="06 00 00 00 00"/></div>
            <div className="field"><label>Email</label><input type="email" id="eEmail" placeholder="jean@exemple.fr"/></div>
            <button className="btn-sub" id="submitEstim">Recevoir mon estimation →</button>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          const AGENT_ID = '${agentId}';

          // ── Modals ──
          function openM(id) {
            const el = document.getElementById('m-' + id);
            if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
          }
          function closeM(id) {
            const el = document.getElementById('m-' + id);
            if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
          }

          document.querySelectorAll('.overlay').forEach(function(o) {
            o.addEventListener('click', function(e) {
              if (e.target === o) { o.classList.remove('open'); document.body.style.overflow = ''; }
            });
          });

          document.getElementById('closeContact')?.addEventListener('click', function() { closeM('contact'); });
          document.getElementById('closeEstim')?.addEventListener('click', function() { closeM('estimation'); });

          // Boutons CTA
          document.getElementById('footerEstimBtn')?.addEventListener('click', function() { openM('estimation'); });
          document.getElementById('footerMsgBtn')?.addEventListener('click', function() { openM('contact'); });

          // Radios
          document.querySelectorAll('.radio').forEach(function(r) {
            r.addEventListener('click', function() {
              r.closest('.radios').querySelectorAll('.radio').forEach(function(x) { x.classList.remove('on'); });
              r.classList.add('on');
            });
          });

          // Boutons bien CTA
          document.querySelectorAll('.bien-cta').forEach(function(btn) {
            btn.addEventListener('click', function() { openM('contact'); });
          });

          // ── Slider biens ──
          var sliderPos = {};
          function slideB(idx, dir, total) {
            if (!sliderPos[idx]) sliderPos[idx] = 0;
            sliderPos[idx] = (sliderPos[idx] + dir + total) % total;
            var slides = document.getElementById('slides-' + idx);
            if (slides) slides.style.transform = 'translateX(-' + (sliderPos[idx] * 100) + '%)';
            var dots = document.querySelectorAll('#dots-' + idx + ' .bien-dot');
            dots.forEach(function(d, i) { d.classList.toggle('on', i === sliderPos[idx]); });
          }

          document.querySelectorAll('.bien-slider-prev, .bien-slider-next').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
              e.stopPropagation();
              var idx = parseInt(btn.getAttribute('data-idx'));
              var dir = parseInt(btn.getAttribute('data-dir'));
              var total = parseInt(btn.getAttribute('data-total'));
              slideB(idx, dir, total);
            });
          });

          // ── Submit leads ──
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
                closeM('contact');
                closeM('estimation');
                alert('✅ Votre demande a bien été envoyée !');
              }
            } catch(e) {
              alert('Erreur réseau, veuillez réessayer');
            }
          }

          document.getElementById('submitContact')?.addEventListener('click', function() { submitLead('contact'); });
          document.getElementById('submitEstim')?.addEventListener('click', function() { submitLead('estimation'); });
          document.getElementById('lmBtn')?.addEventListener('click', function() { submitLead('lead_magnet'); });
          document.getElementById('estimBtn')?.addEventListener('click', function() { submitLead('estimation'); });
          document.getElementById('heroEstimBtn')?.addEventListener('click', function() { openM('estimation'); });
document.getElementById('heroMsgBtn')?.addEventListener('click', function() { openM('contact'); });
        })();
      `}} />
    </>
  )
}

export const revalidate = 60