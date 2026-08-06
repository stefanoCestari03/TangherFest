import { supabase } from './supabase'

// ── Round-robin pairs (0-indexed) per dimensione gruppo ──────────────────────
const RR = {
  2: [[0,1]],
  3: [[0,1],[1,2],[0,2]],
  4: [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]],
}

function addTime(baseMins, offsetMins) {
  const t = baseMins + offsetMins
  return `${String(Math.floor(t / 60)).padStart(2,'0')}:${String(t % 60).padStart(2,'0')}`
}

// ── Genera il calendario completo (gironi + spareggi placeholder) ─────────────
export function buildSchedule(proTeams, amatoriTeams) {
  const partite = []

  function nGroups(n) {
    if (n >= 13) return 4
    if (n >= 9)  return 3
    if (n >= 5)  return 2
    return 1
  }

  // Distribuzione round-robin sui gironi
  function assignGroups(teams, labels) {
    const groups = labels.map(l => ({ label: l, teams: [] }))
    teams.forEach((t, i) => groups[i % groups.length].teams.push(t))
    return groups
  }

  // Costruisce le partite di girone, interleaving due gironi per campo
  function addGironeMatches(groups, campoBase, categoria) {
    for (let fi = 0; fi < Math.ceil(groups.length / 2); fi++) {
      const campo = campoBase + fi
      const gA = groups[fi * 2]
      const gB = groups[fi * 2 + 1]

      const pairsA = RR[gA.teams.length] ?? RR[4]
      pairsA.forEach(([i, j], mIdx) => {
        if (gA.teams[i] && gA.teams[j]) {
          partite.push({
            categoria, fase: 'girone', girone: gA.label, campo,
            slot: mIdx * 2 + 1,
            ora_prevista: addTime(9 * 60, mIdx * 40),        // 20 min a partita, 40 per coppia
            squadra1_id: gA.teams[i].id, squadra2_id: gA.teams[j].id,
            squadra1_nome: gA.teams[i].nomeSquadra, squadra2_nome: gA.teams[j].nomeSquadra,
            completata: false,
          })
        }
      })

      if (gB) {
        const pairsB = RR[gB.teams.length] ?? RR[4]
        pairsB.forEach(([i, j], mIdx) => {
          if (gB.teams[i] && gB.teams[j]) {
            partite.push({
              categoria, fase: 'girone', girone: gB.label, campo,
              slot: mIdx * 2 + 2,
              ora_prevista: addTime(9 * 60, mIdx * 40 + 20), // sfalsato di 20 min rispetto al girone A
              squadra1_id: gB.teams[i].id, squadra2_id: gB.teams[j].id,
              squadra1_nome: gB.teams[i].nomeSquadra, squadra2_nome: gB.teams[j].nomeSquadra,
              completata: false,
            })
          }
        })
      }
    }
  }

  // Placeholder spareggi pomeridiani (14:00+)
  function addKnockout(groups, campoBase, categoria) {
    const n = groups.length
    const KS = 14 * 60 // 14:00

    if (n === 1) {
      // Solo finale (top 2 del girone unico)
      partite.push({ categoria, fase: 'finale',     campo: campoBase,   slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${groups[0].label}`, squadra2_nome: `2° ${groups[0].label}`, completata: false })
    } else if (n === 2) {
      // 2 gironi → 4 squadre → SF + Finale  (14:00 e 14:20)
      partite.push({ categoria, fase: 'semifinale', campo: campoBase,   slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${groups[0].label}`, squadra2_nome: `2° ${groups[1].label}`, completata: false })
      partite.push({ categoria, fase: 'semifinale', campo: campoBase+1, slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${groups[1].label}`, squadra2_nome: `2° ${groups[0].label}`, completata: false })
      partite.push({ categoria, fase: 'finale',     campo: campoBase,   slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: 'Vin. SF1', squadra2_nome: 'Vin. SF2', completata: false })
      partite.push({ categoria, fase: 'terzo_posto',campo: campoBase+1, slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: 'Perd. SF1', squadra2_nome: 'Perd. SF2', completata: false })
    } else if (n === 3) {
      // 3 gironi → 4 squadre (3 vincitori + miglior 2°) → SF + Finale  (14:00 e 14:20)
      partite.push({ categoria, fase: 'semifinale', campo: campoBase,   slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${groups[0].label}`, squadra2_nome: `Miglior 2°`, completata: false })
      partite.push({ categoria, fase: 'semifinale', campo: campoBase+1, slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${groups[1].label}`, squadra2_nome: `1° ${groups[2].label}`, completata: false })
      partite.push({ categoria, fase: 'finale',     campo: campoBase,   slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: 'Vin. SF1', squadra2_nome: 'Vin. SF2', completata: false })
      partite.push({ categoria, fase: 'terzo_posto',campo: campoBase+1, slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: 'Perd. SF1', squadra2_nome: 'Perd. SF2', completata: false })
    } else {
      // 4 gironi → 8 squadre → QF + SF + Finale  (14:00 / 14:20 / 14:40 / 15:00)
      const [A, B, C, D] = groups
      partite.push({ categoria, fase: 'quarti',     campo: campoBase,   slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${A.label}`, squadra2_nome: `2° ${D.label}`, completata: false })
      partite.push({ categoria, fase: 'quarti',     campo: campoBase+1, slot: 100, ora_prevista: addTime(KS,  0), squadra1_nome: `1° ${B.label}`, squadra2_nome: `2° ${C.label}`, completata: false })
      partite.push({ categoria, fase: 'quarti',     campo: campoBase,   slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: `1° ${C.label}`, squadra2_nome: `2° ${B.label}`, completata: false })
      partite.push({ categoria, fase: 'quarti',     campo: campoBase+1, slot: 101, ora_prevista: addTime(KS, 20), squadra1_nome: `1° ${D.label}`, squadra2_nome: `2° ${A.label}`, completata: false })
      partite.push({ categoria, fase: 'semifinale', campo: campoBase,   slot: 102, ora_prevista: addTime(KS, 40), squadra1_nome: 'Vin. QF1', squadra2_nome: 'Vin. QF2', completata: false })
      partite.push({ categoria, fase: 'semifinale', campo: campoBase+1, slot: 102, ora_prevista: addTime(KS, 40), squadra1_nome: 'Vin. QF3', squadra2_nome: 'Vin. QF4', completata: false })
      partite.push({ categoria, fase: 'finale',     campo: campoBase,   slot: 103, ora_prevista: addTime(KS, 60), squadra1_nome: 'Vin. SF1', squadra2_nome: 'Vin. SF2', completata: false })
      partite.push({ categoria, fase: 'terzo_posto',campo: campoBase+1, slot: 103, ora_prevista: addTime(KS, 60), squadra1_nome: 'Perd. SF1', squadra2_nome: 'Perd. SF2', completata: false })
    }
  }

  // Pro (campi 1–2)
  const proLabels    = ['A','B','C','D'].slice(0, nGroups(proTeams.length))
  const proGroups    = assignGroups(proTeams,    proLabels)
  addGironeMatches(proGroups, 1, 'pro')
  addKnockout(proGroups, 1, 'pro')

  // Amatori (campi 3–4)
  const amatLabels   = ['E','F','G','H'].slice(0, nGroups(amatoriTeams.length))
  const amatGroups   = assignGroups(amatoriTeams, amatLabels)
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

export function subscribePartite(onAny) {
  const ch = supabase
    .channel('public:partite')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'partite' }, onAny)
    .subscribe()
  return () => supabase.removeChannel(ch)
}
