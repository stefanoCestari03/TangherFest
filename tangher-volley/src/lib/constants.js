export const MAX_TESSERATI = 12
export const MAX_LIBERE    = 12

export const CATEGORIE = [
  { value: '',         label: 'Seleziona categoria...' },
  { value: 'under16',  label: 'Under 16 (min U16)' },
  { value: 'under18',  label: 'Under 18' },
  { value: 'amatore',  label: 'Amatore / Libero' },
  { value: 'prima',    label: 'Prima Divisione' },
  { value: 'serieD',   label: 'Serie D' },
  { value: 'serieC',   label: 'Serie C' },
  { value: 'serieB',   label: 'Serie B' },
  { value: 'serieA',   label: 'Serie A' },
]

export const CAT_LABEL = Object.fromEntries(
  CATEGORIE.slice(1).map(c => [c.value, c.label])
)

export const FORMATI_OK   = ['image/jpeg', 'image/png', 'application/pdf']
export const MAX_FILE_MB  = 5
