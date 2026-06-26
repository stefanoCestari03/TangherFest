import { supabase } from './supabase'

// Campi sicuri per la visualizzazione pubblica — niente IP, user-agent, path ricevute
const PUBLIC_COLS = 'id, nomeSquadra, tipo, referente, creato_il, giocatori'

// Campi minimi per la validazione duplicati (nome squadra, email, CF giocatori)
const VALIDATION_COLS = 'nomeSquadra, email, giocatori'

export async function fetchSquadre() {
  const { data, error } = await supabase
    .from('squadre')
    .select(PUBLIC_COLS)
    .order('creato_il', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchSquadreValidation() {
  const { data, error } = await supabase
    .from('squadre')
    .select(VALIDATION_COLS)
  if (error) throw error
  return data ?? []
}

export async function insertSquadra(squadra) {
  const { data, error } = await supabase
    .from('squadre')
    .insert([squadra])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function uploadDoc(file, path) {
  const { error } = await supabase.storage
    .from('volley-docs')
    .upload(path, file)
  if (error) throw error
  return path
}

export function subscribeSquadre(onInsert) {
  const channel = supabase
    .channel('public:squadre')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'squadre' },
      payload => onInsert(payload.new)
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}
