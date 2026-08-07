import { supabase } from './supabase'

// ── Round-robin pairs (0-indexed) per dimensione gruppo ──────────────────────
// Per n dispari: ogni round ha (n-1)/2 partite, 1 squadra riposa
const RR = {
  2: [[0,1]],
  3: [[0,1],[1,2],[0,2]],
  4: [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]],
  5: [[0,1],[2,3],[0,2],[1,4],[0,3],[2,4],[0,4],[1,3],[1,2],[3,4]],
  6: [[0,5],[1,4],[2,3],[1,5],[0,2],[3,4],[2,5],[1,3],[0,4],[3,5],[2,4],[0,1],[4,5],[0,3],[1,2]],
  7: [                   // 7 round × 3 partite = 21 partite totali
    [0,1],[2,6],[3,5],   // round 1 (riposa 4)
    [0,2],[1,3],[4,6],   // round 2 (riposa 5)
    [0,3],[1,4],[2,5],   // round 3 (riposa 6)
    [0,4],[2,3],[5,6],   // round 4 (riposa 1)
    [0,5],[1,6],[3,4],   // round 5 (riposa 2)
    [0,6],[2,4],[1,5],   // round 6 (riposa 3)
    [1,2],[3,6],[4,5],   // round 7 (riposa 0)
  ],
}

function addTime(baseMins, offsetMins) {
  const t = baseMins + offsetMins
  return `${String(Math.floor(t / 60)).padStart(2,'0')}:${String(t % 60).padStart(2,'0')}`
}

// Slot → orario con pausa pranzo 13:00-14:00
// Slot  1-12 → 09:00, 09:20, ..., 12:40  (mattina)
// Slot 13+   → 14:00, 14:20, ...          (pomeriggio, dopo pausa)
function slotToTime(slot) {
  if (slot <= 12) return addTime(9 * 60, (slot - 1) * 20)
  return addTime(14 * 60, (slot - 13) * 20)
}

// Minuto di fine dell'ultimo slot → orario partenza knockout
function knockoutStart(lastSlot) {
  const startMin = lastSlot <= 12
    ? 9 * 60 + (lastSlot - 1) * 20
    : 14 * 60 + (lastSlot - 13) * 20
  const endMin = startMin + 20
  return Math.max(endMin, 14 * 60)  // minimo 14:00 (dopo pausa)
}

