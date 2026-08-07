import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  fetchPartite, insertPartite, updatePunteggio, updatePartitaNomi,
  deleteAllPartite, subscribePartite, buildSchedule, computeStandings,
} from '../lib/torneo'
import styles from './TorneoPage.module.css'

const FASE_LABEL = {
  quarti:      'Quarti di finale',
  semifinale:  'Semifinale',
  finale:      'Finale',
  terzo_posto: '3° Posto',
}

// ── Componente principale ─────────────────────────────────────────────────────
export default function TorneoPage({ squadre }) {
  const [categoria, setCategoria] = useState('pro')
  const [partite,   setPartite]   = useState([])
  const [session,   setSession]   = useState(null)

  // Admin login
  const [showLogin,  setShowLogin]  = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPwd,   setAdminPwd]   = useState('')

  // Score modal
  const [editMatch, setEditMatch] = useState(null)
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')

  const [loading,    setLoading]    = useState(false)
  const [generating, setGenerating] = useState(false)
  const [err,        setErr]        = useState(null)

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPartite().then(setPartite).catch(console.error)

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))

    const unsub = subscribePartite(() =>
      fetchPartite().then(setPartite).catch(console.error)
    )

    return () => { subscription.unsubscribe(); unsub() }
  }, [])

  // ── Derived data ─────────────────────────────────────────────────────────────
  const getGroups = useCallback((cat) => {
    const map = {}
    partite.filter(p => p.categoria === cat && p.fase === 'girone').forEach(p => {
      if (!map[p.girone]) map[p.girone] = { label: p.girone, matches: [] }
      map[p.girone].matches.push(p)
    })
    return Object.values(map).sort((a, b) => a.label.localeCompare(b.label))
  }, [partite])

  const getKnockout = useCallback((cat) =>
    partite
      .filter(p => p.categoria === cat && p.fase !== 'girone')
      .sort((a, b) => a.slot - b.slot || a.campo - b.campo)
  , [partite])

  const proGroups    = useMemo(() => getGroups('pro'),     [getGroups])
  const amatGroups   = useMemo(() => getGroups('amatori'), [getGroups])
  const proKnockout  = useMemo(() => getKnockout('pro'),   [getKnockout])
  const amatKnockout = useMemo(() => getKnockout('amatori'), [getKnockout])

  const currentGroups   = categoria === 'pro' ? proGroups   : amatGroups
  const currentKnockout = categoria === 'pro' ? proKnockout : amatKnockout
  const hasSchedule     = partite.length > 0
  const isAdmin         = !!session

  // ── Admin login / logout ─────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setErr(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPwd })
      if (error) throw error
      setShowLogin(false)
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  async function handleLogout() { await supabase.auth.signOut() }

  // ── Genera calendario ────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!window.confirm(
      hasSchedule
        ? 'Rigenera il calendario? I risultati già inseriti andranno persi.'
        : 'Genera il calendario dalle squadre iscritte?'
    )) return

    setGenerating(true); setErr(null)
    try {
      const pro  = squadre.filter(s => s.tipo === 'tesserata')
      const amat = squadre.filter(s => s.tipo === 'libera')
      if (pro.length < 2 && amat.length < 2)
        throw new Error(`Nessuna squadra iscritta trovata (Pro: ${pro.length}, Amatori: ${amat.length})`)
      await deleteAllPartite()
      const schedule = buildSchedule(pro, amat)
      if (schedule.length === 0) throw new Error('Il generatore non ha prodotto partite — controlla le squadre iscritte')
      await insertPartite(schedule)
      setPartite(await fetchPartite())
    } catch (e) {
      window.alert('Errore generazione calendario:\n\n' + e.message)
      setErr(e.message)
    }
    finally { setGenerating(false) }
  }

  // ── Elimina calendario ───────────────────────────────────────────────────────
  async function handleDelete() {
    if (!window.confirm('Eliminare tutto il calendario? Tutti i risultati andranno persi.')) return
    try {
      await deleteAllPartite()
      setPartite([])
    } catch (e) { setErr(e.message) }
  }

  // ── Propaga risultati nel tabellone (usa dati freschi dal DB) ────────────────
  function buildBracketUpdates(cat, allPartite) {
    const map = {}
    allPartite.filter(p => p.categoria === cat && p.fase === 'girone').forEach(p => {
      if (!map[p.girone]) map[p.girone] = { label: p.girone, matches: [] }
      map[p.girone].matches.push(p)
    })
    const groups = Object.values(map).sort((a, b) => a.label.localeCompare(b.label))
    if (groups.length === 0) return []

    const ko = allPartite.filter(p => p.categoria === cat && p.fase !== 'girone')
    const updates = []

    const teamWinner = m => m?.completata
      ? (m.punteggio1 > m.punteggio2 ? { nome: m.squadra1_nome, id: m.squadra1_id } : { nome: m.squadra2_nome, id: m.squadra2_id })
      : null
    const teamLoser  = m => m?.completata
      ? (m.punteggio1 < m.punteggio2 ? { nome: m.squadra1_nome, id: m.squadra1_id } : { nome: m.squadra2_nome, id: m.squadra2_id })
      : null

    if (groups.length === 2) {
      const [gA, gB] = groups
      const A = computeStandings(gA.matches)
      const B = computeStandings(gB.matches)
      const groupSize = gA.matches.length > 0
        ? Math.round((1 + Math.sqrt(1 + 8 * gA.matches.length)) / 2)
        : 4

      if (groupSize >= 5) {
        // QF: top-4 da ogni girone con seeding incrociato
        const qf = ko.filter(m => m.fase === 'quarti').sort((a, b) => a.slot - b.slot || a.campo - b.campo)
        if (qf[0]) updates.push([qf[0].id, A[0]?.nome ?? `1° ${gA.label}`, B[3]?.nome ?? `4° ${gB.label}`, A[0]?.id ?? null, B[3]?.id ?? null])
        if (qf[1]) updates.push([qf[1].id, B[0]?.nome ?? `1° ${gB.label}`, A[3]?.nome ?? `4° ${gA.label}`, B[0]?.id ?? null, A[3]?.id ?? null])
        if (qf[2]) updates.push([qf[2].id, A[1]?.nome ?? `2° ${gA.label}`, B[2]?.nome ?? `3° ${gB.label}`, A[1]?.id ?? null, B[2]?.id ?? null])
        if (qf[3]) updates.push([qf[3].id, B[1]?.nome ?? `2° ${gB.label}`, A[2]?.nome ?? `3° ${gA.label}`, B[1]?.id ?? null, A[2]?.id ?? null])

        // SF: vincitori dei QF
        const sf = ko.filter(m => m.fase === 'semifinale').sort((a, b) => a.slot - b.slot || a.campo - b.campo)
        const w = qf.map(teamWinner)
        if (sf[0]) updates.push([sf[0].id, w[0]?.nome ?? 'Vin. QF1', w[1]?.nome ?? 'Vin. QF2', w[0]?.id ?? null, w[1]?.id ?? null])
        if (sf[1]) updates.push([sf[1].id, w[2]?.nome ?? 'Vin. QF3', w[3]?.nome ?? 'Vin. QF4', w[2]?.id ?? null, w[3]?.id ?? null])

        // Finale e 3° posto: vincitori/perdenti delle SF
        const fin = ko.find(m => m.fase === 'finale')
        const ter = ko.find(m => m.fase === 'terzo_posto')
        const ws = sf.map(teamWinner), ls = sf.map(teamLoser)
        if (fin) updates.push([fin.id, ws[0]?.nome ?? 'Vin. SF1', ws[1]?.nome ?? 'Vin. SF2', ws[0]?.id ?? null, ws[1]?.id ?? null])
        if (ter) updates.push([ter.id, ls[0]?.nome ?? 'Perd. SF1', ls[1]?.nome ?? 'Perd. SF2', ls[0]?.id ?? null, ls[1]?.id ?? null])

      } else {
        // SF dirette: top-2 da ogni girone
        const sf = ko.filter(m => m.fase === 'semifinale').sort((a, b) => a.slot - b.slot || a.campo - b.campo)
        if (sf[0]) updates.push([sf[0].id, A[0]?.nome ?? `1° ${gA.label}`, B[1]?.nome ?? `2° ${gB.label}`, A[0]?.id ?? null, B[1]?.id ?? null])
        if (sf[1]) updates.push([sf[1].id, B[0]?.nome ?? `1° ${gB.label}`, A[1]?.nome ?? `2° ${gA.label}`, B[0]?.id ?? null, A[1]?.id ?? null])

        const fin = ko.find(m => m.fase === 'finale')
        const ter = ko.find(m => m.fase === 'terzo_posto')
        const ws = sf.map(teamWinner), ls = sf.map(teamLoser)
        if (fin) updates.push([fin.id, ws[0]?.nome ?? 'Vin. SF1', ws[1]?.nome ?? 'Vin. SF2', ws[0]?.id ?? null, ws[1]?.id ?? null])
        if (ter) updates.push([ter.id, ls[0]?.nome ?? 'Perd. SF1', ls[1]?.nome ?? 'Perd. SF2', ls[0]?.id ?? null, ls[1]?.id ?? null])
      }
    }
    return updates
  }

  // ── Aggiorna spareggi — usa dati freschi, propaga tutta la eliminazione ──────
  async function handleAutoFill() {
    try {
      const fresh = await fetchPartite()
      const updates = [
        ...buildBracketUpdates('pro',      fresh),
        ...buildBracketUpdates('amatori',  fresh),
      ]
      if (updates.length > 0)
        await Promise.all(updates.map(([id, n1, n2, i1, i2]) => updatePartitaNomi(id, n1, n2, i1, i2)))
      setPartite(await fetchPartite())
    } catch (e) { setErr(e.message) }
  }

  // ── Salva punteggio e aggiorna automaticamente il tabellone ─────────────────
  async function handleSave() {
    const n1 = parseInt(p1, 10), n2 = parseInt(p2, 10)
    if (isNaN(n1) || isNaN(n2) || n1 < 0 || n2 < 0) { setErr('Inserisci punteggi validi'); return }
    if (n1 === n2) { setErr('Non ci sono pareggi nel volley'); return }
    setLoading(true); setErr(null)
    try {
      await updatePunteggio(editMatch.id, n1, n2)
      setEditMatch(null)
      // Propaga automaticamente vincitori nel bracket (QF→SF→Finale)
      const fresh = await fetchPartite()
      const updates = [
        ...buildBracketUpdates('pro',     fresh),
        ...buildBracketUpdates('amatori', fresh),
      ]
      if (updates.length > 0)
        await Promise.all(updates.map(([id, n1, n2, i1, i2]) => updatePartitaNomi(id, n1, n2, i1, i2)))
      setPartite(await fetchPartite())
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  function openEdit(m) {
    setEditMatch(m)
    setP1(m.punteggio1 ?? '')
    setP2(m.punteggio2 ?? '')
    setErr(null)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={styles.wrap}>

      {/* Header */}
      <div className={styles.slabel}>8 Agosto 2026</div>
      <h2 className={styles.h2}>Tabellone <span>Live</span></h2>
      <p className={styles.lead}>
        Risultati e classifiche in tempo reale — si aggiornano automaticamente durante il torneo.
      </p>

      {/* Admin bar */}
      <div className={styles.adminBar}>
        {isAdmin ? (
          <div className={styles.adminRow}>
            <span className={styles.adminBadge}>⚙ Admin</span>
            <span className={styles.adminEmail}>{session.user.email}</span>
            <button className={styles.btnSm} onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generando…' : hasSchedule ? '↺ Rigenera' : '⚡ Genera calendario'}
            </button>
            {hasSchedule && (
              <button className={styles.btnSm} onClick={handleAutoFill}>
                🔀 Aggiorna spareggi
              </button>
            )}
            {hasSchedule && (
              <button className={styles.btnSmDanger} onClick={handleDelete}>
                🗑 Elimina calendario
              </button>
            )}
            <button className={styles.btnSmGhost} onClick={handleLogout}>Esci</button>
          </div>
        ) : (
          <button className={styles.adminLoginTrigger} onClick={() => setShowLogin(v => !v)}>
            🔒 Area Admin
          </button>
        )}
        {isAdmin && err && !editMatch && (
          <div className={styles.adminErr}>⚠ {err}</div>
        )}
      </div>

      {/* Login form */}
      {showLogin && !isAdmin && (
        <form className={styles.loginForm} onSubmit={handleLogin}>
          <div className={styles.loginTitle}>Accesso riservato</div>
          <input className={styles.loginInput} type="email" placeholder="Email admin" value={adminEmail}
            onChange={e => setAdminEmail(e.target.value)} required autoComplete="username" />
          <input className={styles.loginInput} type="password" placeholder="Password" value={adminPwd}
            onChange={e => setAdminPwd(e.target.value)} required autoComplete="current-password" />
          {err && <div className={styles.formErr}>{err}</div>}
          <button className={styles.loginBtn} type="submit" disabled={loading}>
            {loading ? 'Accedo…' : 'Accedi'}
          </button>
        </form>
      )}

      {/* Nessun calendario ancora */}
      {!hasSchedule && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏐</div>
          <div className={styles.emptyTitle}>Calendario in preparazione</div>
          <p className={styles.emptyText}>
            Il tabellone sarà generato alla chiusura delle iscrizioni (31 luglio).<br />
            Torna qui l&apos;8 agosto per seguire le partite in diretta.
          </p>
        </div>
      )}

      {/* Calendario presente */}
      {hasSchedule && (
        <>
          {/* Info formato torneo */}
          <TorneoInfo proGroups={proGroups} amatGroups={amatGroups} />

          {/* Toggle categoria */}
          <div className={styles.catTabs}>
            <button className={`${styles.catTab} ${categoria === 'pro' ? styles.catAct : ''}`}
              onClick={() => setCategoria('pro')}>Pro</button>
            <button className={`${styles.catTab} ${categoria === 'amatori' ? styles.catAct : ''}`}
              onClick={() => setCategoria('amatori')}>Amatori</button>
          </div>

          {/* Gironi */}
          {currentGroups.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionMeta}>Mattina · 09:00 – 13:00</div>
              <h3 className={styles.sectionTitle}>Gironi</h3>
              <div className={styles.groupGrid}>
                {currentGroups.map(group => (
                  <GroupCard
                    key={group.label}
                    group={group}
                    isAdmin={isAdmin}
                    onEdit={openEdit}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Spareggi */}
          {currentKnockout.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionMeta}>Pomeriggio · 14:00+</div>
              <h3 className={styles.sectionTitle}>Fase Eliminazione</h3>
              <KnockoutBracket matches={currentKnockout} isAdmin={isAdmin} onEdit={openEdit} />
            </section>
          )}

          {/* Leggenda campi */}
          <div className={styles.campiLegend}>
            <span className={styles.legendTitle}>Campi:</span>
            {categoria === 'pro'
              ? <>Campo 1 · Campo 2 — Pro</>
              : <>Campo 3 · Campo 4 — Amatori</>
            }
          </div>
        </>
      )}

      {/* Modal inserimento punteggio */}
      {editMatch && (
        <div className={styles.overlay} onClick={() => setEditMatch(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>Inserisci Risultato</div>
            <div className={styles.modalSub}>
              {FASE_LABEL[editMatch.fase] ?? 'Girone ' + editMatch.girone}
              {editMatch.ora_prevista && <> · {editMatch.ora_prevista}</>}
              {' · Campo ' + editMatch.campo}
            </div>

            <div className={styles.scoreRow}>
              <div className={styles.scoreCol}>
                <div className={styles.scoreTeam}>{editMatch.squadra1_nome}</div>
                <input className={styles.scoreInput} type="number" min="0" max="99"
                  value={p1} onChange={e => setP1(e.target.value)} autoFocus />
              </div>
              <div className={styles.scoreDash}>–</div>
              <div className={styles.scoreCol}>
                <div className={styles.scoreTeam}>{editMatch.squadra2_nome}</div>
                <input className={styles.scoreInput} type="number" min="0" max="99"
                  value={p2} onChange={e => setP2(e.target.value)} />
              </div>
            </div>

            {err && <div className={styles.modalErr}>{err}</div>}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setEditMatch(null)}>Annulla</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                {loading ? 'Salvo…' : 'Salva risultato'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── TorneoInfo ───────────────────────────────────────────────────────────────
function TorneoInfo({ proGroups, amatGroups }) {
  const nProG   = proGroups.length
  const nAmatG  = amatGroups.length
  const proSize = proGroups[0]?.matches
    ? Math.round((1 + Math.sqrt(1 + 8 * proGroups[0].matches.length)) / 2)
    : 7

  const bigGroups = proSize >= 5  // gironi da 7 → quarti

  return (
    <div className={styles.infoBox}>
      <div className={styles.infoBoxTitle}>Come funziona il torneo</div>
      <div className={styles.infoBoxGrid}>

        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>🕘</div>
          <div>
            <div className={styles.infoLabel}>Gironi · 09:00 – 17:00</div>
            <div className={styles.infoVal}>Mattina 09:00–13:00 + pausa + pomeriggio 14:00–17:00 · set unico a 21</div>
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>🏐</div>
          <div>
            <div className={styles.infoLabel}>Pro — {nProG} {nProG === 1 ? 'girone' : 'gironi'} · Campi 1–2</div>
            <div className={styles.infoVal}>Ogni squadra gioca {proSize >= 5 ? proSize - 1 : 'tutte le'} partite nel proprio girone</div>
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>🏐</div>
          <div>
            <div className={styles.infoLabel}>Amatori — {nAmatG} {nAmatG === 1 ? 'girone' : 'gironi'} · Campi 3–4</div>
            <div className={styles.infoVal}>Ogni squadra gioca {proSize >= 5 ? proSize - 1 : 'tutte le'} partite nel proprio girone</div>
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>🏆</div>
          <div>
            <div className={styles.infoLabel}>Qualificazione</div>
            <div className={styles.infoVal}>
              {bigGroups
                ? 'Le prime 4 di ogni girone (8 squadre) → Quarti → Semifinali → Finale'
                : 'Le prime 2 di ogni girone (4 squadre) → Semifinali → Finale'
              }
            </div>
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>☀️</div>
          <div>
            <div className={styles.infoLabel}>Eliminazione diretta · ~17:00</div>
            <div className={styles.infoVal}>
              {bigGroups
                ? 'QF ~17:00 → SF ~17:40 → Finale ~18:00 · spareggio 3° posto incluso'
                : 'Semifinali → Finale · spareggio 3° posto incluso'
              }
            </div>
          </div>
        </div>

        <div className={styles.infoItem}>
          <div className={styles.infoIcon}>📊</div>
          <div>
            <div className={styles.infoLabel}>Spareggio a pari vittorie</div>
            <div className={styles.infoVal}>Differenza punti (fatti – subiti), poi punti totali segnati</div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── GroupCard ────────────────────────────────────────────────────────────────
function GroupCard({ group, isAdmin, onEdit }) {
  const standings = useMemo(() => computeStandings(group.matches), [group.matches])

  return (
    <div className={styles.groupCard}>
      <div className={styles.groupHeader}>Girone {group.label}</div>

      {/* Classifica */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th><th className={styles.tdTeam}>Squadra</th>
            <th title="Vittorie">V</th><th title="Sconfitte">S</th>
            <th title="Punti Fatti">PF</th><th title="Punti Concessi">PC</th>
            <th title="Differenza">Δ</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const diff = s.pf - s.pc
            return (
              <tr key={s.id ?? s.nome} className={i < 2 ? styles.trAdvance : ''}>
                <td className={styles.tdPos}>{i + 1}</td>
                <td className={styles.tdTeam}>{s.nome}</td>
                <td>{s.v}</td><td>{s.s}</td>
                <td>{s.pf}</td><td>{s.pc}</td>
                <td className={diff >= 0 ? styles.pos : styles.neg}>
                  {diff > 0 ? '+' : ''}{diff}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Partite */}
      <div className={styles.matchList}>
        {[...group.matches].sort((a, b) => a.slot - b.slot).map(m => (
          <MatchRow key={m.id} m={m} isAdmin={isAdmin} onEdit={onEdit} />
        ))}
      </div>
    </div>
  )
}

// ── KnockoutBracket ──────────────────────────────────────────────────────────
function KnockoutBracket({ matches, isAdmin, onEdit }) {
  const phases = ['quarti','semifinale','finale','terzo_posto']

  return (
    <div className={styles.bracket}>
      {phases.map(fase => {
        const ms = matches.filter(m => m.fase === fase)
        if (ms.length === 0) return null
        return (
          <div key={fase} className={styles.bracketRound}>
            <div className={styles.bracketRoundLabel}>{FASE_LABEL[fase]}</div>
            <div className={styles.bracketMatches}>
              {ms.map(m => (
                <div key={m.id} className={`${styles.bracketCard} ${m.completata ? styles.matchDone : ''}`}>
                  <div className={styles.bracketMeta}>{m.ora_prevista} · Campo {m.campo}</div>
                  <div className={`${styles.bracketTeam} ${m.completata && m.punteggio1 > m.punteggio2 ? styles.winner : ''}`}>
                    <span>{m.squadra1_nome ?? '—'}</span>
                    {m.completata && <span className={styles.bScore}>{m.punteggio1}</span>}
                  </div>
                  <div className={`${styles.bracketTeam} ${m.completata && m.punteggio2 > m.punteggio1 ? styles.winner : ''}`}>
                    <span>{m.squadra2_nome ?? '—'}</span>
                    {m.completata && <span className={styles.bScore}>{m.punteggio2}</span>}
                  </div>
                  {isAdmin && (
                    <button className={styles.editBtn} onClick={() => onEdit(m)}>✏</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── MatchRow ─────────────────────────────────────────────────────────────────
function MatchRow({ m, isAdmin, onEdit }) {
  return (
    <div className={`${styles.matchRow} ${m.completata ? styles.matchDone : ''}`}>
      <span className={styles.matchTime}>{m.ora_prevista}</span>
      <span className={styles.matchTeams}>
        <span className={m.completata && m.punteggio1 > m.punteggio2 ? styles.winner : ''}>
          {m.squadra1_nome}
        </span>
        {m.completata
          ? <span className={styles.matchScore}>{m.punteggio1} – {m.punteggio2}</span>
          : <span className={styles.matchVs}>vs</span>
        }
        <span className={m.completata && m.punteggio2 > m.punteggio1 ? styles.winner : ''}>
          {m.squadra2_nome}
        </span>
      </span>
      {isAdmin && (
        <button className={styles.editBtn} onClick={() => onEdit(m)}>✏</button>
      )}
    </div>
  )
}
