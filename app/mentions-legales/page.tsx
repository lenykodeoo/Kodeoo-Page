export default function MentionsLegales() {
  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1C1C1E}
        .wrap{max-width:680px;margin:0 auto;padding:48px 24px 80px}
        h1{font-size:24px;font-weight:700;color:#1C1C1E;margin-bottom:32px;letter-spacing:-0.3px}
        h2{font-size:16px;font-weight:600;color:#1C1C1E;margin:28px 0 10px}
        p{font-size:14px;color:#3C3C43;line-height:1.7;margin-bottom:10px}
        a{color:#1C1C1E}
        .back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#8E8E93;text-decoration:none;margin-bottom:32px}
      `}</style>
      <div className="wrap">
        <a className="back" href="javascript:history.back()">← Retour</a>
        <h1>Mentions légales</h1>

        <h2>Éditeur du site</h2>
        <p>Le site go.kodeoo.fr est édité par :</p>
        <p>
          Leny Nickel<br/>
          SIRET : 93775097400019<br/>
          60 rue François 1er, 75008 Paris<br/>
          Email : contact@kodeoo.fr
        </p>

        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par Vercel Inc.<br/>
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br/>
          vercel.com
        </p>
        <p>
          Les données sont stockées par Supabase (The Supabase Company)<br/>
          sur des serveurs situés dans l'Union Européenne.
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble du contenu de ce site (textes, images, logotypes) est la propriété exclusive de Kodeoo, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation préalable.
        </p>

        <h2>Responsabilité</h2>
        <p>
          Kodeoo s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Kodeoo décline toute responsabilité concernant les informations publiées par les utilisateurs de la plateforme.
        </p>

        <h2>Contact</h2>
        <p>Pour toute question : <a href="mailto:contact@kodeoo.fr">contact@kodeoo.fr</a></p>
      </div>
    </>
  )
}