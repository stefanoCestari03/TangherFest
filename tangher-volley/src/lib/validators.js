import { FORMATI_OK, MAX_FILE_MB } from './constants'
import { isMinorenne, calcolaEta } from './helpers'

function validateEmailStr(email) {
  if (!email?.trim()) return 'Campo obbligatorio'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return 'Email non valida'
  return null
}

export function validateFile(file) {
  if (!file) return null
  if (!FORMATI_OK.includes(file.type))
    return 'Formato non valido. Usa JPG, PNG o PDF.'
  if (file.size > MAX_FILE_MB * 1024 * 1024)
    return `File troppo grande. Max ${MAX_FILE_MB}MB.`
  return null
}

/** Valida il codice fiscale italiano (formato base 16 caratteri) */
export function validateCF(cf) {
  if (!cf) return 'Campo obbligatorio'
  const cfClean = cf.trim().toUpperCase()
  if (!/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/.test(cfClean))
    return 'Codice fiscale non valido (formato: XXXXXX00X00X000X)'
  return null
}

/** Valida telefono italiano */
export function validateTelefono(tel) {
  if (!tel) return 'Campo obbligatorio'
  const clean = tel.replace(/\s/g, '')
  if (!/^(\+39)?3[0-9]{8,9}$/.test(clean) && !/^0[0-9]{6,10}$/.test(clean))
    return 'Numero non valido (es. +39 333 1234567)'
  return null
}

/** Valida data di nascita */
export function validateDataNascita(data) {
  if (!data) return 'Campo obbligatorio'
  const d   = new Date(data)
  const eta = calcolaEta(data)
  if (isNaN(d)) return 'Data non valida'
  if (eta < 6)  return 'Età minima 6 anni'
  if (eta > 99) return 'Data di nascita non valida'
  return null
}

