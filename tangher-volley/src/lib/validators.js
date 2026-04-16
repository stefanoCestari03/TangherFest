import { FORMATI_OK, MAX_FILE_MB } from './constants'

export function validateFile(file) {
  if (!file) return null
  if (!FORMATI_OK.includes(file.type))
    return 'Formato non valido. Usa JPG, PNG o PDF.'
  if (file.size > MAX_FILE_MB * 1024 * 1024)
    return `File troppo grande. Max ${MAX_FILE_MB}MB.`
  return null
}

export function validateForm(form, squadreEsistenti) {
  const errors  = {}
  const globals = []

  /* ── Dati squadra ── */
  if (!form.nomeSquadra.trim())
    errors.nomeSquadra = 'Campo obbligatorio'

  if (!form.referente.trim())
    errors.referente = 'Campo obbligatorio'

  if (!form.email.trim() || !form.email.includes('@'))
    errors.email = 'Email non valida'

  if (!form.telefono.trim())
    errors.telefono = 'Campo obbligatorio'

  /* ── Duplicato nome squadra ── */
  const nomeNorm = form.nomeSquadra.trim().toLowerCase()
  if (nomeNorm && squadreEsistenti.some(s => s.nomeSquadra.toLowerCase() === nomeNorm))
    errors.nomeSquadra = 'Squadra già iscritta con questo nome'

  /* ── Duplicato email ── */
  const emailNorm = form.email.trim().toLowerCase()
  if (emailNorm && emailNorm.includes('@') && squadreEsistenti.some(s => s.email.toLowerCase() === emailNorm))
    errors.email = 'Email già utilizzata per un\'altra iscrizione'

  /* ── Nomi già iscritti ── */
  const giaIscritti = squadreEsistenti.flatMap(s =>
    s.giocatori.map(g => `${g.nome.trim().toLowerCase()} ${g.cognome.trim().toLowerCase()}`)
  )

  /* ── Giocatori ── */
  form.giocatori.forEach((g, i) => {
    const pre = `g${i}`

    if (!g.nome.trim())    errors[`${pre}_nome`]    = 'Obbligatorio'
    if (!g.cognome.trim()) errors[`${pre}_cognome`] = 'Obbligatorio'
    if (!g.categoria)      errors[`${pre}_cat`]     = 'Seleziona categoria'
    if (g.fileErr)         errors[`${pre}_file`]    = g.fileErr

    if (g.nome.trim() && g.cognome.trim()) {
      const chiave = `${g.nome.trim().toLowerCase()} ${g.cognome.trim().toLowerCase()}`

      /* già in un'altra squadra */
      if (giaIscritti.includes(chiave))
        errors[`${pre}_nome`] = 'Già iscritto in un\'altra squadra'

      /* duplicato interno */
      const altriInterni = form.giocatori
        .filter((_, j) => j !== i)
        .map(gg => `${gg.nome.trim().toLowerCase()} ${gg.cognome.trim().toLowerCase()}`)
      if (altriInterni.includes(chiave))
        errors[`${pre}_nome`] = 'Giocatore duplicato nella stessa squadra'
    }
  })

  /* ── Vincoli squadra tesserata ── */
  if (form.tipo === 'tesserata') {
    const maschi  = form.giocatori.filter(g => g.genere === 'M').length
    const femmine = form.giocatori.filter(g => g.genere === 'F').length
    if (maschi > 2)  globals.push('Squadra tesserata: massimo 2 componenti maschili.')
    if (femmine < 1) globals.push('Squadra tesserata: almeno 1 componente femminile obbligatoria.')
  }

  return { errors, globals, isValid: Object.keys(errors).length === 0 && globals.length === 0 }
}
