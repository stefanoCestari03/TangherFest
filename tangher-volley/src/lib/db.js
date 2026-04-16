/**
 * db.js — astrazione dati
 * Usa localStorage come fallback finché Supabase non è configurato.
 * Quando il progetto è pronto basta decommentare le chiamate Supabase
 * e cancellare il blocco localStorage.
 */
import { supabase } from './supabase'

const LOCAL_KEY = 'tf26_squadre'

/* ── helpers localStorage ─────────────────────────────────── */
const localGet  = () => { try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') } catch { return [] } }
const localSave = (data) => localStorage.setItem(LOCAL_KEY, JSON.stringify(data))

/* ── LEGGI TUTTE LE SQUADRE ───────────────────────────────── */
export async function fetchSquadre() {
  // ── SUPABASE (attivare quando il DB è pronto) ──────────────
  // const { data, error } = await supabase
  //   .from('squadre')
  //   .select('*')
  //   .order('creato_il', { ascending: true })
  // if (error) throw error
  // return data

  // ── FALLBACK localStorage ──────────────────────────────────
  return localGet()
}

/* ── INSERISCI UNA SQUADRA ────────────────────────────────── */
export async function insertSquadra(squadra) {
  // ── SUPABASE ───────────────────────────────────────────────
  // const { data, error } = await supabase
  //   .from('squadre')
  //   .insert([squadra])
  //   .select()
  //   .single()
  // if (error) throw error
  // return data

  // ── FALLBACK localStorage ──────────────────────────────────
  const all = localGet()
  all.push(squadra)
  localSave(all)
  return squadra
}

/* ── UPLOAD DOCUMENTO ─────────────────────────────────────── */
export async function uploadDoc(file, path) {
  // ── SUPABASE STORAGE ───────────────────────────────────────
  // const { error } = await supabase.storage
  //   .from('volley-docs')
  //   .upload(path, file)
  // if (error) throw error
  // return path

  // ── FALLBACK: simula ok ────────────────────────────────────
  return path
}
