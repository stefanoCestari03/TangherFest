export const genId = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export const formatDate = iso =>
  new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })

/** Calcola l'età in anni interi dalla data di nascita (stringa YYYY-MM-DD) */
export function calcolaEta(dataNascita) {
  if (!dataNascita) return null
  const oggi   = new Date()
  const nasc   = new Date(dataNascita)
  if (isNaN(nasc)) return null
  let eta = oggi.getFullYear() - nasc.getFullYear()
  const mDiff = oggi.getMonth() - nasc.getMonth()
  if (mDiff < 0 || (mDiff === 0 && oggi.getDate() < nasc.getDate())) eta--
  return eta
}

export function isMinorenne(dataNascita) {
  const eta = calcolaEta(dataNascita)
  return eta !== null && eta < 18
}

/** Giocatore vuoto */
export const mkGiocatore = (genere = 'M') => ({
  nome:        '',
  cognome:     '',
  dataNascita: '',
  codiceFiscale: '',
  telefono:    '',
  genere,
  categoria:   '',
  // Consensi maggiorenne
  accettaRegolamento:    false,
  accettaCertMedico:     false,
  consensoMedia:         false,
  // Dati tutore (minorenni)
  tutoreNome:      '',
  tutoreCognome:   '',
  tutoreCF:        '',
  tutoreEmail:     '',
  tutoreFileName:  '',
  tutoreFileObj:   null,
  tutoreFileErr:   '',
  accettaTutore:   false,
  // Documento identità
  fileName:  '',
  fileObj:   null,
  fileErr:   '',
  // Flag facoltativo (4° giocatore)
  facoltativo: false,
})

export const initForm = () => ({
  nomeSquadra:  '',
  referente:    '',
  telefono:     '',
  email:        '',
  tipo:         'tesserata',
  giocatori:    [
    mkGiocatore('M'),
    mkGiocatore('M'),
    mkGiocatore('F'),
    { ...mkGiocatore('M'), facoltativo: true },
  ],
})
