export const genId = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export const mkGiocatore = (genere = 'M') => ({
  nome:      '',
  cognome:   '',
  genere,
  categoria: '',
  fileName:  '',
  fileObj:   null,
  fileErr:   '',
})

export const initForm = () => ({
  nomeSquadra: '',
  referente:   '',
  telefono:    '',
  email:       '',
  tipo:        'tesserata',
  giocatori:   [mkGiocatore('M'), mkGiocatore('M'), mkGiocatore('F')],
})

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