// ── Genera il calendario completo ─────────────────────────────────────────────
export function buildSchedule(proTeams, amatoriTeams) {
  const partite = []

  // Con 14 squadre → 2 gironi da 7; con meno → 2 gironi o 1
  function nGroups(n) {
    if (n >= 4) return 2
    return 1
  }

  function assignGroups(teams, labels) {
    const groups = labels.map(l => ({ label: l, teams: [] }))
    teams.forEach((t, i) => groups[i % groups.length].teams.push(t))
    return groups
  }

  // Ogni gruppo su campo dedicato (non interleaved) con gestione pausa
  function addGironeMatches(groups, campoBase, categoria) {
    groups.forEach((g, fi) => {
      const campo = campoBase + fi
      const pairs = RR[g.teams.length] ?? RR[7]
      pairs.forEach(([i, j], mIdx) => {
        if (g.teams[i] && g.teams[j]) {
          const slot = mIdx + 1
          partite.push({
            categoria, fase: 'girone', girone: g.label, campo,
            slot,
            ora_prevista: slotToTime(slot),
            squadra1_id:   g.teams[i].id,
            squadra2_id:   g.teams[j].id,
            squadra1_nome: g.teams[i].nomeSquadra,
            squadra2_nome: g.teams[j].nomeSquadra,
            completata: false,
          })
        }
      })
    })
  }

  // Spareggi (calcola orario partenza dal numero di partite di girone)
  function addKnockout(groups, campoBase, categoria) {
    const n = groups.length
    const groupSize = groups[0]?.teams.length ?? 4
    const nGroupMatches = groupSize * (groupSize - 1) / 2
    const KS = knockoutStart(nGroupMatches)  // minuti da mezzanotte

    if (n === 1) {
      // Solo finale tra i top-2 del girone unico
      partite.push({ categoria, fase: 'finale',     campo: campoBase,   slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${groups[0].label}`, squadra2_nome: `2° ${groups[0].label}`, completata: false })
    } else if (n === 2) {
      const [A, B] = groups

      if (groupSize >= 5) {
        // Top 4 da ogni girone → 8 squadre → Quarti + SF + Finale
        // Seeding incrociato: 1°A vs 4°B, 1°B vs 4°A, 2°A vs 3°B, 2°B vs 3°A
        partite.push({ categoria, fase: 'quarti',     campo: campoBase,   slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${A.label}`, squadra2_nome: `4° ${B.label}`, completata: false })
        partite.push({ categoria, fase: 'quarti',     campo: campoBase+1, slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${B.label}`, squadra2_nome: `4° ${A.label}`, completata: false })
        partite.push({ categoria, fase: 'quarti',     campo: campoBase,   slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: `2° ${A.label}`, squadra2_nome: `3° ${B.label}`, completata: false })
        partite.push({ categoria, fase: 'quarti',     campo: campoBase+1, slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: `2° ${B.label}`, squadra2_nome: `3° ${A.label}`, completata: false })
        partite.push({ categoria, fase: 'semifinale', campo: campoBase,   slot: 102, ora_prevista: addTime(KS, 40), squadra1_nome: 'Vin. QF1', squadra2_nome: 'Vin. QF2', completata: false })
        partite.push({ categoria, fase: 'semifinale', campo: campoBase+1, slot: 102, ora_prevista: addTime(KS, 40), squadra1_nome: 'Vin. QF3', squadra2_nome: 'Vin. QF4', completata: false })
        partite.push({ categoria, fase: 'finale',     campo: campoBase,   slot: 103, ora_prevista: addTime(KS, 60), squadra1_nome: 'Vin. SF1', squadra2_nome: 'Vin. SF2', completata: false })
        partite.push({ categoria, fase: 'terzo_posto',campo: campoBase+1, slot: 103, ora_prevista: addTime(KS, 60), squadra1_nome: 'Perd. SF1', squadra2_nome: 'Perd. SF2', completata: false })
      } else {
        // Gironi piccoli (≤4 sq): top-2 → SF → Finale
        partite.push({ categoria, fase: 'semifinale', campo: campoBase,   slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${A.label}`, squadra2_nome: `2° ${B.label}`, completata: false })
        partite.push({ categoria, fase: 'semifinale', campo: campoBase+1, slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${B.label}`, squadra2_nome: `2° ${A.label}`, completata: false })
        partite.push({ categoria, fase: 'finale',     campo: campoBase,   slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: 'Vin. SF1', squadra2_nome: 'Vin. SF2', completata: false })
        partite.push({ categoria, fase: 'terzo_posto',campo: campoBase+1, slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: 'Perd. SF1', squadra2_nome: 'Perd. SF2', completata: false })
      }
    }
  }

  // Pro (campi 1–2): gironi A e B
  const nProG    = nGroups(proTeams.length)
  const proGroups = assignGroups(proTeams, ['A','B'].slice(0, nProG))
  addGironeMatches(proGroups, 1, 'pro')
  addKnockout(proGroups, 1, 'pro')

  // Amatori (campi 3–4): gironi E e F
  const nAmatG    = nGroups(amatoriTeams.length)
  const amatGroups = assignGroups(amatoriTeams, ['E','F'].slice(0, nAmatG))
  addGironeMatches(amatGroups, 3, 'amatori')
  addKnockout(amatGroups, 3, 'amatori')

  return partite
}

// ── Classifica per un girone ──────────────────────────────────────────────────
export function computeStandings(matches) {
  const map = {}

  matches.forEach(m => {
    [[m.squadra1_id, m.squadra1_nome],[m.squadra2_id, m.squadra2_nome]].forEach(([id, nome]) => {
      const key = id ?? nome
      if (key && !map[key]) map[key] = { id, nome: nome ?? '?', g: 0, v: 0, s: 0, pf: 0, pc: 0, pts: 0 }
    })
  })

  matches.filter(m => m.completata && m.punteggio1 != null && m.punteggio2 != null).forEach(m => {
    const k1 = m.squadra1_id ?? m.squadra1_nome
    const k2 = m.squadra2_id ?? m.squadra2_nome
    const a = map[k1], b = map[k2]
    if (!a || !b) return
    a.g++; b.g++
    a.pf += m.punteggio1; a.pc += m.punteggio2
    b.pf += m.punteggio2; b.pc += m.punteggio1
    if (m.punteggio1 > m.punteggio2) { a.v++; a.pts += 2; b.s++ }
    else                              { b.v++; b.pts += 2; a.s++ }
  })

  return Object.values(map).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    const dA = a.pf - a.pc, dB = b.pf - b.pc
    if (dB !== dA) return dB - dA
    return b.pf - a.pf
  })
}

// ── DB helpers ────────────────────────────────────────────────────────────────
export async function fetchPartite() {
  const { data, error } = await supabase
    .from('partite')
    .select('*')
    .order('campo')
    .order('slot')
  if (error) throw error
  return data ?? []
}

export async function insertPartite(rows) {
  const { error } = await supabase.from('partite').insert(rows)
  if (error) throw error
}

export async function updatePunteggio(id, p1, p2) {
  const { error } = await supabase
    .from('partite')
    .update({ punteggio1: p1, punteggio2: p2, completata: true, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updatePartitaNomi(id, nome1, nome2, id1, id2) {
  const { error } = await supabase
    .from('partite')
    .update({ squadra1_nome: nome1, squadra2_nome: nome2, squadra1_id: id1 ?? null, squadra2_id: id2 ?? null })
    .eq('id', id)
  if (error) throw error
}

export async function deleteAllPartite() {
  const { error } = await supabase.from('partite').delete().gte('slot', 0)
  if (error) throw error
}

export async function swapTeamsInSchedule(allPartite, cat, teamA, gironeA, teamB, gironeB) {
  const campoA = allPartite.find(p => p.categoria === cat && p.girone === gironeA)?.campo
  const campoB = allPartite.find(p => p.categoria === cat && p.girone === gironeB)?.campo
  if (!campoA || !campoB) throw new Error('Campi non trovati per i gironi selezionati')

  const updates = []

  allPartite
    .filter(p => p.categoria === cat && p.fase === 'girone' && p.girone === gironeA &&
      (p.squadra1_id === teamA.id || p.squadra2_id === teamA.id))
    .forEach(m => {
      const u = { girone: gironeB, campo: campoB }
      if (m.squadra1_id === teamA.id) { u.squadra1_id = teamB.id; u.squadra1_nome = teamB.nomeSquadra }
      else                            { u.squadra2_id = teamB.id; u.squadra2_nome = teamB.nomeSquadra }
      updates.push({ id: m.id, ...u })
    })

  allPartite
    .filter(p => p.categoria === cat && p.fase === 'girone' && p.girone === gironeB &&
      (p.squadra1_id === teamB.id || p.squadra2_id === teamB.id))
    .forEach(m => {
      const u = { girone: gironeA, campo: campoA }
      if (m.squadra1_id === teamB.id) { u.squadra1_id = teamA.id; u.squadra1_nome = teamA.nomeSquadra }
      else                            { u.squadra2_id = teamA.id; u.squadra2_nome = teamA.nomeSquadra }
      updates.push({ id: m.id, ...u })
    })

  if (updates.length === 0) throw new Error('Nessuna partita trovata per queste squadre')
  await Promise.all(updates.map(({ id, ...data }) => supabase.from('partite').update(data).eq('id', id)))
}

export function subscribePartite(onAny) {
  const ch = supabase
    .channel('public:partite')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'partite' }, onAny)
    .subscribe()
  return () => supabase.removeChannel(ch)
}
