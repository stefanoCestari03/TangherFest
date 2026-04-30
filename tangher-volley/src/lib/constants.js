export const MAX_TESSERATI = 12
export const MAX_LIBERE    = 12

// Categorie per squadre TESSERATEM (giocatori federati)
export const CATEGORIE_TESSERATA = [
  { value: '',        label: 'Seleziona categoria...' },
  { value: 'under16', label: 'Under 16' },
  { value: 'under18', label: 'Under 18' },
  { value: 'amatore', label: 'Amatore / Libero' },
  { value: 'prima',   label: 'Prima Divisione' },
  { value: 'serieD',  label: 'Serie D' },
  { value: 'serieC',  label: 'Serie C' },
  { value: 'serieB',  label: 'Serie B' },
  { value: 'serieA',  label: 'Serie A' },
]

// Categorie per squadre LIBERE (nessun vincolo federale)
export const CATEGORIE_LIBERA = [
  { value: '',          label: 'Seleziona categoria...' },
  { value: 'mai',       label: 'Non ho mai giocato' },
  { value: 'una_volta', label: 'Giocavo una volta' },
  { value: 'amatore',   label: 'Amatore / Libero' },
  { value: 'under16',   label: 'Under 16' },
  { value: 'under18',   label: 'Under 18' },
]

// Backward compat (usato in InfoPage/RegolePage per mostrare la lista completa)
export const CATEGORIE = CATEGORIE_TESSERATA

// Mappa value → label per tutte le categorie (usata in SquadrePage)
export const CAT_LABEL = Object.fromEntries(
  [...CATEGORIE_TESSERATA, ...CATEGORIE_LIBERA]
    .filter(c => c.value)
    .map(c => [c.value, c.label])
)

export const FORMATI_OK  = ['image/jpeg', 'image/png', 'application/pdf']
export const MAX_FILE_MB = 5

export const VERSIONE_DOCUMENTO = '1.0'
