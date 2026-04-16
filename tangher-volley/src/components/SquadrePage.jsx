import { useState } from 'react'
import { CAT_LABEL } from '../lib/constants'
import { formatDate } from '../lib/helpers'
import styles from './SquadrePage.module.css'

export default function SquadrePage({ squadre }) {
  const [filtro, setFiltro] = useState('tesserata')
  const filtered = squadre.filter(s => s.tipo === filtro)
  const tCount   = squadre.filter(s => s.tipo === 'tesserata').length
  const lCount   = squadre.filter(s => s.tipo === 'libera').length

  return (
    <div className={styles.wrap}>
      <div className={styles.hype}>
        <div className={styles.hypeTitle}>🔥 Chi c'è già al via</div>
        <p className={styles.hypeTxt}>
          Le squadre si stanno iscrivendo! Guarda chi è già dentro e preparati —
          sarà una battaglia epica sul verde di Segonzano.
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${filtro === 'tesserata' ? styles.tabAct : ''}`}
          onClick={() => setFiltro('tesserata')}
        >
          Tesseratem · {tCount}
        </button>
        <button
          className={`${styles.tab} ${filtro === 'libera' ? styles.tabAct : ''}`}
          onClick={() => setFiltro('libera')}
        >
          Libere · {lCount}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏐</div>
          <p>Nessuna squadra {filtro === 'tesserata' ? 'tesserata' : 'libera'} iscritta ancora.</p>
          <p><strong>Sii il primo!</strong></p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((sq, i) => (
            <div key={sq.id} className={`${styles.card} ${sq.tipo === 'libera' ? styles.cardLib : ''}`}>
              <div className={styles.ordinal}>#{i + 1}</div>
              <div className={styles.name}>{sq.nomeSquadra}</div>
              <div className={styles.ref}>Ref: {sq.referente}</div>
              <div className={styles.players}>
                {sq.giocatori.map((g, j) => (
                  <div key={j} className={styles.player}>
                    <span className={`${styles.dot} ${g.genere === 'F' ? styles.dotF : sq.tipo === 'libera' ? styles.dotLib : ''}`} />
                    <span>{g.nome} {g.cognome}</span>
                    <span className={styles.cat}>{CAT_LABEL[g.categoria] || g.categoria}</span>
                  </div>
                ))}
              </div>
              <div className={styles.since}>Iscritto il {formatDate(sq.creato_il)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
