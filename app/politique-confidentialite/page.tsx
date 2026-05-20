export default function PolitiqueConfidentialite() {
  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1C1C1E}
        .wrap{max-width:680px;margin:0 auto;padding:48px 24px 80px}
        h1{font-size:24px;font-weight:700;color:#1C1C1E;margin-bottom:32px;letter-spacing:-0.3px}
        h2{font-size:16px;font-weight:600;color:#1C1C1E;margin:28px 0 10px}
        p{font-size:14px;color:#3C3C43;line-height:1.7;margin-bottom:10px}
        ul{font-size:14px;color:#3C3C43;line-height:1.7;margin-bottom:10px;padding-left:20px}
        li{margin-bottom:6px}
        a{color:#1C1C1E}
        .back{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#8E8E93;text-decoration:none;margin-bottom:32px}
      `}</style>
      <div className="wrap">
        <a className="back" href="javascript:history.back()">← Retour</a>
        <h1>Politique de confidentialité</h1>

        <p>Dernière mise à jour : mai 2026</p>

        <h2>1. Responsable du traitement</h2>
        <p>
          Leny Nickel — SIRET 93775097400019<br/>
          60 rue François 1er, 75008 Paris<br/>
          contact@kodeoo.fr
        </p>

        <h2>2. Données collectées</h2>
        <p>Dans le cadre de l'utilisation des pages Kodeoo Link, nous collectons :</p>
        <ul>
          <li>Prénom et nom des prospects</li>
          <li>Adresse email</li>
          <li>Numéro de téléphone (optionnel)</li>
          <li>Message libre (optionnel)</li>
          <li>Données de navigation (pages visitées, date et heure)</li>
        </ul>

        <h2>3. Finalité du traitement</h2>
        <p>Les données collectées sont utilisées pour :</p>
        <ul>
          <li>Mettre en relation les prospects avec les conseillers immobiliers</li>
          <li>Permettre aux conseillers de répondre aux demandes</li>
          <li>Améliorer le service Kodeoo</li>
        </ul>

        <h2>4. Base légale</h2>
        <p>Le traitement est fondé sur le consentement de la personne concernée (article 6.1.a du RGPD), recueilli lors de la soumission des formulaires.</p>

        <h2>5. Destinataires des données</h2>
        <p>
          Les données des prospects sont transmises au conseiller immobilier dont la page Kodeoo Link a été consultée. Elles ne sont pas revendues à des tiers.
        </p>
        <p>Sous-traitants techniques :</p>
        <ul>
          <li>Supabase — stockage des données (serveurs UE)</li>
          <li>Vercel — hébergement (serveurs EU)</li>
          <li>Resend — envoi d'emails transactionnels</li>
        </ul>

        <h2>6. Durée de conservation</h2>
        <p>Les données des prospects sont conservées pendant 2 ans à compter de leur collecte, puis supprimées automatiquement.</p>

        <h2>7. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement ("droit à l'oubli")</li>
          <li>Droit d'opposition au traitement</li>
          <li>Droit à la portabilité</li>
        </ul>
        <p>Pour exercer ces droits : <a href="mailto:contact@kodeoo.fr">contact@kodeoo.fr</a></p>

        <h2>8. Cookies</h2>
        <p>
          Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement du service (authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
        </p>

        <h2>9. Contact & réclamation</h2>
        <p>
          Pour toute question : <a href="mailto:contact@kodeoo.fr">contact@kodeoo.fr</a><br/>
          Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank">cnil.fr</a>
        </p>
      </div>
    </>
  )
}