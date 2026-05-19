'use client'

import { useState, useEffect } from 'react'

const LEAD_MAGNETS = [
  { id: 'guide_vendeur', titre: 'Guide vendeur 2026', description: 'Les étapes clés pour vendre son bien rapidement et au meilleur prix' },
  { id: 'checklist_estimation', titre: 'Checklist estimation', description: 'Découvrez où se situe votre bien sur le marché' },
]

export default function Dashboard() {
  const [tab, setTab] = useState<'biens' | 'ressources' | 'leads' | 'profil'>('biens')
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
  const [leads, setLeads] = useState<any[]>([])
  const [avis, setAvis] = useState<any[]>([])
  const [mobileNav, setMobileNav] = useState(false)
  const [agent, setAgent] = useState<any>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [savingProfil, setSavingProfil] = useState(false)
  const [newAvis, setNewAvis] = useState({ auteur: '', texte: '', note: 5, date_avis: '' })
  const [profil, setProfil] = useState({
    biens_vendus: '',
    experience: '',
    google_rating: '',
    bio: '',
    prenom: '',
    nom: '',
    nom_agence: '',
    reseau: '',
    ville: '',
    telephone: '',
    email: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    site_web: '',
  })

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
    loadAvis(id)
    loadAgent(id)
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
const loadAvis = async (id: string) => {
    const res = await fetch(`/api/avis?agent_id=${id}`)
    const data = await res.json()
    if (data.success) setAvis(data.avis)
  }

  const loadAgent = async (id: string) => {
    const response = await fetch(`/api/agent-profil?agent_id=${id}`)
    const data = await response.json()
    if (data.success) {
      setAgent(data.agent)
      setProfil({
        biens_vendus: data.agent.biens_vendus || '',
        experience: data.agent.experience || '',
        google_rating: data.agent.google_rating || '',
        bio: data.agent.bio || '',
        prenom: data.agent.prenom || '',
        nom: data.agent.nom || '',
        nom_agence: data.agent.type === 'agence' ? data.agent.nom : '',
        reseau: data.agent.reseau || '',
        ville: data.agent.ville || '',
        telephone: data.agent.telephone || '',
        email: data.agent.email || '',
        instagram: data.agent.instagram || '',
        tiktok: data.agent.tiktok || '',
        facebook: data.agent.facebook || '',
        linkedin: data.agent.linkedin || '',
        youtube: data.agent.youtube || '',
        site_web: data.agent.site_web || '',
      })
    }
  }

  const uploadPhoto = async (file: File) => {
    if (!agentId) return
    setUploadingPhoto(true)
    const fd = new FormData()
    fd.append('agent_id', agentId)
    fd.append('file', file)
    const res = await fetch('/api/upload-photo', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.success) loadAgent(agentId)
    setUploadingPhoto(false)
  }

  const saveProfil = async () => {
    if (!agentId) return
    setSavingProfil(true)
    await fetch('/api/agent-profil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId, ...profil })
    })
    await loadAgent(agentId)
    setSavingProfil(false)
    alert('✅ Profil mis à jour')
  }

  const deletePage = async () => {
    if (!agentId) return
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre page ? Cette action est irréversible.')) return
    await fetch('/api/agent-profil', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId })
    })
    document.cookie = 'kodeoo_agent_id=; Max-Age=0; path=/'
    document.cookie = 'kodeoo_slug=; Max-Age=0; path=/'
    document.cookie = 'kodeoo_member_id=; Max-Age=0; path=/'
    window.location.href = 'https://kodeoo.fr'
  }

  const addAvis = async () => {
    if (!agentId || !newAvis.auteur || !newAvis.texte) return
    await fetch('/api/avis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId, ...newAvis })
    })
    setNewAvis({ auteur: '', texte: '', note: 5, date_avis: '' })
    loadAvis(agentId)
  }

  const deleteAvis = async (avis_id: string) => {
    if (!agentId) return
    await fetch('/api/avis', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avis_id, agent_id: agentId })
    })
    loadAvis(agentId)
  }
  const getRessource = (lm_id: string) => ressources.find(r => r.lead_magnet_id === lm_id)

  const toggleRessource = async (lm_id: string, actif: boolean) => {
    if (!agentId) return
    if (!actif) {
      await fetch('/api/ressources', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agent_id: agentId, lead_magnet_id: lm_id }) })
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
    setLoading(true); setPreview(null)
    try {
      const res = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
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
      const res = await fetch('/api/import-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agent_id: agentId, list_url: listUrl }) })
      const data = await res.json()
      if (data.success) { alert(`✅ ${data.importes} biens importés !`); setListUrl(''); loadBiens(agentId) }
      else alert('Erreur : ' + data.error)
    } catch { alert('Erreur réseau') }
    setLoadingAll(false)
  }

  const saveBien = async () => {
    if (!preview || !agentId) return
    setSaving(true)
    try {
      const res = await fetch('/api/biens', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agent_id: agentId, titre: preview.titre, prix: preview.prix_saisi ? parseInt(String(preview.prix_saisi)) : null, surface: preview.surface, pieces: preview.pieces, chambres: preview.chambres, ville: preview.ville, description: preview.description, photos: preview.photos, dpe: preview.dpe, source_url: preview.source_url }) })
      const data = await res.json()
      if (data.success) { setPreview(null); setUrl(''); loadBiens(agentId) }
      else alert('Erreur : ' + data.error)
    } catch { alert('Erreur réseau') }
    setSaving(false)
  }

  const deleteBien = async (bien_id: string) => {
    if (!agentId) return
    await fetch('/api/biens', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bien_id, agent_id: agentId }) })
    loadBiens(agentId)
  }

  const typeLabel: Record<string, string> = {
    contact: 'Contact', estimation: 'Estimation', lead_magnet: 'Ressource',
    acquéreur: 'Acheteur', vendeur: 'Vendeur', rdv: 'RDV', notification: 'Notif'
  }
  const typeColor: Record<string, string> = {
    contact: '#E8F0FF:#3B5BDB', estimation: '#FFF3E0:#E65100', lead_magnet: '#E8F5E9:#2E7D32',
    acquéreur: '#E8F0FF:#3B5BDB', vendeur: '#FFF3E0:#E65100', rdv: '#F3E5F5:#7B1FA2', notification: '#F5F5F5:#666'
  }

  if (notFound) return (
    <div style={{fontFamily:'system-ui,sans-serif',maxWidth:480,margin:'80px auto',padding:'0 16px',textAlign:'center'}}>
      <div style={{fontSize:40,marginBottom:16}}>🔒</div>
      <div style={{fontSize:20,fontWeight:600,color:'#1C1C1E',marginBottom:8}}>Accès non autorisé</div>
      <div style={{fontSize:14,color:'#6B6B80',marginBottom:24}}>Connectez-vous depuis votre espace membre Kodeoo.</div>
      <a href="https://kodeoo.fr/espace-membre" style={{display:'inline-flex',alignItems:'center',height:42,padding:'0 20px',background:'#1C1C1E',color:'#fff',borderRadius:8,textDecoration:'none',fontSize:13,fontWeight:500}}>Retour sur Kodeoo →</a>
    </div>
  )

  if (!agentId) return (
    <div style={{fontFamily:'system-ui,sans-serif',display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#8E8E93',fontSize:14}}>Chargement...</div>
  )

  const navItems = [
    { id: 'biens', label: 'Mes biens', count: biens.length, icon: '🏠' },
    { id: 'ressources', label: 'Ressources', count: null, icon: '📄' },
    { id: 'leads', label: 'Leads', count: leads.length, icon: '👤' },
    { id: 'profil', label: 'Mon profil', count: null, icon: '⚙️' },
  ]

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#F5F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1C1C1E}
        .layout{display:flex;min-height:100vh}

        /* SIDEBAR */
        .sidebar{width:240px;background:#fff;border-right:1px solid #EBEBEB;display:flex;flex-direction:column;position:fixed;top:0;left:0;height:100vh;z-index:100;flex-shrink:0}
        .sidebar-logo{padding:20px 20px 16px;border-bottom:1px solid #EBEBEB;display:flex;align-items:center;gap:8px}
        .logo-k{width:28px;height:28px;background:#1C1C1E;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
        .logo-name{font-size:15px;font-weight:700;color:#1C1C1E}
        .sidebar-nav{padding:12px 10px;flex:1}
        .nav-section{font-size:10px;font-weight:600;color:#C7C7CC;text-transform:uppercase;letter-spacing:0.08em;padding:0 10px;margin-bottom:6px;margin-top:16px}
        .nav-section:first-child{margin-top:4px}
        .nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;color:#6B6B80;transition:all 0.15s;text-decoration:none;margin-bottom:2px}
        .nav-item:hover{background:#F5F5F0;color:#1C1C1E}
        .nav-item.on{background:#1C1C1E;color:#fff}
        .nav-item.on .nav-count{background:rgba(255,255,255,0.2);color:#fff}
        .nav-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
        .nav-label{flex:1}
        .nav-count{background:#F5F5F0;color:#8E8E93;font-size:11px;font-weight:600;padding:2px 7px;border-radius:20px;min-width:22px;text-align:center}
        .sidebar-footer{padding:14px 10px;border-top:1px solid #EBEBEB}
        .view-page-btn{display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:8px;background:#F5F5F0;border:1px solid #E0E0DB;font-size:13px;font-weight:500;color:#1C1C1E;text-decoration:none;transition:all 0.15s}
        .view-page-btn:hover{background:#EBEBEB}

        /* MAIN */
        .main{margin-left:240px;flex:1;min-height:100vh;display:flex;flex-direction:column}
        .main-header{background:#fff;border-bottom:1px solid #EBEBEB;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
        .page-title{font-size:18px;font-weight:700;color:#1C1C1E;letter-spacing:-0.3px}
        .page-subtitle{font-size:13px;color:#8E8E93;margin-top:2px}
        .main-content{padding:28px 32px;max-width:900px}

        /* CARDS */
        .card{background:#fff;border:1px solid #EBEBEB;border-radius:12px;padding:20px;margin-bottom:16px}
        .card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .card-title{font-size:14px;font-weight:600;color:#1C1C1E}
        .card-sub{font-size:13px;color:#8E8E93;margin-top:3px}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}

        /* INPUTS */
        .input-row{display:flex;gap:8px}
        .inp{flex:1;height:40px;background:#F9F9F9;border:1px solid #E8E8E8;border-radius:8px;padding:0 12px;font-family:inherit;font-size:13px;color:#1C1C1E;outline:none;transition:border-color 0.15s}
        .inp:focus{border-color:#1C1C1E;background:#fff}
        .inp::placeholder{color:#C7C7CC}
        .btn-black{height:40px;padding:0 16px;background:#1C1C1E;color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;transition:background 0.15s}
        .btn-black:hover{background:#2C2C2E}
        .btn-black:disabled{opacity:0.5;cursor:not-allowed}
        .btn-outline{height:40px;padding:0 16px;background:#fff;color:#1C1C1E;border:1.5px solid #1C1C1E;border-radius:8px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px}
        .hint{font-size:11px;color:#C7C7CC;margin-top:7px}
        .divider{height:1px;background:#F5F5F0;margin:16px 0}

        /* PREVIEW */
        .preview-box{background:#FAFAF8;border:1px solid #E8E8E8;border-radius:10px;padding:16px;margin-top:14px}
        .preview-grid{display:grid;grid-template-columns:80px 1fr;gap:14px;align-items:start}
        .preview-img{width:80px;height:80px;border-radius:8px;overflow:hidden;background:#EBEBEB;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
        .preview-img img{width:100%;height:100%;object-fit:cover}
        .preview-name{font-size:14px;font-weight:600;color:#1C1C1E;margin-bottom:6px;line-height:1.3}
        .specs{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px}
        .spec{font-size:11px;color:#6B6B80;background:#F5F5F0;padding:3px 8px;border-radius:5px;border:1px solid #E8E8E8}
        .prix-row{display:flex;align-items:center;gap:8px;margin-bottom:10px}
        .prix-inp{height:34px;background:#fff;border:1.5px solid #1C1C1E;border-radius:7px;padding:0 10px;font-family:inherit;font-size:13px;font-weight:600;color:#1C1C1E;outline:none;width:130px}
        .action-row{display:flex;gap:7px}
        .btn-save{height:34px;padding:0 16px;background:#1C1C1E;color:#fff;border:none;border-radius:7px;font-family:inherit;font-size:12px;font-weight:500;cursor:pointer}
        .btn-cancel{height:34px;padding:0 12px;background:#fff;color:#6B6B80;border:1px solid #E8E8E8;border-radius:7px;font-family:inherit;font-size:12px;cursor:pointer}

        /* TABLE BIENS */
        .table{width:100%;border-collapse:collapse}
        .table th{font-size:11px;font-weight:600;color:#8E8E93;text-transform:uppercase;letter-spacing:0.06em;padding:8px 12px;text-align:left;border-bottom:1px solid #F0F0F0}
        .table td{padding:10px 12px;border-bottom:1px solid #F9F9F9;font-size:13px;color:#1C1C1E;vertical-align:middle}
        .table tr:last-child td{border-bottom:none}
        .table tr:hover td{background:#FAFAFA}
        .thumb{width:40px;height:40px;border-radius:6px;overflow:hidden;background:#EBEBEB;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px}
        .thumb img{width:100%;height:100%;object-fit:cover}
        .bien-name-cell{font-weight:500;max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .btn-del{width:28px;height:28px;border-radius:6px;background:#fff;border:1px solid #E8E8E8;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#C7C7CC;font-size:14px;transition:all 0.15s}
        .btn-del:hover{background:#FEE2E2;border-color:#FECACA;color:#EF4444}
        .empty-state{text-align:center;padding:48px 24px;color:#8E8E93}
        .empty-icon{font-size:40px;margin-bottom:12px}
        .empty-title{font-size:15px;font-weight:600;color:#3C3C43;margin-bottom:6px}
        .empty-sub{font-size:13px;color:#C7C7CC}
        .spinner{width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* RESSOURCES */
        .lm-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .lm-card{background:#fff;border:1px solid #EBEBEB;border-radius:12px;padding:18px}
        .lm-card-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}
        .lm-titre{font-size:14px;font-weight:600;color:#1C1C1E;margin-bottom:3px}
        .lm-desc{font-size:12px;color:#8E8E93;line-height:1.5}
        .toggle{width:44px;height:26px;border-radius:13px;border:none;cursor:pointer;position:relative;transition:background 0.2s;flex-shrink:0;margin-top:2px}
        .toggle.on{background:#1C1C1E}
        .toggle.off{background:#E0E0DB}
        .toggle::after{content:'';position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2)}
        .toggle.on::after{left:21px}
        .toggle.off::after{left:3px}
        .lm-status{font-size:12px;margin-bottom:12px;display:flex;align-items:center;gap:6px}
        .lm-status.active{color:#16A34A}
        .lm-status.inactive{color:#C7C7CC}
        .status-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0}
        .upload-zone{border:1.5px dashed #E0E0DB;border-radius:8px;padding:14px;text-align:center;cursor:pointer;transition:border-color 0.15s}
        .upload-zone:hover{border-color:#1C1C1E}
        .upload-label{font-size:12px;color:#8E8E93;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
        .upload-label input{display:none}
        .pdf-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;background:#F0FFF4;border:1px solid #BBF7D0;border-radius:6px;font-size:11px;font-weight:500;color:#166534}

        /* LEADS */
        .leads-table{width:100%;border-collapse:collapse}
        .leads-table th{font-size:11px;font-weight:600;color:#8E8E93;text-transform:uppercase;letter-spacing:0.06em;padding:10px 16px;text-align:left;border-bottom:2px solid #F0F0F0;background:#FAFAFA}
        .leads-table td{padding:14px 16px;border-bottom:1px solid #F5F5F5;font-size:13px;color:#1C1C1E;vertical-align:top}
        .leads-table tr:last-child td{border-bottom:none}
        .leads-table tr:hover td{background:#FAFAFA}
        .lead-name{font-weight:600;color:#1C1C1E;margin-bottom:2px}
        .lead-contact{font-size:12px;color:#6B6B80}
        .type-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
        .profil-badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:#F5F5F0;color:#3C3C43}
        .lead-msg{font-size:12px;color:#6B6B80;line-height:1.5;max-width:300px}
        .lead-date{font-size:12px;color:#C7C7CC;white-space:nowrap}
        .dot-new{width:7px;height:7px;border-radius:50%;background:#1C1C1E;display:inline-block;margin-right:4px}

        /* STATS */
        .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
        .stat-card{background:#fff;border:1px solid #EBEBEB;border-radius:10px;padding:16px}
        .stat-value{font-size:28px;font-weight:700;color:#1C1C1E;letter-spacing:-0.5px;margin-bottom:4px}
        .stat-label{font-size:12px;color:#8E8E93}

        /* MOBILE */
        .mobile-header{display:none;background:#fff;padding:12px 16px;border-bottom:1px solid #EBEBEB;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
        .burger{background:none;border:none;cursor:pointer;font-size:20px;color:#1C1C1E}
        @media(max-width:768px){
          .sidebar{transform:translateX(-100%);transition:transform 0.25s}
          .sidebar.open{transform:translateX(0)}
          .main{margin-left:0}
          .mobile-header{display:flex}
          .main-header{display:none}
          .main-content{padding:16px}
          .two-col{grid-template-columns:1fr}
          .lm-grid{grid-template-columns:1fr}
          .stats-row{grid-template-columns:1fr 1fr}
          .leads-table{display:none}
          .leads-mobile{display:block}
        }
        .leads-mobile{display:none}
        .lead-mobile-card{background:#fff;border:1px solid #EBEBEB;border-radius:10px;padding:14px;margin-bottom:8px}
      `}</style>

      {/* MOBILE HEADER */}
      <div className="mobile-header">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="logo-k">K</div>
          <span style={{fontWeight:700,fontSize:15}}>Kodeoo</span>
        </div>
        <button className="burger" onClick={() => setMobileNav(!mobileNav)}>☰</button>
      </div>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <div className="logo-k">K</div>
            <span className="logo-name">Kodeoo</span>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section">Mon espace</div>
            {navItems.map(item => (
              <div
                key={item.id}
                className={`nav-item ${tab === item.id ? 'on' : ''}`}
                onClick={() => { setTab(item.id as any); setMobileNav(false) }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span className="nav-count">{item.count}</span>
                )}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            {agentSlug && (
              <a className="view-page-btn" href={`https://go.kodeoo.fr/${agentSlug}`} target="_blank">
                <span>🔗</span>
                <span style={{flex:1}}>Voir ma page</span>
                <span style={{fontSize:12,color:'#8E8E93'}}>↗</span>
              </a>
            )}
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="main-header">
            <div>
              <div className="page-title">
                {tab === 'biens' && 'Mes biens'}
                {tab === 'ressources' && 'Ressources'}
                {tab === 'leads' && 'Leads'}
{tab === 'profil' && 'Mon profil'}
              </div>
              <div className="page-subtitle">
                {tab === 'biens' && `${biens.length} bien${biens.length !== 1 ? 's' : ''} sur votre page`}
                {tab === 'ressources' && 'Gérez vos guides et ressources téléchargeables'}
                {tab === 'leads' && `${leads.length} prospect${leads.length !== 1 ? 's' : ''} capté${leads.length !== 1 ? 's' : ''}`}
{tab === 'profil' && 'Personnalisez votre Kodeoo Link'}
              </div>
            </div>
          </div>

          <div className="main-content">

            {/* ── STATS ── */}
            {tab === 'biens' && (
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-value">{biens.length}</div>
                  <div className="stat-label">Biens actifs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{leads.length}</div>
                  <div className="stat-label">Leads total</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{leads.filter(l => !l.is_read).length}</div>
                  <div className="stat-label">Non lus</div>
                </div>
              </div>
            )}

{/* ── PROFIL ── */}
            {tab === 'profil' && (
              <>
              {/* Infos de base */}
                <div className="card">
                  <div className="card-title" style={{marginBottom:4}}>Informations de base</div>
                  <div className="card-sub" style={{marginBottom:16}}>Modifiez vos informations principales</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                    {agent?.type !== 'agence' ? (
                      <>
                        <div>
                          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Prénom</label>
                          <input className="inp" value={profil.prenom} onChange={e => setProfil(p => ({ ...p, prenom: e.target.value }))} placeholder="Sophie" />
                        </div>
                        <div>
                          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Nom</label>
                          <input className="inp" value={profil.nom} onChange={e => setProfil(p => ({ ...p, nom: e.target.value }))} placeholder="Martin" />
                        </div>
                        <div style={{gridColumn:'1/-1'}}>
                          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Réseau ou Agence</label>
                          <input className="inp" value={profil.reseau} onChange={e => setProfil(p => ({ ...p, reseau: e.target.value }))} placeholder="IAD France, Safti..." />
                        </div>
                      </>
                    ) : (
                      <div style={{gridColumn:'1/-1'}}>
                        <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Nom de l'agence</label>
                        <input className="inp" value={profil.nom_agence} onChange={e => setProfil(p => ({ ...p, nom_agence: e.target.value }))} placeholder="Agence Dupont" />
                      </div>
                    )}
                    <div>
                      <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Ville</label>
                      <input className="inp" value={profil.ville} onChange={e => setProfil(p => ({ ...p, ville: e.target.value }))} placeholder="Lyon" />
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Téléphone</label>
                      <input className="inp" value={profil.telephone} onChange={e => setProfil(p => ({ ...p, telephone: e.target.value }))} placeholder="06 00 00 00 00" />
                    </div>
                    <div style={{gridColumn:'1/-1'}}>
                      <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Email</label>
                      <input className="inp" type="email" value={profil.email} onChange={e => setProfil(p => ({ ...p, email: e.target.value }))} placeholder="vous@exemple.fr" />
                    </div>
                  </div>
                  <button className="btn-black" onClick={saveProfil} disabled={savingProfil}>
                    {savingProfil ? 'Sauvegarde...' : '✓ Enregistrer'}
                  </button>
                </div>

                {/* Photo de profil */}
                <div className="card two-col" style={{alignItems:'start'}}>
                  <div>
                    <div className="card-title">Photo de profil</div>
                    <div className="card-sub" style={{marginBottom:16}}>Apparaît en haut de votre Kodeoo Link</div>
                    <div style={{display:'flex',alignItems:'center',gap:16}}>
                      <div style={{width:72,height:72,borderRadius:'50%',background:'#EBEBEB',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,color:'#6B6B80',flexShrink:0}}>
                        {agent?.photo_url
                          ? <img src={agent.photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          : <span>{agentSlug?.[0]?.toUpperCase() || '?'}</span>
                        }
                      </div>
                      <div>
                        <label style={{display:'inline-flex',alignItems:'center',gap:6,height:36,padding:'0 14px',background:'#1C1C1E',color:'#fff',borderRadius:7,fontSize:12,fontWeight:500,cursor:'pointer'}}>
                          {uploadingPhoto ? '⏳ Upload...' : '📷 Changer la photo'}
                          <input type="file" accept="image/*" style={{display:'none'}} onChange={e => { const f = e.target.files?.[0]; if(f) uploadPhoto(f) }} disabled={uploadingPhoto} />
                        </label>
                        <div style={{fontSize:11,color:'#C7C7CC',marginTop:6}}>JPG, PNG — max 2MB</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="card-title">Bio</div>
                    <div className="card-sub" style={{marginBottom:12}}>Présentez-vous en quelques mots</div>
                    <textarea
                      style={{width:'100%',minHeight:80,background:'#F9F9F9',border:'1px solid #E8E8E8',borderRadius:8,padding:'10px 12px',fontFamily:'inherit',fontSize:13,color:'#1C1C1E',outline:'none',resize:'vertical',lineHeight:1.6}}
                      placeholder="Spécialiste du marché depuis X ans, j'accompagne..."
                      value={profil.bio}
                      onChange={e => setProfil(p => ({ ...p, bio: e.target.value }))}
                    />
                  </div>
                </div>

{/* Réseaux sociaux */}
                <div className="card">
                  <div className="card-title" style={{marginBottom:4}}>Réseaux sociaux</div>
                  <div className="card-sub" style={{marginBottom:16}}>Collez vos liens complets</div>
                  <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
                    {[
                      { label: 'Instagram', key: 'instagram', placeholder: 'https://instagram.com/votre.compte' },
                      { label: 'TikTok', key: 'tiktok', placeholder: 'https://tiktok.com/@votre.compte' },
                      { label: 'Facebook', key: 'facebook', placeholder: 'https://facebook.com/votre.page' },
                      { label: 'LinkedIn', key: 'linkedin', placeholder: 'https://linkedin.com/in/votre-profil' },
                      { label: 'YouTube', key: 'youtube', placeholder: 'https://youtube.com/@votre-chaine' },
                      { label: 'Site web', key: 'site_web', placeholder: 'https://votre-site.fr' },
                    ].map(s => (
                      <div key={s.key} style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:13,fontWeight:500,color:'#1C1C1E',minWidth:80}}>{s.label}</span>
                        <input className="inp" style={{flex:1}} placeholder={s.placeholder} value={(profil as any)[s.key]} onChange={e => setProfil(p => ({ ...p, [s.key]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                  <button className="btn-black" onClick={saveProfil} disabled={savingProfil}>
                    {savingProfil ? 'Sauvegarde...' : '✓ Enregistrer'}
                  </button>
                </div>
                
                {/* Preuves sociales */}
                <div className="card">
                  <div className="card-title" style={{marginBottom:4}}>Preuves sociales</div>
                  <div className="card-sub" style={{marginBottom:16}}>Apparaissent sous votre nom sur votre page</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:16}}>
                    <div>
                      <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:6}}>Note Google (/5)</label>
                      <input className="inp" type="number" step="0.1" min="0" max="5" placeholder="ex. 4.9" value={profil.google_rating} onChange={e => setProfil(p => ({ ...p, google_rating: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:6}}>Biens vendus</label>
                      <input className="inp" type="number" placeholder="ex. 47" value={profil.biens_vendus} onChange={e => setProfil(p => ({ ...p, biens_vendus: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:6}}>Années d'expérience</label>
                      <input className="inp" type="number" placeholder="ex. 8" value={profil.experience} onChange={e => setProfil(p => ({ ...p, experience: e.target.value }))} />
                    </div>
                  </div>
                  <button className="btn-black" onClick={saveProfil} disabled={savingProfil}>
                    {savingProfil ? 'Sauvegarde...' : '✓ Enregistrer'}
                  </button>
                </div>

                {/* Avis clients */}
                <div className="card">
                  <div className="card-title" style={{marginBottom:4}}>Avis clients</div>
                  <div className="card-sub" style={{marginBottom:16}}>Ajoutez vos meilleurs avis — ils s'affichent sur votre page</div>

                  {/* Formulaire ajout avis */}
                  <div style={{background:'#F9F9F9',border:'1px solid #E8E8E8',borderRadius:10,padding:16,marginBottom:16}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#1C1C1E',marginBottom:12}}>Ajouter un avis</div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                      <div>
                        <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Prénom &amp; Nom</label>
                        <input className="inp" placeholder="Marie R." value={newAvis.auteur} onChange={e => setNewAvis(a => ({ ...a, auteur: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Date</label>
                        <input className="inp" placeholder="Mars 2026" value={newAvis.date_avis} onChange={e => setNewAvis(a => ({ ...a, date_avis: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{marginBottom:10}}>
                      <label style={{display:'block',fontSize:11,fontWeight:600,color:'#8E8E93',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:5}}>Texte de l'avis</label>
                      <textarea
                        style={{width:'100%',minHeight:70,background:'#fff',border:'1px solid #E8E8E8',borderRadius:8,padding:'8px 12px',fontFamily:'inherit',fontSize:13,color:'#1C1C1E',outline:'none',resize:'vertical',lineHeight:1.5}}
                        placeholder="Excellent accompagnement, je recommande vivement..."
                        value={newAvis.texte}
                        onChange={e => setNewAvis(a => ({ ...a, texte: e.target.value }))}
                      />
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <label style={{fontSize:12,color:'#8E8E93'}}>Note :</label>
                        <select style={{height:34,background:'#fff',border:'1px solid #E8E8E8',borderRadius:7,padding:'0 10px',fontFamily:'inherit',fontSize:13,color:'#1C1C1E',outline:'none'}} value={newAvis.note} onChange={e => setNewAvis(a => ({ ...a, note: parseInt(e.target.value) }))}>
                          <option value={5}>★★★★★ 5</option>
                          <option value={4}>★★★★ 4</option>
                          <option value={3}>★★★ 3</option>
                        </select>
                      </div>
                      <button className="btn-black" onClick={addAvis} disabled={!newAvis.auteur || !newAvis.texte}>
                        + Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Liste avis */}
                  {avis.length === 0 ? (
                    <div style={{textAlign:'center',padding:'24px',color:'#C7C7CC',fontSize:13}}>
                      Aucun avis ajouté — ajoutez vos meilleurs témoignages
                    </div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {avis.map((a: any) => (
                        <div key={a.id} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px',background:'#F9F9F9',borderRadius:8}}>
                          <div style={{flex:1}}>
                            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                              <span style={{fontSize:13,fontWeight:600,color:'#1C1C1E'}}>{a.auteur}</span>
                              <span style={{fontSize:11,color:'#FF9500'}}>{'★'.repeat(a.note)}</span>
                              {a.date_avis && <span style={{fontSize:11,color:'#C7C7CC'}}>{a.date_avis}</span>}
                            </div>
                            <div style={{fontSize:13,color:'#6B6B80',lineHeight:1.5}}>"{a.texte}"</div>
                          </div>
                          <button className="btn-del" onClick={() => deleteAvis(a.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Zone danger */}
                <div className="card" style={{borderColor:'#FECACA'}}>
                  <div className="card-title" style={{color:'#EF4444',marginBottom:4}}>Supprimer ma page</div>
                  <div className="card-sub" style={{marginBottom:16}}>La suppression de votre page est irréversible. Tous vos biens, leads et ressources seront supprimés.</div>
                  <button onClick={deletePage} style={{height:40,padding:'0 16px',background:'#FEF2F2',color:'#EF4444',border:'1.5px solid #FECACA',borderRadius:8,fontFamily:'inherit',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    Supprimer ma page
                  </button>
                </div>
              </>
            )}

            {/* ── BIENS ── */}
            {tab === 'biens' && (
              <>
                <div className="card two-col">
                  <div>
                    <div className="card-title">🚀 Import en masse</div>
                    <div className="card-sub">URL de votre page liste de biens</div>
                    <div className="input-row" style={{marginTop:12}}>
                      <input className="inp" placeholder="https://www.iadfrance.fr/conseiller-immobilier/votre.nom" value={listUrl} onChange={e => setListUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && importAll()} />
                      <button className="btn-black" onClick={importAll} disabled={loadingAll || !listUrl}>
                        {loadingAll ? <span className="spinner"></span> : null}
                        {loadingAll ? 'Import...' : 'Importer tout'}
                      </button>
                    </div>
                    <div className="hint">✓ IAD France, Safti, sites d'agences</div>
                  </div>
                  <div>
                    <div className="card-title">🔗 Import unitaire</div>
                    <div className="card-sub">URL d'une annonce individuelle</div>
                    <div className="input-row" style={{marginTop:12}}>
                      <input className="inp" placeholder="https://www.iadfrance.fr/annonce/..." value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && scrape()} />
                      <button className="btn-black" onClick={scrape} disabled={loading || !url}>
                        {loading ? <span className="spinner"></span> : null}
                        {loading ? 'Scan...' : 'Importer'}
                      </button>
                    </div>
                  </div>
                </div>

                {preview && (
                  <div className="card">
                    <div style={{fontSize:13,fontWeight:600,color:'#1C1C1E',marginBottom:12}}>Bien récupéré — vérifiez et ajoutez le prix</div>
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
                          <button className="btn-save" onClick={saveBien} disabled={saving}>{saving ? 'Sauvegarde...' : '✓ Ajouter à ma page'}</button>
                          <button className="btn-cancel" onClick={() => { setPreview(null); setUrl('') }}>Annuler</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="card" style={{padding:0,overflow:'hidden'}}>
                  <div style={{padding:'16px 20px',borderBottom:'1px solid #F5F5F5',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div className="card-title">Biens sur ma page</div>
                    <span style={{fontSize:12,color:'#8E8E93'}}>{biens.length} bien{biens.length !== 1 ? 's' : ''}</span>
                  </div>
                  {biens.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🏠</div>
                      <div className="empty-title">Aucun bien importé</div>
                      <div className="empty-sub">Utilisez les outils ci-dessus pour importer vos annonces</div>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Bien</th>
                          <th>Ville</th>
                          <th>Surface</th>
                          <th>Prix</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {biens.map(bien => (
                          <tr key={bien.id}>
                            <td style={{width:52}}>
                              <div className="thumb">
                                {bien.photos?.[0] ? <img src={bien.photos[0]} alt="" /> : '🏠'}
                              </div>
                            </td>
                            <td><div className="bien-name-cell">{bien.titre}</div></td>
                            <td style={{color:'#6B6B80'}}>{bien.ville || '–'}</td>
                            <td style={{color:'#6B6B80'}}>{bien.surface ? `${bien.surface} m²` : '–'}</td>
                            <td style={{fontWeight:600}}>{bien.prix ? bien.prix.toLocaleString('fr-FR') + ' €' : '–'}</td>
                            <td style={{width:40}}>
                              <button className="btn-del" onClick={() => deleteBien(bien.id)}>×</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* ── RESSOURCES ── */}
            {tab === 'ressources' && (
              <>
                <div style={{fontSize:13,color:'#8E8E93',marginBottom:20,lineHeight:1.6}}>
                  Activez les ressources à afficher sur votre page et uploadez votre PDF. Le prospect remplit son email pour télécharger — le lead est automatiquement enregistré.
                </div>
                <div className="lm-grid">
                  {LEAD_MAGNETS.map(lm => {
                    const r = getRessource(lm.id)
                    const isActive = r?.actif === true
                    const hasPdf = !!r?.pdf_url
                    return (
                      <div key={lm.id} className="lm-card">
                        <div className="lm-card-header">
                          <div>
                            <div className="lm-titre">{lm.titre}</div>
                            <div className="lm-desc">{lm.description}</div>
                          </div>
                          <button className={`toggle ${isActive ? 'on' : 'off'}`} onClick={() => toggleRessource(lm.id, !isActive)}></button>
                        </div>
                        <div className={`lm-status ${isActive ? 'active' : 'inactive'}`}>
                          <span className="status-dot"></span>
                          {isActive ? (hasPdf ? 'Affiché sur votre page' : 'En attente de votre PDF') : 'Désactivé'}
                        </div>
                        {isActive && (
                          hasPdf ? (
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                              <span className="pdf-badge">✓ PDF disponible</span>
                              <label style={{cursor:'pointer',fontSize:12,color:'#8E8E93',textDecoration:'underline'}}>
                                Remplacer
                                <input type="file" accept=".pdf" style={{display:'none'}} onChange={e => { const f = e.target.files?.[0]; if(f) uploadPdf(lm.id, f) }} />
                              </label>
                            </div>
                          ) : (
                            <div className="upload-zone">
                              <label className="upload-label">
                                {uploadingId === lm.id ? '⏳ Upload en cours...' : '📎 Cliquez pour uploader votre PDF'}
                                <input type="file" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if(f) uploadPdf(lm.id, f) }} disabled={uploadingId === lm.id} />
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── LEADS ── */}
            {tab === 'leads' && (
              <>
                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-value">{leads.length}</div>
                    <div className="stat-label">Total leads</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{leads.filter(l => l.type === 'estimation').length}</div>
                    <div className="stat-label">Estimations</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{leads.filter(l => l.type === 'lead_magnet').length}</div>
                    <div className="stat-label">Ressources</div>
                  </div>
                </div>

                {leads.length === 0 ? (
                  <div className="card">
                    <div className="empty-state">
                      <div className="empty-icon">👤</div>
                      <div className="empty-title">Aucun lead pour le moment</div>
                      <div className="empty-sub">Partagez votre Kodeoo Link pour commencer à capter des prospects</div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* TABLE DESKTOP */}
                    <div className="card" style={{padding:0,overflow:'hidden'}}>
                      <table className="leads-table">
                        <thead>
                          <tr>
                            <th>Prospect</th>
                            <th>Profil</th>
                            <th>Type</th>
                            <th>Message</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leads.map(lead => {
                            const colors = (typeColor[lead.type] || '#F5F5F0:#666').split(':')
                            return (
                              <tr key={lead.id}>
                                <td>
                                  <div className="lead-name">{lead.nom}</div>
                                  <div className="lead-contact">{lead.email}</div>
                                  {lead.telephone && <div className="lead-contact">{lead.telephone}</div>}
                                </td>
                                <td>
                                  {lead.type === 'contact' && lead.message?.includes('Vendeur') ? (
                                    <span className="profil-badge">Vendeur</span>
                                  ) : lead.type === 'contact' ? (
                                    <span className="profil-badge">Acheteur</span>
                                  ) : lead.type === 'estimation' ? (
                                    <span className="profil-badge">Vendeur</span>
                                  ) : (
                                    <span className="profil-badge">–</span>
                                  )}
                                </td>
                                <td>
                                  <span className="type-badge" style={{background:colors[0],color:colors[1]}}>
                                    {typeLabel[lead.type] || lead.type}
                                  </span>
                                </td>
                                <td>
                                  <div className="lead-msg">{lead.message || lead.lead_magnet || '–'}</div>
                                </td>
                                <td>
                                  <div className="lead-date">
                                    {new Date(lead.created_at).toLocaleDateString('fr-FR', {day:'numeric',month:'short',year:'numeric'})}
                                  </div>
                                  <div className="lead-date">
                                    {new Date(lead.created_at).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* CARDS MOBILE */}
                    <div className="leads-mobile">
                      {leads.map(lead => {
                        const colors = (typeColor[lead.type] || '#F5F5F0:#666').split(':')
                        return (
                          <div key={lead.id} className="lead-mobile-card">
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                              <div>
                                <div style={{fontWeight:600,fontSize:14,color:'#1C1C1E'}}>{lead.nom}</div>
                                <div style={{fontSize:12,color:'#6B6B80'}}>{lead.email}</div>
                              </div>
                              <span className="type-badge" style={{background:colors[0],color:colors[1]}}>{typeLabel[lead.type] || lead.type}</span>
                            </div>
                            {lead.telephone && <div style={{fontSize:12,color:'#6B6B80',marginBottom:4}}>📞 {lead.telephone}</div>}
                            {lead.message && <div style={{fontSize:12,color:'#8E8E93',lineHeight:1.5,marginBottom:6}}>{lead.message}</div>}
                            <div style={{fontSize:11,color:'#C7C7CC'}}>{new Date(lead.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </>
            )}

          </div>
        </main>
      </div>
    </>
  )
}