export function validateForm(form, squadreEsistenti, aggiungiQuarto = false) {
  const errors  = {}
  const globals = []

  /* ── Dati squadra ─────────────────────────────────────── */
  if (!form.nomeSquadra.trim())
    errors.nomeSquadra = 'Campo obbligatorio'

  if (!form.referente.trim())
    errors.referente = 'Campo obbligatorio'

  const errEmail = validateEmailStr(form.email)
  if (errEmail) errors.email = errEmail

  if (!form.telefono.trim())
    errors.telefono = 'Campo obbligatorio'

  /* ── Duplicati squadra ──────────────────────────────── */
  const nomeNorm = form.nomeSquadra.trim().toLowerCase()
  if (nomeNorm && squadreEsistenti.some(s => s.nomeSquadra.toLowerCase() === nomeNorm))
    errors.nomeSquadra = 'Squadra già iscritta con questo nome'

  const emailNorm = form.email.trim().toLowerCase()
  if (emailNorm.includes('@') && squadreEsistenti.some(s => s.email.toLowerCase() === emailNorm))
    errors.email = 'Email già utilizzata'

  /* ── Nomi già iscritti in altre squadre ─────────────── */
  const giaIscritti = squadreEsistenti.flatMap(s =>
    (s.giocatori || []).map(g =>
      `${g.nome.trim().toLowerCase()} ${g.cognome.trim().toLowerCase()}`
    )
  )

  /* ── Codici fiscali già iscritti ────────────────────── */
  const cfIscritti = squadreEsistenti.flatMap(s =>
    (s.giocatori || []).map(g => (g.codiceFiscale || '').trim().toUpperCase())
  ).filter(Boolean)

  /* ── Giocatori ──────────────────────────────────────── */
  const giocatoriAttivi = form.giocatori.filter((g, i) => {
    // I giocatori 0-2 sempre obbligatori; il 4° (idx 3) solo se ha qualcosa compilato
    if (i < 3) return true
    return g.nome.trim() || g.cognome.trim() || g.codiceFiscale.trim()
  })

  form.giocatori.forEach((g, i) => {
    const attivo = i < 3 || (i === 3 && aggiungiQuarto)
    if (!attivo) return

    const pre = `g${i}`
    const minore = isMinorenne(g.dataNascita)

    // Nome / Cognome
    if (!g.nome.trim())    errors[`${pre}_nome`]    = 'Obbligatorio'
    if (!g.cognome.trim()) errors[`${pre}_cognome`] = 'Obbligatorio'

    // Data nascita
    const errData = validateDataNascita(g.dataNascita)
    if (errData) errors[`${pre}_data`] = errData

    // Codice fiscale
    const errCF = validateCF(g.codiceFiscale)
    if (errCF) errors[`${pre}_cf`] = errCF

    // Telefono (obbligatorio solo per maggiorenni o 4°)
    if (!minore || i < 3) {
      const errTel = validateTelefono(g.telefono)
      if (errTel) errors[`${pre}_tel`] = errTel
    }

    // Categoria
    if (!g.categoria) errors[`${pre}_cat`] = 'Seleziona categoria'

    // File documento
    if (g.fileErr) errors[`${pre}_file`] = g.fileErr

    // CF duplicato
    const cfClean = g.codiceFiscale.trim().toUpperCase()
    if (cfClean && cfIscritti.includes(cfClean))
      errors[`${pre}_cf`] = 'Codice fiscale già iscritto'

    // CF duplicato interno
    const altriCF = form.giocatori
      .filter((_, j) => j !== i && (j < 3 || form.giocatori[j].nome.trim()))
      .map(gg => gg.codiceFiscale.trim().toUpperCase())
    if (cfClean && altriCF.includes(cfClean))
      errors[`${pre}_cf`] = 'Codice fiscale duplicato nella squadra'

    // Giocatore già iscritto per nome
    if (g.nome.trim() && g.cognome.trim()) {
      const chiave = `${g.nome.trim().toLowerCase()} ${g.cognome.trim().toLowerCase()}`
      if (giaIscritti.includes(chiave))
        errors[`${pre}_nome`] = 'Già iscritto in un\'altra squadra'
      const altriNomi = form.giocatori
        .filter((_, j) => j !== i && (j < 3 || form.giocatori[j].nome.trim()))
        .map(gg => `${gg.nome.trim().toLowerCase()} ${gg.cognome.trim().toLowerCase()}`)
      if (altriNomi.includes(chiave))
        errors[`${pre}_nome`] = 'Giocatore duplicato nella squadra'
    }

    // ── Consensi maggiorenne ─────────────────────────────
    if (!minore) {
      if (!g.accettaRegolamento)
        errors[`${pre}_reg`] = 'Accettazione obbligatoria'
    }

    // ── Campi minorenni ──────────────────────────────────
    if (minore) {
      if (!g.tutoreNome.trim())    errors[`${pre}_tnome`]  = 'Obbligatorio'
      if (!g.tutoreCognome.trim()) errors[`${pre}_tcog`]   = 'Obbligatorio'
      const errTCF = validateCF(g.tutoreCF)
      if (errTCF) errors[`${pre}_tcf`] = errTCF
      const errTEmail = validateEmailStr(g.tutoreEmail)
      if (errTEmail) errors[`${pre}_temail`] = errTEmail
      if (!g.tutoreFileObj && !g.tutoreFileName)
        errors[`${pre}_tdoc`] = 'Documento genitore obbligatorio'
      if (g.tutoreFileErr) errors[`${pre}_tdoc`] = g.tutoreFileErr
      if (!g.accettaTutore)
        errors[`${pre}_ttut`] = 'Autorizzazione genitore obbligatoria'
    }
  })

  /* ── Vincoli squadra tesserata ──────────────────────── */
  if (form.tipo === 'tesserata') {
    const attivi = form.giocatori.filter((g, i) => i < 3 || g.nome.trim())
    const maschi  = attivi.filter(g => g.genere === 'M').length
    const femmine = attivi.filter(g => g.genere === 'F').length
    if (maschi > 2)  globals.push('Squadra tesserata: massimo 2 componenti maschili tesserati.')
    if (femmine < 1) globals.push('Squadra tesserata: almeno 1 componente femminile obbligatoria.')
  }

  return {
    errors,
    globals,
    isValid: Object.keys(errors).length === 0 && globals.length === 0,
  }
}
