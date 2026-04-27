import { supabase } from './supabase'

const LOCAL_KEY = 'tf26_squadre'

const localGet  = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') } catch { return [] } }
const localSave = d  => localStorage.setItem(LOCAL_KEY, JSON.stringify(d))

export async function fetchSquadre() {
  // ── SUPABASE (decommentare quando pronto) ──────────────────
  // const { data, error } = await supabase
  //   .from('squadre')
  //   .select('*')
  //   .order('creato_il', { ascending: true })
  // if (error) throw error
  // return data
  return localGet()
}

export async function insertSquadra(squadra) {
  // ── SUPABASE ───────────────────────────────────────────────
  // const { data, error } = await supabase
  //   .from('squadre')
  //   .insert([squadra])
  //   .select()
  //   .single()
  // if (error) throw error
  // return data
  const all = localGet()
  all.push(squadra)
  localSave(all)
  return squadra
}

export async function uploadDoc(file, path) {
  // ── SUPABASE STORAGE ───────────────────────────────────────
  // const { error } = await supabase.storage
  //   .from('volley-docs')
  //   .upload(path, file)
  // if (error) throw error
  // return path
  return path  // fallback locale
}
