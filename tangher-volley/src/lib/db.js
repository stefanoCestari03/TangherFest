import { supabase } from './supabase'

export async function fetchSquadre() {
  const { data, error } = await supabase
    .from('squadre')
    .select('*')
    .order('creato_il', { ascending: true })
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
