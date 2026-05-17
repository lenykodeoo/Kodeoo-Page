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
    .order('created_at', { ascending: false })

  const initials = agent.prenom[0] + agent.nom[0]

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F7F7FA}
        .page{font-family:system-ui,sans-serif;max-width:430px;margin:0 auto;padding-bottom:100px;background:#F7F7FA;min-height:100vh}
        .topbar{padding:16px 16px 0;display:flex;justify-content:space-between;align-items:center}
        .kodeoo-badge{display:flex;align-items:center;gap:6px;padding:5px 11px;background:#fff;border:1px solid rgba(0,0,0,0.1);border-radius:20px;font-size:11px;font-weight:600;color:#6B6B80;text-decoration:none}
        .kodeoo-dot{width:6px;height:6px;border-radius:50%;background:#6347FF}
        .live{display:flex;align-items:center;gap:5px;padding:5px 10px;background:rgba(0,179,125,0.08);border:1px solid rgba(0,179,125,0.18);border-radius:20px;font-size:11px;font-weight:500;color:#00B37D}
        .live-dot{width:5px;height:5px;border-radius:50%;background:#00B37D}
        .card{background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:20px;padding:22px 18px 18px;margin:14px 14px 0;position:relative;box-shadow:0 2px 12px rgba(0,0,0,0.05)}
        .card::before{content:'';position:absolute;top:0;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,rgba(99,71,255,0.3),transparent)}
        .profile-top{display:flex;align-items:flex-start;gap:13px;margin-bottom:14px}
        .avatar{width:66px;height:66px;border-radius:50%;background:linear-gradient(135deg,#EEF0FF,#E0DCFF);border:2px solid rgba(99,71,255,0.15);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:600;color:#6347FF;flex-shrink:0;position:relative}
        .avatar-status{position:absolute;bottom:2px;right:2px;width:13px;height:13px;border-radius:50%;background:#00B37D;border:2px solid #fff}
        .profile-name{font-size:19px;font-weight:600;color:#0D0D12;letter-spacing:-0.02em;margin-bottom:2px}
        .profile-role{font-size:12px;color:#6B6B80;margin-bottom:9px}
        .tags{display:flex;flex-wrap:wrap;gap:5px}
        .tag{padding:3px 9px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);border-radius:20px;font-size:11px;color:#6B6B80}
        .tag-v{background:#EEF0FF;border-color:rgba(99,71,255,0.2);color:#6347FF}
        .bio{font-size:13px;line-height:1.65;color:#6B6B80;margin-bottom:16px}
        .stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:rgba(0,0,0,0.08);border:1px solid rgba(0,0,0,0.08);border-radius:9px;overflow:hidden;margin-bottom:16px}
        .stat{background:#fff;padding:10px 6px;text-align:center}
        .stat-n{font-size:19px;font-weight:600;color:#0D0D12;line-height:1;margin-bottom:2px}
        .stat-g{color:#00B37D}
        .stat-v{color:#6347FF}
        .stat-l{font-size:10px;color:#A0A0B8;letter-spacing:0.04em;text-transform:uppercase}
        .socials{display:flex;gap:6px;margin-bottom:13px}
        .soc{flex:1;height:35px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);border-radius:6px;display:flex;align-items:center;justify-content:center;text-decoration:none;font-size:16px}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:7px}
        .btn-v{height:42px;background:#6347FF;color:#fff;border:none;border-radius:9px;font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:7px;text-decoration:none}
        .btn-o{height:42px;background:#fff;color:#0D0D12;border:1px solid rgba(0,0,0,0.12);border-radius:9px;font-size:13px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:7px;text-decoration:none}
        .btn-flat{width:100%;height:37px;background:#F7F7FA;color:#6B6B80;border:1px solid rgba(0,0,0,0.08);border-radius:9px;font-size:12px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none}
        .div{height:1px;background:rgba(0,0,0,0.06);margin:14px 14px}
        .sec{padding:0 14px}
        .sec-label{font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#A0A0B8;margin-bottom:10px;display:flex;align-items:center;gap:7px}
        .sec-count{padding:2px 7px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);border-radius:20px;font-size:10px;color:#6B6B80}
        .bien{background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:14px;overflow:hidden;margin-bottom:10px}
        .bien-ph{height:180px;background:linear-gradient(135deg,#F0EEFF,#E8E6F5);display:flex;align-items:center;justify-content:center;position:relative;font-size:48px}
        .bien-status{position:absolute;top:10px;left:10px;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500}
        .s-vente{background:rgba(99,71,255,0.1);border:1px solid rgba(99,71,255,0.2);color:#6347FF}
        .s-offre{background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);color:#B45309}
        .bien-body{padding:13px}
        .bien-loc{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6347FF;margin-bottom:3px}
        .bien-title{font-size:16px;font-weight:500;color:#0D0D12;margin-bottom:6px;line-height:1.25}
        .bien-price{font-size:21px;font-weight:600;color:#0D0D12;letter-spacing:-0.02em;margin-bottom:10px}
        .bien-specs{display:flex;gap:7px;margin-bottom:11px;flex-wrap:wrap}
        .spec{font-size:11px;color:#6B6B80;background:#F7F7FA;padding:4px 8px;border-radius:6px;border:1px solid rgba(0,0,0,0.07)}
        .bien-btns{display:flex;gap:7px}
        .bb{flex:1;height:37px;border-radius:9px;font-size:12px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:5px;text-decoration:none}
        .bb-v{background:#6347FF;color:#fff}
        .bb-o{background:#F7F7FA;color:#0D0D12;border:1px solid rgba(0,0,0,0.1)}
        .estim{background:linear-gradient(135deg,#F5F3FF,#EEF0FF);border:1px solid rgba(99,71,255,0.15);border-radius:14px;padding:20px 18px}
        .estim-ey{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6347FF;margin-bottom:7px}
        .estim-title{font-size:18px;font-weight:600;color:#0D0D12;margin-bottom:5px;line-height:1.3}
        .estim-sub{font-size:12px;color:#6B6B80;line-height:1.6;margin-bottom:14px}
        .btn-estim{display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 18px;background:#6347FF;color:#fff;border-radius:9px;font-size:13px;font-weight:500;text-decoration:none}
        .lm{background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:14px;padding:13px;display:flex;align-items:center;gap:12px;margin-bottom:8px;text-decoration:none}
        .lm-ic{width:42px;height:42px;border-radius:10px;background:#EEF0FF;border:1px solid rgba(99,71,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}
        .lm-type{font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6347FF;margin-bottom:2px}
        .lm-name{font-size:13px;font-weight:500;color:#0D0D12;line-height:1.3}
        .lm-arr{width:26px;height:26px;border-radius:50%;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:auto;font-size:14px;color:#A0A0B8}
        .footer{padding:28px 14px 0;text-align:center}
        .foot{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;background:#F7F7FA;border:1px solid rgba(0,0,0,0.08);border-radius:20px;text-decoration:none}
        .foot-k{width:15px;height:15px;background:#6347FF;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff}
        .foot-l{font-size:11px;font-weight:500;color:#A0A0B8}
        .ai-wrap{position:fixed;bottom:22px;right:14px;z-index:100}
        .ai-fab{width:52px;height:52px;border-radius:50%;background:#6347FF;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(99,71,255,0.3);font-size:22px;position:relative;text-decoration:none}
        .ai-dot{position:absolute;top:-1px;right:-1px;width:11px;height:11px;border-radius:50%;background:#00B37D;border:2px solid #F7F7FA}
      `}</style>

      <div className="page">
        <div className="topbar">
          <a className="kodeoo-badge" href="https://kodeoo.fr">
            <span className="kodeoo-dot"></span>
            Kodeoo
          </a>
          <div className="live">
            <span className="live-dot"></span>
            En ligne
          </div>
        </div>

        <div className="card">
          <div className="profile-top">
            <div className="avatar">
              {initials}
              <span className="avatar-status"></span>
            </div>
            <div>
              <div className="profile-name">{agent.prenom} {agent.nom}</div>
              <div className="profile-role">{agent.reseau}</div>
              <div className="tags">
                <span className="tag tag-v">📍 {agent.ville}</span>
                <span className="tag">Résidentiel</span>
              </div>
            </div>
          </div>

          <div className="bio">{agent.bio}</div>

          <div className="stats">
            <div className="stat">
              <div className="stat-n stat-g">{agent.biens_vendus || 0}</div>
              <div className="stat-l">Vendus</div>
            </div>
            <div className="stat">
              <div className="stat-n stat-v">{biens?.length || 0}</div>
              <div className="stat-l">Dispo.</div>
            </div>
            <div className="stat">
              <div className="stat-n">{agent.google_rating || '–'}</div>
              <div className="stat-l">Google</div>
            </div>
          </div>

          {(agent.instagram || agent.tiktok || agent.facebook || agent.linkedin) && (
            <div className="socials">
              {agent.instagram && <a className="soc" href={`https://instagram.com/${agent.instagram}`} target="_blank">📸</a>}
              {agent.tiktok && <a className="soc" href={`https://tiktok.com/@${agent.tiktok}`} target="_blank">🎵</a>}
              {agent.facebook && <a className="soc" href={agent.facebook} target="_blank">👤</a>}
              {agent.linkedin && <a className="soc" href={agent.linkedin} target="_blank">💼</a>}
            </div>
          )}

          <div className="row2">
            <a className="btn-v" href={`tel:${agent.telephone}`}>📞 Appeler</a>
            <a className="btn-o" href={`mailto:${agent.email}`}>✉️ Message</a>
          </div>
          <a className="btn-flat" href={`mailto:${agent.email}`}>📅 Prendre rendez-vous</a>
        </div>

        <div className="div"></div>

        {biens && biens.length > 0 && (
          <div className="sec">
            <div className="sec-label">
              Mes biens
              <span className="sec-count">{biens.length}</span>
            </div>
            {biens.map((bien: any) => (
              <div className="bien" key={bien.id}>
                <div className="bien-ph" style={{backgroundImage: bien.photos?.[0] ? `url(${bien.photos[0]})` : 'none', backgroundSize:'cover', backgroundPosition:'center'}}>
  {!bien.photos?.[0] && '🏠'}
  <span className={`bien-status ${bien.statut === 'sous_offre' ? 's-offre' : 's-vente'}`}>
    {bien.statut === 'sous_offre' ? 'Sous offre' : 'Vente'}
  </span>
</div>
                <div className="bien-body">
                  <div className="bien-loc">{bien.ville}{bien.quartier ? ` · ${bien.quartier}` : ''}</div>
                  <div className="bien-title">{bien.titre}</div>
                  <div className="bien-price">{bien.prix ? bien.prix.toLocaleString('fr-FR') + ' €' : 'Prix sur demande'}</div>
                  <div className="bien-specs">
                    {bien.surface && <span className="spec">📐 {bien.surface}m²</span>}
                    {bien.pieces && <span className="spec">🚪 {bien.pieces} pièces</span>}
                    {bien.chambres && <span className="spec">🛏 {bien.chambres} ch.</span>}
                    {bien.dpe && <span className="spec">DPE {bien.dpe}</span>}
                  </div>
                  <div className="bien-btns">
                    <a className="bb bb-v" href={`mailto:${agent.email}`}>✉️ Contacter</a>
                    <a className="bb bb-o" href={`mailto:${agent.email}`}>📅 Visiter</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="div"></div>

        <div className="sec">
          <div className="estim">
            <div className="estim-ey">Outil gratuit</div>
            <div className="estim-title">Combien vaut votre bien ?</div>
            <div className="estim-sub">Obtenez une fourchette de prix en 2 minutes.</div>
            <a className="btn-estim" href={`mailto:${agent.email}`}>📊 Estimer mon bien</a>
          </div>
        </div>

        <div className="div"></div>

        <div className="sec">
          <div className="sec-label">Guides gratuits</div>
          <a className="lm" href="#">
            <div className="lm-ic">📄</div>
            <div>
              <div className="lm-type">Guide PDF · Gratuit</div>
              <div className="lm-name">Vendre au meilleur prix en 2026</div>
            </div>
            <div className="lm-arr">›</div>
          </a>
          <a className="lm" href="#">
            <div className="lm-ic">✅</div>
            <div>
              <div className="lm-type">Checklist PDF · Gratuit</div>
              <div className="lm-name">Les 10 critères qui font le prix</div>
            </div>
            <div className="lm-arr">›</div>
          </a>
        </div>

        <div className="footer">
          <a className="foot" href="https://kodeoo.fr">
            <span className="foot-k">K</span>
            <span className="foot-l">Propulsé par Kodeoo</span>
          </a>
        </div>

        <div className="ai-wrap">
          <a className="ai-fab" href={`mailto:${agent.email}`}>
            💬
            <span className="ai-dot"></span>
          </a>
        </div>
      </div>
    </>
  )
}

export const revalidate = 60