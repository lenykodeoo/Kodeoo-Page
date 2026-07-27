import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'

function decodeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&egrave;/g, 'è')
    .replace(/&eacute;/g, 'é')
    .replace(/&agrave;/g, 'à')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&ucirc;/g, 'û')
    .replace(/\s+/g, ' ')
    .trim()
}

const LEAD_MAGNETS: Record<string, { titre: string; description: string; icone: string }> = {
  guide_vendeur: { titre: 'Guide vendeur 2026', description: 'Les étapes clés pour vendre son bien rapidement et au meilleur prix', icone: 'ti-book' },
  checklist_estimation: { titre: 'Checklist estimation', description: 'Découvrez où se situe votre bien sur le marché', icone: 'ti-checklist' }
}

export default async function AgentPage(props: any) {
  const params = await props.params
  const slug = params.slug

  const { data: agent, error } = await supabaseAdmin
    .from('agents').select('*').eq('slug', slug).eq('is_active', true).single()

  if (error || !agent) notFound()

  const { data: biens } = await supabaseAdmin
    .from('biens').select('*').eq('agent_id', agent.id).neq('statut', 'vendu').order('created_at', { ascending: false })

  const { data: ressources } = await supabaseAdmin
    .from('ressources').select('*').eq('agent_id', agent.id).eq('actif', true)

  const { data: avisData } = await supabaseAdmin
    .from('avis').select('*').eq('agent_id', agent.id).order('created_at', { ascending: false }).limit(10)

  try {
    await supabaseAdmin.from('page_views').insert({ agent_id: agent.id })
  } catch {}

  const isAgence = agent.type === 'agence'
  const displayName = isAgence ? agent.nom : `${agent.prenom} ${agent.nom}`
  const initials = isAgence ? agent.nom?.[0] : `${agent.prenom?.[0] || ''}${agent.nom?.[0] || ''}`
  const agentId = agent.id

  // Sérialisation sécurisée des biens pour le JS
 const biensEncoded = Buffer.from(JSON.stringify(
    (biens || []).map((b: any) => ({
      id: b.id,
      titre: (b.titre || '').replace(/Ã¨/g, 'è').replace(/Ã©/g, 'é').replace(/Ã /g, 'à').replace(/Ã§/g, 'ç').replace(/Ã´/g, 'ô').replace(/Ã»/g, 'û').replace(/Ã®/g, 'î').replace(/Ã«/g, 'ë').replace(/â€™/g, "'").replace(/â€"/g, '–').replace(/â€œ/g, '"').replace(/â€/g, '"'),
      prix: b.prix,
      surface: b.surface,
      pieces: b.pieces,
      chambres: b.chambres,
      ville: b.ville || '',
      description: '',
      photos: b.photos || [],
      dpe: b.dpe,
      statut: b.statut,
    }))
  )).toString('base64')

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{background:#F5F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1C1C1E;display:flex;justify-content:center;min-height:100vh}
        .wrap{width:100%;max-width:480px;background:#fff;min-height:100vh}
        .kodeoo-top{padding:10px 16px;text-align:center;background:#F5F5F0}
        .kodeoo-top a{font-size:12px;color:#8E8E93;text-decoration:none;display:inline-flex;align-items:center;gap:5px}
        .k-dot{width:13px;height:13px;background:#1C1C1E;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff}
        .hero{background:#fff;padding:28px 16px 22px;margin-bottom:8px}
        .hero-center{display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:22px}
        .avatar{width:110px;height:110px;border-radius:50%;background:#E8E8E8;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#6B6B80;margin-bottom:14px;overflow:hidden;flex-shrink:0}
        .avatar img{width:100%;height:100%;object-fit:cover}
        .h-name{font-size:24px;font-weight:700;color:#1C1C1E;letter-spacing:-0.5px;margin-bottom:5px}
        .h-sub{font-size:14px;color:#6B6B80;margin-bottom:10px}
        .h-rating{display:flex;align-items:center;justify-content:center;gap:5px;font-size:13px;color:#1C1C1E}
        .stars{color:#FF9500;font-size:13px;letter-spacing:1px}
        .h-rating-count{color:#8E8E93}
        .proofs{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:22px}
        .proof{padding:5px 12px;background:#EFEFEF;border-radius:6px;font-size:12px;color:#3C3C43;font-weight:500}
        .cta-main{width:100%;height:52px;background:#fff;border:1.5px solid #1C1C1E;border-radius:8px;font-size:15px;font-weight:600;color:#1C1C1E;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;font-family:inherit;transition:background 0.15s}
        .cta-main:hover{background:#F5F5F0}
        .cta-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .cta-sec{height:46px;background:#fff;border:1px solid #E0E0DB;border-radius:8px;font-size:14px;font-weight:500;color:#1C1C1E;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;font-family:inherit;transition:background 0.15s}
        .cta-sec:hover{background:#EBEBEB}
        .socials-bar{background:#fff;padding:14px 16px;margin-bottom:8px;display:flex;justify-content:center;gap:10px}
        .soc{width:44px;height:44px;background:#EFEFEF;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:20px;transition:background 0.15s}
        .soc:hover{background:#EBEBEB}
        .section-wrap{background:#fff;margin-bottom:8px;padding:20px 16px}
        .sec-label{font-size:11px;font-weight:600;color:#8E8E93;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px}
        .ressource-card{border:1px solid #EBEBEB;border-radius:8px;padding:14px;margin-bottom:10px}
        .ressource-card:last-child{margin-bottom:0}
        .res-top{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
        .res-icon{width:42px;height:42px;background:#F5F5F0;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:20px}
        .res-title{font-size:15px;font-weight:600;color:#1C1C1E;margin-bottom:3px;line-height:1.3}
        .res-desc{font-size:12px;color:#8E8E93;line-height:1.5}
        .res-form{display:none;flex-direction:column;gap:6px;margin-bottom:10px}
        .res-form.open{display:flex}
        .res-input{height:42px;background:#F5F5F0;border:none;border-radius:7px;padding:0 12px;font-size:14px;color:#1C1C1E;outline:none;font-family:inherit;width:100%}
        .res-input::placeholder{color:#C7C7CC}
        .res-btn{width:100%;height:44px;background:#fff;border:1.5px solid #1C1C1E;border-radius:7px;font-size:13px;font-weight:600;color:#1C1C1E;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-family:inherit;transition:background 0.15s}
        .res-btn-open{width:100%;height:44px;background:#1C1C1E;border:none;border-radius:7px;font-size:13px;font-weight:600;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-family:inherit;transition:background 0.15s}
        .estim-wrap{background:#1C1C1E;margin-bottom:8px;padding:22px 16px}
        .estim-label{font-size:11px;font-weight:600;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px}
        .estim-title{font-size:20px;font-weight:700;color:#fff;margin-bottom:6px;letter-spacing:-0.3px;line-height:1.3}
        .estim-sub{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6;margin-bottom:16px}
        .estim-input{width:100%;height:44px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:0 13px;font-size:14px;color:#fff;outline:none;margin-bottom:8px;font-family:inherit;-webkit-appearance:none}
        .estim-input::placeholder{color:rgba(255,255,255,0.3)}
        .estim-select{width:100%;height:44px;background:#2C2C2E;border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:0 13px;font-size:14px;color:#fff;outline:none;margin-bottom:8px;font-family:inherit;-webkit-appearance:none;cursor:pointer}
.estim-select option{background:#2C2C2E;color:#fff;}
        .estim-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
        .estim-btn{width:100%;height:50px;background:#1C1C1E;border:1.5px solid rgba(255,255,255,0.6);border-radius:8px;font-size:14px;font-weight:600;color:#fff;cursor:pointer;font-family:inherit;margin-top:4px}
        .avis-wrap{background:#fff;margin-bottom:8px;padding:20px 0}
        .avis-global{display:flex;align-items:baseline;gap:10px;padding:0 16px;margin-bottom:16px}
        .avis-note{font-size:42px;font-weight:700;color:#1C1C1E;letter-spacing:-2px;line-height:1}
        .avis-note-sub{font-size:12px;color:#8E8E93;margin-top:3px}
        .avis-scroll{display:flex;gap:10px;overflow-x:auto;padding:0 16px 2px;scrollbar-width:none}
        .avis-scroll::-webkit-scrollbar{display:none}
        .avis-card{background:#F7F7F5;border:1px solid #EFEFED;border-radius:8px;padding:16px;min-width:270px;max-width:270px;flex-shrink:0}
        .avis-stars{color:#FF9500;font-size:12px;margin-bottom:8px}
        .avis-text{font-size:13px;color:#1C1C1E;line-height:1.55;margin-bottom:10px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
        .avis-meta{display:flex;align-items:center;gap:7px}
        .avis-av{width:28px;height:28px;border-radius:50%;background:#DDDDD8;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#6B6B80;flex-shrink:0}
        .avis-name{font-size:12px;font-weight:600;color:#1C1C1E}
        .avis-date{font-size:11px;color:#8E8E93}
        .biens-wrap{background:#fff;margin-bottom:8px}
        .biens-header{padding:16px 16px 12px;display:flex;justify-content:space-between;align-items:center}
        .biens-count{font-size:13px;color:#8E8E93}
        .biens-scroll{display:flex;gap:12px;overflow-x:auto;padding:0 16px 16px;scrollbar-width:none}
        .biens-scroll::-webkit-scrollbar{display:none}
        .bien-card{background:#fff;border:1px solid #EBEBEB;border-radius:8px;min-width:260px;max-width:260px;flex-shrink:0;overflow:hidden;display:flex;flex-direction:column}
        .bien-slider{position:relative;height:200px;background:#E8E8E8;overflow:hidden;width:100%}
        .bien-slides{display:flex;height:100%;transition:transform 0.3s ease;width:100%}
        .bien-slide{min-width:100%;width:100%;height:100%;display:block;flex-shrink:0;overflow:hidden}
        .bien-slide img{width:100%;height:100%;object-fit:cover;display:block}
.bien-price-overlay{position:absolute;bottom:0;left:0;right:0;padding:28px 10px 10px;background:linear-gradient(transparent,rgba(0,0,0,0.55));color:#fff;font-size:14px;font-weight:700;letter-spacing:-0.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}        .bien-nav{position:absolute;top:50%;transform:translateY(-50%);width:28px;height:28px;background:rgba(255,255,255,0.88);border:none;border-radius:50%;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center}
        .bien-nav-prev{left:8px}
        .bien-nav-next{right:8px}
        .bien-count-badge{position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.45);color:#fff;font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px}
        .bien-status{position:absolute;top:8px;right:8px;font-size:10px;font-weight:600;padding:3px 8px;border-radius:20px}
        .bs-v{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff}
        .bs-o{background:rgba(255,149,0,0.2);border:1px solid rgba(255,149,0,0.4);color:#FF9500}
        .bien-body{padding:10px 12px 12px;display:flex;flex-direction:column;flex:1}
        .bien-loc{font-size:10px;color:#8E8E93;margin-bottom:3px}
        .bien-title{font-size:13px;font-weight:600;color:#1C1C1E;margin-bottom:8px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .bien-pills{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;flex:1;align-content:flex-start}
        .pill{background:#F5F5F0;border-radius:5px;padding:3px 7px;font-size:11px;color:#3C3C43;font-weight:500}
        .bien-cta{width:100%;height:36px;background:#fff;border:1.5px solid #1C1C1E;border-radius:6px;font-size:12px;font-weight:600;color:#1C1C1E;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;font-family:inherit;transition:background 0.15s}
        .bien-cta:hover{background:#F5F5F0}
        .apropos-wrap{background:#fff;padding:20px 16px;margin-bottom:8px}
        .apropos-top{display:flex;align-items:center;gap:12px;margin-bottom:12px}
        .apropos-av{width:48px;height:48px;border-radius:50%;background:#E8E8E8;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#6B6B80;flex-shrink:0;overflow:hidden}
        .apropos-av img{width:100%;height:100%;object-fit:cover}
        .apropos-name{font-size:15px;font-weight:600;color:#1C1C1E}
        .apropos-role{font-size:13px;color:#8E8E93}
        .apropos-text{font-size:14px;line-height:1.7;color:#3C3C43}
        .footer-cta{background:#1C1C1E;padding:26px 16px;margin-bottom:8px}
        .fc-title{font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;letter-spacing:-0.3px}
        .fc-sub{font-size:14px;color:rgba(255,255,255,0.45);margin-bottom:18px}
        .fc-main{width:100%;height:52px;background:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;color:#1C1C1E;cursor:pointer;margin-bottom:10px;font-family:inherit}
        .fc-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .fc-sec{height:46px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:8px;font-size:14px;font-weight:500;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none;font-family:inherit}
        .bien-modal-img{width:100%;height:220px;object-fit:cover;border-radius:10px;margin-bottom:14px}
        .bien-modal-title{font-size:18px;font-weight:700;color:#1C1C1E;margin-bottom:6px;letter-spacing:-0.3px;padding:0 16px}
        .bien-modal-price{font-size:22px;font-weight:700;color:#1C1C1E;margin-bottom:12px;letter-spacing:-0.5px;padding:0 16px}
        .bien-modal-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;padding:0 16px}
        .bien-modal-desc{font-size:13px;color:#6B6B80;line-height:1.65;margin-bottom:16px;padding:0 16px}
        .bien-modal-sep{height:1px;background:#F0F0F0;margin:14px 16px}
        .footer{padding:16px;text-align:center;background:#F5F5F0}
        .foot-link{font-size:12px;color:#8E8E93;text-decoration:none;display:inline-flex;align-items:center;gap:5px}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);z-index:200;display:none;align-items:flex-end;justify-content:center}
        .overlay.open{display:flex}
        .modal{background:#fff;border-radius:20px 20px 0 0;padding:8px 0 40px;width:100%;max-width:480px;animation:su .28s cubic-bezier(.16,1,.3,1);max-height:92vh;overflow-y:auto;position:relative}
        @keyframes su{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .m-handle{width:36px;height:4px;background:rgba(0,0,0,0.12);border-radius:2px;margin:12px auto 20px}
        .m-close{position:absolute;top:16px;right:16px;width:28px;height:28px;background:rgba(0,0,0,0.08);border:none;border-radius:50%;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;color:#6B6B80}
        .m-title{font-size:20px;font-weight:700;color:#1C1C1E;margin-bottom:4px;letter-spacing:-0.3px;padding:0 16px}
        .m-sub{font-size:14px;color:#8E8E93;margin-bottom:14px;padding:0 16px}
        .m-section{background:#F9F9F9;border-radius:10px;margin:0 16px 10px;padding:14px}
        .m-field{margin-bottom:8px}
        .m-field label{display:block;font-size:11px;font-weight:600;color:#8E8E93;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px}
        .m-field input,.m-field select,.m-field textarea{width:100%;height:42px;background:#F7F7F7;border:none;border-radius:8px;padding:0 12px;font-size:14px;color:#1C1C1E;outline:none;font-family:inherit;-webkit-appearance:none}
        .m-field input:focus,.m-field select:focus,.m-field textarea:focus{background:#F0F0F0}
        .m-field textarea{height:72px;padding:10px 12px;resize:none;line-height:1.5}
        .m-field input::placeholder,.m-field textarea::placeholder{color:#C7C7CC}
        .radios{display:flex;gap:6px;margin-bottom:10px}
        .radio{flex:1;height:36px;background:#F0F0F0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;color:#8E8E93;cursor:pointer}
        .radio.on{background:#1C1C1E;color:#fff}
        .m-submit{width:calc(100% - 32px);height:50px;background:#1C1C1E;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin:4px 16px 0;display:block;font-family:inherit}
        .m-submit:hover{background:#2C2C2E}
      `}</style>

      <div className="wrap">
        <div className="kodeoo-top">
          <a href="https://kodeoo.fr"><span className="k-dot">K</span>Propulsé par Kodeoo</a>
        </div>

        <div className="hero">
          <div className="hero-center">
            <div className="avatar">
              {agent.photo_url ? <img src={agent.photo_url} alt={displayName} /> : <span>{initials}</span>}
            </div>
            <div className="h-name">{displayName}</div>
            <div className="h-sub">{isAgence ? 'Agence immobilière' : agent.reseau || 'Conseiller immobilier'} · {agent.ville}</div>
            {agent.google_rating && (
              <div className="h-rating">
                <span className="stars">★★★★★</span>
                <span style={{fontWeight:600}}>{agent.google_rating}</span>
                <span className="h-rating-count">· Avis Google</span>
              </div>
            )}
          </div>
          {agent.bio && <div style={{fontSize:14,color:'#6B6B80',lineHeight:1.65,textAlign:'center',marginBottom:16,padding:'0 4px'}}>{agent.bio}</div>}
          {(agent.biens_vendus > 0 || agent.experience) && (
            <div className="proofs">
              {agent.biens_vendus > 0 && <span className="proof">+{agent.biens_vendus} ventes</span>}
              {agent.experience && <span className="proof">{agent.experience} ans d'expérience</span>}
            </div>
          )}
          <button className="cta-main" id="heroEstimBtn">Faire estimer mon bien</button>
          <div className="cta-row">
            <button className="cta-sec" id="heroMsgBtn"><i className="ti ti-message" aria-hidden="true"></i> Message</button>
            <a className="cta-sec" href={`tel:${agent.telephone}`}><i className="ti ti-phone" aria-hidden="true"></i> Appeler</a>
          </div>
        </div>

        {(agent.instagram || agent.tiktok || agent.facebook || agent.linkedin || agent.youtube || agent.site_web) && (
          <div className="socials-bar">
            {agent.instagram && <a className="soc" href={agent.instagram.startsWith('http') ? agent.instagram : `https://instagram.com/${agent.instagram}`} target="_blank" rel="noreferrer"><i className="ti ti-brand-instagram" aria-hidden="true"></i></a>}
            {agent.tiktok && <a className="soc" href={agent.tiktok.startsWith('http') ? agent.tiktok : `https://tiktok.com/@${agent.tiktok}`} target="_blank" rel="noreferrer"><i className="ti ti-brand-tiktok" aria-hidden="true"></i></a>}
            {agent.facebook && <a className="soc" href={agent.facebook.startsWith('http') ? agent.facebook : `https://facebook.com/${agent.facebook}`} target="_blank" rel="noreferrer"><i className="ti ti-brand-facebook" aria-hidden="true"></i></a>}
            {agent.linkedin && <a className="soc" href={agent.linkedin.startsWith('http') ? agent.linkedin : `https://linkedin.com/in/${agent.linkedin}`} target="_blank" rel="noreferrer"><i className="ti ti-brand-linkedin" aria-hidden="true"></i></a>}
            {agent.youtube && <a className="soc" href={agent.youtube.startsWith('http') ? agent.youtube : `https://youtube.com/@${agent.youtube}`} target="_blank" rel="noreferrer"><i className="ti ti-brand-youtube" aria-hidden="true"></i></a>}
            {agent.site_web && <a className="soc" href={agent.site_web.startsWith('http') ? agent.site_web : `https://${agent.site_web}`} target="_blank" rel="noreferrer"><i className="ti ti-world" aria-hidden="true"></i></a>}
          </div>
        )}

        {ressources && ressources.length > 0 && (
          <div className="section-wrap">
            <div className="sec-label">Ressources</div>
            {ressources.map((r: any) => {
              const lm = LEAD_MAGNETS[r.lead_magnet_id]
              if (!lm) return null
              return (
                <div key={r.id} className="ressource-card">
                  <div className="res-top">
                    <div className="res-icon"><i className={`ti ${lm.icone}`} aria-hidden="true"></i></div>
                    <div><div className="res-title">{lm.titre}</div><div className="res-desc">{lm.description}</div></div>
                  </div>
                  <div className="res-form" id={`form-${r.id}`}>
                    <input className="res-input" type="text" placeholder="Votre prénom" id={`lm-prenom-${r.id}`} />
                    <input className="res-input" type="email" placeholder="Votre email" id={`lm-email-${r.id}`} />
                    <button className="res-btn" data-ressource-id={r.id} data-pdf-url={r.pdf_url} data-lm-id={r.lead_magnet_id}>
                      <i className="ti ti-download" aria-hidden="true"></i> Télécharger gratuitement
                    </button>
                  </div>
                  <button className="res-btn-open" data-open-form={r.id} id={`open-${r.id}`}>
                    <i className="ti ti-download" aria-hidden="true"></i> Télécharger gratuitement
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="estim-wrap">
          <div className="estim-label">Estimation gratuite</div>
          <div className="estim-title">Découvrez la valeur de votre bien</div>
          <div className="estim-sub">Recevez une estimation personnalisée sous 24h.</div>
          <input className="estim-input" type="text" placeholder="Adresse du bien" id="estimAdresse" />
          <select className="estim-select" id="estimType">
            <option value="">Type de bien</option>
            <option>Appartement</option><option>Maison</option><option>Villa</option><option>Studio</option><option>Local commercial</option>
          </select>
          <div className="estim-grid">
            <input className="estim-input" style={{marginBottom:0}} type="number" placeholder="Surface m²" id="estimSurface" />
            <input className="estim-input" style={{marginBottom:0}} type="tel" placeholder="Téléphone" id="estimTel" />
          </div>
          <input className="estim-input" type="email" placeholder="Votre email" id="estimEmail" />
          <button className="estim-btn" id="estimBtn">Recevoir mon estimation gratuite</button>
        </div>

        {((avisData ?? []).length > 0 || agent.google_rating) && (
          <div className="avis-wrap">
            <div style={{padding:'0 16px',marginBottom:6}}><div className="sec-label">Avis clients</div></div>
            {agent.google_rating && (
              <div className="avis-global">
                <div className="avis-note">{agent.google_rating}</div>
                <div><div className="stars" style={{fontSize:15}}>★★★★★</div><div className="avis-note-sub">Avis Google</div></div>
              </div>
            )}
            <div className="avis-scroll">
              {(avisData ?? []).map((a: any) => (
                <div key={a.id} className="avis-card">
                  <div className="avis-stars">{'★'.repeat(a.note || 5)}</div>
                  <div className="avis-text">&quot;{a.texte}&quot;</div>
                  <div className="avis-meta">
                    <div className="avis-av">{a.auteur.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()}</div>
                    <div><div className="avis-name">{a.auteur}</div>{a.date_avis && <div className="avis-date">{a.date_avis}</div>}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {biens && biens.length > 0 && (
          <div className="biens-wrap">
            <div className="biens-header">
              <div className="sec-label" style={{marginBottom:0}}>{isAgence ? 'Nos biens' : 'Mes biens'}</div>
              <div className="biens-count">{biens.length} bien{biens.length > 1 ? 's' : ''}</div>
            </div>
            <div className="biens-scroll">
              {biens.map((bien: any, idx: number) => (
                <div key={bien.id} className="bien-card">
                  <div className="bien-slider">
                    <div className="bien-slides" id={`slides-${idx}`}>
                      {bien.photos && bien.photos.length > 0
                        ? bien.photos.slice(0,8).map((p: string, pi: number) => (
                            <div key={pi} className="bien-slide"><img src={p} alt="" /></div>
                          ))
                        : <div className="bien-slide" style={{fontSize:36,color:'#DDDDD8',display:'flex',alignItems:'center',justifyContent:'center'}}>🏠</div>
                      }
                    </div>
                    {bien.photos && bien.photos.length > 1 && (
                      <>
                        <button className="bien-nav bien-nav-prev" data-idx={idx} data-dir="-1" data-total={Math.min(bien.photos.length,8)}>‹</button>
                        <button className="bien-nav bien-nav-next" data-idx={idx} data-dir="1" data-total={Math.min(bien.photos.length,8)}>›</button>
                        <div className="bien-count-badge" id={`count-${idx}`}>1/{Math.min(bien.photos.length,8)}</div>
                      </>
                    )}
                    <div className="bien-price-overlay">
                      {bien.prix ? bien.prix.toLocaleString('fr-FR') + ' €' : 'Prix sur demande'}
                    </div>
                    <span className={`bien-status ${bien.statut === 'sous_offre' ? 'bs-o' : 'bs-v'}`}>
                      {bien.statut === 'sous_offre' ? 'Sous offre' : 'Vente'}
                    </span>
                  </div>
                  <div className="bien-body">
                    <div className="bien-loc">{bien.ville}{bien.quartier ? ` · ${bien.quartier}` : ''}</div>
                    <div className="bien-title">{decodeHtml(bien.titre)}</div>
                    <div className="bien-pills">
                      {bien.surface && <span className="pill">{bien.surface} m²</span>}
                      {bien.pieces && <span className="pill">{bien.pieces} p.</span>}
                      {bien.chambres && <span className="pill">{bien.chambres} ch.</span>}
                    </div>
                    <button className="bien-cta" data-bien-idx={idx}>
                      Voir le bien <i className="ti ti-arrow-right" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {agent.bio && (
          <div className="apropos-wrap">
            <div className="sec-label">À propos</div>
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

        <div className="footer-cta">
          <div className="fc-title">Un projet immobilier ?</div>
          <div className="fc-sub">{isAgence ? 'Contactez-nous, nous répondons rapidement.' : 'Contactez-moi, je réponds rapidement.'}</div>
          <button className="fc-main" id="footerEstimBtn">Faire estimer mon bien</button>
          <div className="fc-row">
            <button className="fc-sec" id="footerMsgBtn"><i className="ti ti-message" aria-hidden="true"></i> Message</button>
            <a className="fc-sec" href={`tel:${agent.telephone}`}><i className="ti ti-phone" aria-hidden="true"></i> Appeler</a>
          </div>
        </div>

        <div className="footer">
          <a className="foot-link" href="https://kodeoo.fr"><span className="k-dot">K</span><span style={{fontSize:11,color:'#8E8E93',marginLeft:4}}>Propulsé par Kodeoo</span></a>
          <div style={{marginTop:10,display:'flex',gap:16,justifyContent:'center'}}>
            <a href="/mentions-legales" style={{fontSize:11,color:'#C7C7CC',textDecoration:'none'}}>Mentions légales</a>
            <a href="/politique-confidentialite" style={{fontSize:11,color:'#C7C7CC',textDecoration:'none'}}>Confidentialité</a>
          </div>
        </div>

        {/* MODAL CONTACT */}
        <div className="overlay" id="m-contact">
          <div className="modal">
            <div className="m-handle"></div>
            <button className="m-close" id="closeContact">×</button>
            <div className="m-title">Envoyer un message</div>
            <div className="m-sub">{displayName} vous répond rapidement</div>
            <div className="m-section">
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:6}}>Vous êtes</div>
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
            <div style={{fontSize:11,color:'#C7C7CC',lineHeight:1.5,padding:'0 16px',marginBottom:8}}>
              En envoyant ce formulaire, vous acceptez que vos données soient transmises à {displayName} conformément à notre <a href="/politique-confidentialite" style={{color:'#C7C7CC'}}>politique de confidentialité</a>.
            </div>
            <button className="m-submit" id="submitContact">Envoyer →</button>
          </div>
        </div>

        {/* MODAL ESTIMATION */}
        <div className="overlay" id="m-estimation">
          <div className="modal">
            <div className="m-handle"></div>
            <button className="m-close" id="closeEstim">×</button>
            <div className="m-title">Estimer mon bien</div>
            <div className="m-sub">Estimation gratuite sous 24h</div>
            <div className="m-section">
              <div className="m-field"><label>Adresse</label><input type="text" id="eAdresse" placeholder="12 rue de la Paix, Nice"/></div>
              <div className="m-field"><label>Type de bien</label>
                <select id="eType"><option value="">Choisir...</option><option>Appartement</option><option>Maison</option><option>Villa</option><option>Studio</option></select>
              </div>
              <div className="m-field"><label>Surface (m²)</label><input type="number" id="eSurface" placeholder="75"/></div>
              <div className="m-field"><label>Téléphone</label><input type="tel" id="eTel" placeholder="06 00 00 00 00"/></div>
              <div className="m-field"><label>Email</label><input type="email" id="eEmail" placeholder="jean@exemple.fr"/></div>
            </div>
            <div style={{fontSize:11,color:'#C7C7CC',lineHeight:1.5,padding:'0 16px',marginBottom:8}}>
              En envoyant ce formulaire, vous acceptez que vos données soient transmises à {displayName} conformément à notre <a href="/politique-confidentialite" style={{color:'#C7C7CC'}}>politique de confidentialité</a>.
            </div>
            <button className="m-submit" id="submitEstim">Recevoir mon estimation →</button>
          </div>
        </div>

        {/* MODAL BIEN */}
        <div className="overlay" id="m-bien">
          <div className="modal">
            <div className="m-handle"></div>
            <button className="m-close" id="closeBien">×</button>
            <div id="bien-modal-content"></div>
          </div>
        </div>

      </div>

      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      <script dangerouslySetInnerHTML={{__html: `
(function() {
  var AGENT_ID = '${agentId}';
  var BIENS_DATA = JSON.parse(atob('${biensEncoded}'));

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

  document.getElementById('closeContact') && document.getElementById('closeContact').addEventListener('click', function() { closeM('contact'); });
  document.getElementById('closeEstim') && document.getElementById('closeEstim').addEventListener('click', function() { closeM('estimation'); });
  document.getElementById('closeBien') && document.getElementById('closeBien').addEventListener('click', function() { closeM('bien'); });
  document.getElementById('heroEstimBtn') && document.getElementById('heroEstimBtn').addEventListener('click', function() { openM('estimation'); });
  document.getElementById('heroMsgBtn') && document.getElementById('heroMsgBtn').addEventListener('click', function() { openM('contact'); });
  document.getElementById('footerEstimBtn') && document.getElementById('footerEstimBtn').addEventListener('click', function() { openM('estimation'); });
  document.getElementById('footerMsgBtn') && document.getElementById('footerMsgBtn').addEventListener('click', function() { openM('contact'); });

  document.querySelectorAll('.radio').forEach(function(r) {
    r.addEventListener('click', function() {
      r.closest('.radios').querySelectorAll('.radio').forEach(function(x) { x.classList.remove('on'); });
      r.classList.add('on');
    });
  });

  document.querySelectorAll('.bien-nav').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var idx = parseInt(btn.getAttribute('data-idx'));
      var dir = parseInt(btn.getAttribute('data-dir'));
      var total = parseInt(btn.getAttribute('data-total'));
      if (!window._sp) window._sp = {};
      if (!window._sp[idx]) window._sp[idx] = 0;
      window._sp[idx] = (window._sp[idx] + dir + total) % total;
      var slides = document.getElementById('slides-' + idx);
      if (slides) slides.style.transform = 'translateX(-' + (window._sp[idx] * 100) + '%)';
      var count = document.getElementById('count-' + idx);
      if (count) count.textContent = (window._sp[idx] + 1) + '/' + total;
    });
  });

  document.querySelectorAll('.bien-cta').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(btn.getAttribute('data-bien-idx'));
      var bien = BIENS_DATA[idx];
      if (!bien) { openM('contact'); return; }
      var content = document.getElementById('bien-modal-content');
      if (!content) return;
      var photos = bien.photos || [];
      var imgHtml = photos.length > 0
        ? '<img src="' + photos[0] + '" class="bien-modal-img" onerror="this.style.display=&quot;none&quot;" />'
        : '<div style="height:160px;background:#F0F0F0;border-radius:10px;margin-bottom:14px;display:flex;align-items:center;justify-content:center;font-size:40px">🏠</div>';
      var pills = '';
      if (bien.surface) pills += '<span class="pill">' + bien.surface + ' m\u00b2</span>';
      if (bien.pieces) pills += '<span class="pill">' + bien.pieces + ' p.</span>';
      if (bien.chambres) pills += '<span class="pill">' + bien.chambres + ' ch.</span>';
      if (bien.dpe) pills += '<span class="pill">DPE ' + bien.dpe + '</span>';
      var prixStr = bien.prix ? Number(bien.prix).toLocaleString('fr-FR') + ' \u20ac' : 'Prix sur demande';
      var desc = bien.description || '';
      function decodeHtmlModal(str) {
        if (!str) return '';
        var txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
      }
     content.innerHTML = imgHtml
                + '<div class="bien-modal-price">' + prixStr + '</div>'
        + '<div class="bien-modal-pills">' + pills + '</div>'
        + (desc ? '<div class="bien-modal-desc">' + desc + '</div>' : '')
        + '<div class="bien-modal-sep"></div>'
        + '<div style="padding:0 16px 8px;font-size:13px;font-weight:600;color:#1C1C1E">Intéress\u00e9 par ce bien ?</div>'
        + '<div style="padding:0 16px">'
        + '<input id="bm-nom" style="width:100%;height:42px;background:#F7F7F7;border:none;border-radius:8px;padding:0 12px;font-size:14px;color:#1C1C1E;outline:none;margin-bottom:8px;font-family:inherit;display:block" placeholder="Votre pr\u00e9nom & nom" />'
        + '<input id="bm-email" type="email" style="width:100%;height:42px;background:#F7F7F7;border:none;border-radius:8px;padding:0 12px;font-size:14px;color:#1C1C1E;outline:none;margin-bottom:8px;font-family:inherit;display:block" placeholder="Votre email" />'
        + '<input id="bm-tel" type="tel" style="width:100%;height:42px;background:#F7F7F7;border:none;border-radius:8px;padding:0 12px;font-size:14px;color:#1C1C1E;outline:none;margin-bottom:12px;font-family:inherit;display:block" placeholder="Votre t\u00e9l\u00e9phone" />'
        + '<button id="bm-submit" style="width:100%;height:48px;background:#1C1C1E;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit">Je suis int\u00e9ress\u00e9 \u2192</button>'
        + '</div>';
      var bienId = bien.id;
      var bienTitre = bien.titre || '';
      document.getElementById('bm-submit').addEventListener('click', async function() {
        var nom = document.getElementById('bm-nom').value || '';
        var email = document.getElementById('bm-email').value || '';
        var tel = document.getElementById('bm-tel').value || '';
        if (!email) { alert('Veuillez renseigner votre email'); return; }
        try {
          await fetch('/api/leads', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ agent_id: AGENT_ID, type: 'contact', nom: nom, email: email, telephone: tel, message: 'Int\u00e9ress\u00e9 par : ' + bienTitre })
          });
          closeM('bien');
          alert('\u2705 Votre demande a bien \u00e9t\u00e9 envoy\u00e9e !');
        } catch(e) { alert('Erreur r\u00e9seau'); }
      });
      openM('bien');
    });
  });

  document.querySelectorAll('[data-open-form]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.getAttribute('data-open-form');
      var form = document.getElementById('form-' + id);
      var openBtn = document.getElementById('open-' + id);
      if (form) form.classList.toggle('open');
      if (openBtn) openBtn.style.display = form && form.classList.contains('open') ? 'none' : 'flex';
    });
  });

  document.querySelectorAll('[data-ressource-id]').forEach(function(btn) {
    btn.addEventListener('click', async function() {
      var rid = btn.getAttribute('data-ressource-id');
      var pdfUrl = btn.getAttribute('data-pdf-url');
      var lmId = btn.getAttribute('data-lm-id');
      var prenom = document.getElementById('lm-prenom-' + rid) ? document.getElementById('lm-prenom-' + rid).value : '';
      var email = document.getElementById('lm-email-' + rid) ? document.getElementById('lm-email-' + rid).value : '';
      if (!email) { alert('Veuillez renseigner votre email'); return; }
      try {
        await fetch('/api/leads', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ agent_id: AGENT_ID, type: 'lead_magnet', nom: prenom, email: email, lead_magnet: lmId, message: '' }) });
        if (pdfUrl) window.open(pdfUrl, '_blank');
        else alert('Merci ! Vous recevrez le document par email.');
      } catch(e) { alert('Erreur r\u00e9seau'); }
    });
  });

  async function submitLead(type) {
    var data = { agent_id: AGENT_ID, type: type };
    if (type === 'contact') {
      data.nom = document.getElementById('cNom') ? document.getElementById('cNom').value : '';
      data.email = document.getElementById('cEmail') ? document.getElementById('cEmail').value : '';
      data.telephone = document.getElementById('cTel') ? document.getElementById('cTel').value : '';
      data.message = document.getElementById('cMsg') ? document.getElementById('cMsg').value : '';
    } else if (type === 'estimation') {
      data.nom = 'Prospect estimation';
      var emailEl = document.getElementById('estimEmail') || document.getElementById('eEmail');
      var telEl = document.getElementById('eTel') || document.getElementById('estimTel');
      var adrEl = document.getElementById('eAdresse') || document.getElementById('estimAdresse');
      var surEl = document.getElementById('eSurface') || document.getElementById('estimSurface');
      var typEl = document.getElementById('eType') || document.getElementById('estimType');
      data.email = emailEl ? emailEl.value : '';
      data.telephone = telEl ? telEl.value : '';
      data.message = 'Adresse: ' + (adrEl ? adrEl.value : '') + ' | Type: ' + (typEl ? typEl.value : '') + ' | Surface: ' + (surEl ? surEl.value : '') + 'm\u00b2';
    }
    if (!data.email) { alert('Veuillez renseigner votre email'); return; }
    try {
      var res = await fetch('/api/leads', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
      var result = await res.json();
      if (result.success) { closeM('contact'); closeM('estimation'); alert('\u2705 Votre demande a bien \u00e9t\u00e9 envoy\u00e9e !'); }
    } catch(e) { alert('Erreur r\u00e9seau'); }
  }

  document.getElementById('submitContact') && document.getElementById('submitContact').addEventListener('click', function() { submitLead('contact'); });
  document.getElementById('submitEstim') && document.getElementById('submitEstim').addEventListener('click', function() { submitLead('estimation'); });
  document.getElementById('estimBtn') && document.getElementById('estimBtn').addEventListener('click', function() { submitLead('estimation'); });
})();
      `}} />
    </>
  )
}

export const revalidate = 60