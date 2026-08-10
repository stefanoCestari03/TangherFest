import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './PremiPage.module.css'

const PREMI = [
  { pos: 1, icon: '🥇', label: '1° Posto', premio: 'Cesto Grande' },
  { pos: 2, icon: '🥈', label: '2° Posto', premio: 'Cesto Medio' },
  { pos: 3, icon: '🥉', label: '3° Posto', premio: 'Cesto Piccolo' },
]

const CATEGORIE = [
  { id: 'pro',     label: 'Categoria Pro',     badge: 'Pro',     cls: 'T' },
  { id: 'amatori', label: 'Categoria Amatori', badge: 'Amatori', cls: 'L' },
]

export default function PremiPage() {
  const [finali,  setFinali]  = useState([])
  const [squadre, setSquadre] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [{ data: p }, { data: s }] = await Promise.all([
          supabase.from('partite').select('*').in('fase', ['finale', 'terzo_posto']),
          supabase.from('squadre').select('id, nomeSquadra, tipo, giocatori'),
        ])
        setFinali(p ?? [])
        setSquadre(s ?? [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  function getPodio(cat) {
    const fin = finali.find(m => m.categoria === cat && m.fase === 'finale' && m.completata)
    const ter = finali.find(m => m.categoria === cat && m.fase === 'terzo_posto' && m.completata)
    if (!fin) return null

    const winner = m => m.punteggio1 > m.punteggio2
      ? { nome: m.squadra1_nome, id: m.squadra1_id }
      : { nome: m.squadra2_nome, id: m.squadra2_id }
    const loser = m => m.punteggio1 < m.punteggio2
      ? { nome: m.squadra1_nome, id: m.squadra1_id }
      : { nome: m.squadra2_nome, id: m.squadra2_id }

    return [winner(fin), loser(fin), ter ? winner(ter) : null]
  }

  function getSquadra(teamId, teamNome) {
    if (teamId) return squadre.find(s => s.id === teamId)
    return squadre.find(s => s.nomeSquadra?.toLowerCase() === teamNome?.toLowerCase())
  }

  function getPlayers(sq) {
    if (!sq?.giocatori) return []
    return sq.giocatori
      .filter(g => !g.facoltativo)
      .map(g => [g.nome, g.cognome].filter(Boolean).join(' ') || g.nome || '—')
  }

  function getTutte(cat) {
    return squadre.filter(s => s.tipo === (cat === 'pro' ? 'tesserata' : 'libera'))
  }

  const hasPodio = CATEGORIE.some(c => getPodio(c.id))

  return (
    <div className={styles.wrap}>

      {/* ── Premi ─────────────────────────────────────────────────── */}
      <div className={styles.slabel}>Ricompense</div>
      <h2 className={styles.h2}>I <span>Premi</span></h2>
      <p className={styles.lead}>
        Chi arriva in vetta non torna a mani vuote.<br />
        Tre premi per ciascuna categoria — Pro e Amatori.
      </p>

      <div className={styles.categories}>
        {CATEGORIE.map(cat => (
          <div key={cat.id} className={styles.catBlock}>
            <div className={styles.catHeader}>
              <span className={`${styles.badge} ${styles[`badge${cat.cls}`]}`}>{cat.badge}</span>
              <span className={styles.catTitle}>{cat.label}</span>
            </div>
            <div className={styles.podio}>
              {PREMI.map(p => (
                <div key={p.pos} className={`${styles.podCard} ${styles[`pos${p.pos}`]}`}>
                  <span className={styles.podIcon}>{p.icon}</span>
                  <span className={styles.podLabel}>{p.label}</span>
                  <span className={styles.podPremio}>{p.premio}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Podio 2026 ────────────────────────────────────────────── */}
      <div className={styles.yearSep}>
        <span className={styles.yearLine} />
        <span className={styles.yearTag}>Torneo 2026</span>
        <span className={styles.yearLine} />
      </div>
      <h3 className={styles.h3}>Podio <span>Green Volley 3×3</span></h3>
      <p className={styles.subLead}>Sabato 8 Agosto 2026 · Segonzano</p>

      {loading ? (
        <div className={styles.loadingRow}>Caricamento risultati…</div>
      ) : !hasPodio ? (
        <div className={styles.noResults}>Risultati non ancora disponibili.</div>
      ) : (
        <div className={styles.podioSections}>
          {CATEGORIE.map(cat => {
            const podio = getPodio(cat.id)
            if (!podio) return null
            return (
              <div key={cat.id} className={styles.podioSection}>
                <div className={styles.podioCatHeader}>
                  <span className={`${styles.badge} ${styles[`badge${cat.cls}`]}`}>{cat.badge}</span>
                  <span className={styles.catTitle}>{cat.label}</span>
                </div>
                <div className={styles.podioGrid}>
                  {podio.map((team, i) => {
                    if (!team) return null
                    const sq = getSquadra(team.id, team.nome)
                    const players = getPlayers(sq)
                    const rank = i + 1
                    const icons = ['🥇', '🥈', '🥉']
                    const labels = ['Campioni', '2° Posto', '3° Posto']
                    return (
                      <div key={i} className={`${styles.podioCard} ${styles[`rank${rank}`]}`}>
                        <div className={styles.podioRankIcon}>{icons[i]}</div>
                        <div className={styles.podioRankLabel}>{labels[i]}</div>
                        <div className={styles.podioTeamName}>{team.nome}</div>
                        {players.length > 0 && (
                          <ul className={styles.podioPlayers}>
                            {players.map((p, j) => <li key={j} className={styles.podioPlayer}>{p}</li>)}
                          </ul>
                        )}
                        <div className={styles.podioPremio}>{PREMI[i].premio}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Squadre partecipanti 2026 */}
      {!loading && squadre.length > 0 && (
        <div className={styles.partecipanti}>
          <div className={styles.partLabel}>Squadre partecipanti · 2026</div>
          <div className={styles.partGrid}>
            {CATEGORIE.map(cat => {
              const sq = getTutte(cat.id)
              if (sq.length === 0) return null
              return (
                <div key={cat.id} className={styles.partCat}>
                  <div className={styles.partCatLabel}>
                    <span className={`${styles.badge} ${styles[`badge${cat.cls}`]}`}>{cat.badge}</span>
                    <span>{sq.length} squadre</span>
                  </div>
                  <div className={styles.partList}>
                    {sq.map(s => (
                      <span key={s.id} className={styles.partTeam}>{s.nomeSquadra}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 2027 Teaser ───────────────────────────────────────────── */}
      <div className={styles.teaser}>
        <div className={styles.teaserBg} />
        <div className={styles.teaserContent}>
          <div className={styles.teaserEye}>👀</div>
          <div className={styles.teaserYear}>2027</div>
          <div className={styles.teaserSeeYou}>See you in 2027</div>
          <div className={styles.teaserSub}>
            TangherFest · Green Volley 3×3 · Segonzano
          </div>
          <div className={styles.teaserLine} />
          <div className={styles.teaserHint}>
            Ci vediamo la prossima estate.<br />
            Allena il tuo team e preparati — si torna in campo.
          </div>
        </div>
      </div>

    </div>
  )
}
