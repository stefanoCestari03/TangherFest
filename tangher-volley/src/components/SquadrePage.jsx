import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { deleteSquadra } from '../lib/db'
import { CAT_LABEL, MAX_TESSERATI, MAX_LIBERE } from '../lib/constants'
import { formatDate } from '../lib/helpers'
import styles from './SquadrePage.module.css'

function isRecente(isoDate) {
  if (!isoDate) return false
  return Date.now() - new Date(isoDate).getTime() < 48 * 60 * 60 * 1000
}

function SlotRow({ tipo, count, max }) {
  const pct  = Math.min(count / max * 100, 100)
  const full = count >= max
  const isTess = tipo === 'tesserata'
  return (
    <div className={`${styles.slotRow} ${isTess ? '' : styles.slotLib}`}>
      <div className={styles.slotHeader}>
        <span className={styles.slotName}>{isTess ? 'Pro' : 'Amatori'}</span>
        <span className={`${styles.slotCount} ${full ? styles.slotFull : ''}`}>
          {count}<span className={styles.slotMax}>/{max}</span>
        </span>
      </div>
      <div className={styles.slotBar}>
        <div
          className={`${styles.slotFill} ${full ? styles.slotFillFull : !isTess ? styles.slotFillLib : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={styles.slotSub}>
        {full ? '⚠ Posti esauriti' : `${max - count} ${max - count === 1 ? 'posto libero' : 'posti liberi'}`}
      </div>
    </div>
  )
}

function TeamCard({ sq, rank, isAdmin, onWithdraw }) {
  const [confirm,  setConfirm]  = useState(false)
  const [removing, setRemoving] = useState(false)
  const [cardErr,  setCardErr]  = useState(null)

  const isTess = sq.tipo === 'tesserata'
  const nuovo  = isRecente(sq.creato_il)

  async function handleWithdraw() {
    setRemoving(true); setCardErr(null)
    try {
      await deleteSquadra(sq.id)
      onWithdraw(sq.id)
    } catch (e) { setCardErr(e.message); setRemoving(false); setConfirm(false) }
  }

  return (
    <div className={`${styles.card} ${isTess ? '' : styles.cardLib}`}>
      <div className={styles.cardRank}>#{String(rank).padStart(2, '0')}</div>

      <div className={styles.cardTop}>
        <div className={styles.cardName}>{sq.nomeSquadra}</div>
        <div className={styles.cardBadges}>
          <span className={`${styles.typeBadge} ${isTess ? styles.typeBadgeTess : styles.typeBadgeLib}`}>
            {isTess ? 'Pro' : 'Amatori'}
          </span>
          {nuovo && <span className={styles.newBadge}>● New</span>}
        </div>
      </div>

      <div className={styles.cardRef}>Ref. {sq.referente}</div>

      <div className={styles.players}>
        {(sq.giocatori || []).map((g, j) => (
          <div key={j} className={styles.player}>
            <span className={`${styles.playerDot} ${g.genere === 'F' ? styles.playerDotF : !isTess ? styles.playerDotL : ''}`} />
            <span className={styles.playerName}>{g.nome} {g.cognome}</span>
            <span className={styles.playerCat}>{CAT_LABEL[g.categoria] || g.categoria}</span>
            {g.facoltativo && <span className={styles.playerFac}>riserva</span>}
          </div>
        ))}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>Iscritta il {formatDate(sq.creato_il)}</span>
        <div className={styles.cardPips}>
          {(sq.giocatori || []).map((g, j) => (
            <span key={j} className={`${styles.pip} ${g.genere === 'F' ? styles.pipF : !isTess ? styles.pipL : ''}`} />
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className={styles.adminZone}>
          {cardErr && <div className={styles.cardErr}>{cardErr}</div>}
          {confirm ? (
            <div className={styles.confirmRow}>
              <span className={styles.confirmTxt}>Ritirare la squadra? L&apos;operazione è irreversibile.</span>
              <button className={styles.btnConfirm} onClick={handleWithdraw} disabled={removing}>
                {removing ? '...' : 'Sì, ritira'}
              </button>
              <button className={styles.btnCancel} onClick={() => setConfirm(false)}>Annulla</button>
            </div>
          ) : (
            <button className={styles.btnWithdraw} onClick={() => setConfirm(true)}>
              Ritira squadra
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ search, onCta }) {
  if (search) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>🔍</div>
      <p>Nessuna squadra trovata per "<strong>{search}</strong>"</p>
    </div>
  )
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>🏐</div>
      <p>Nessuna squadra ancora iscritta.</p>
      <p className={styles.emptyStrong}>Sii il primo a scendere in campo!</p>
      <button className={styles.emptyBtn} onClick={onCta}>Iscriviti ora →</button>
    </div>
  )
}

export default function SquadrePage({ squadre, onCta, onWithdraw }) {
  const [filtro,   setFiltro]   = useState('tutte')
  const [search,   setSearch]   = useState('')
  const [isAdmin,  setIsAdmin]  = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsAdmin(!!session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setIsAdmin(!!s))
    return () => subscription.unsubscribe()
  }, [])

  const tC = squadre.filter(s => s.tipo === 'tesserata').length
  const lC = squadre.filter(s => s.tipo === 'libera').length

  const filtered = squadre
    .filter(s => filtro === 'tutte' || s.tipo === filtro)
    .filter(s => !search.trim() || s.nomeSquadra.toLowerCase().includes(search.toLowerCase()))

  const slotsLiberi = (MAX_TESSERATI - tC) + (MAX_LIBERE - lC)

  return (
    <div className={styles.wrap}>

      {/* Board header */}
      <div className={styles.board}>
        <div className={styles.boardLeft}>
          <div className={styles.liveTag}>Live · aggiornamento automatico</div>
          <h2 className={styles.boardTitle}>
            Chi è già<br /><span>al via</span>
          </h2>
          <p className={styles.boardSub}>
            Le squadre si stanno iscrivendo — controlla chi sfiderai
            sui campi in erba di Segonzano.
          </p>
        </div>
        <div className={styles.boardCount}>
          <span className={styles.boardNum}>{squadre.length}</span>
          <span className={styles.boardCountLbl}>squadre<br />iscritte</span>
        </div>
      </div>

      {/* Slot progress */}
      <div className={styles.slots}>
        <SlotRow tipo="tesserata" count={tC} max={MAX_TESSERATI} />
        <SlotRow tipo="libera"    count={lC} max={MAX_LIBERE} />
      </div>

      {/* Filter + search */}
      <div className={styles.filterBar}>
        <div className={styles.tabs}>
          {[
            { id: 'tutte',     label: `Tutte · ${squadre.length}` },
            { id: 'tesserata', label: `Pro · ${tC}` },
            { id: 'libera',    label: `Amatori · ${lC}` },
          ].map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${filtro === t.id ? styles.act : ''}`}
              onClick={() => setFiltro(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          className={styles.search}
          placeholder="Cerca squadra..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Team list */}
      {filtered.length === 0 ? (
        <EmptyState search={search} onCta={onCta} />
      ) : (
        <div className={styles.list}>
          {filtered.map((sq, i) => (
            <TeamCard key={sq.id} sq={sq} rank={i + 1} isAdmin={isAdmin} onWithdraw={onWithdraw} />
          ))}
        </div>
      )}

      {/* CTA bottom */}
      {slotsLiberi > 0 && (
        <div className={styles.ctaBar}>
          <div className={styles.ctaText}>
            Ancora <strong>{slotsLiberi}</strong>{' '}
            {slotsLiberi === 1 ? 'posto libero' : 'posti liberi'} — non aspettare!
          </div>
          <button className={styles.ctaBtn} onClick={onCta}>Iscriviti ora →</button>
        </div>
      )}

    </div>
  )
}
