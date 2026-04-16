import { MAX_TESSERATI, MAX_LIBERE } from '../lib/constants'
import styles from './SlotBar.module.css'

export default function SlotBar({ squadre }) {
  const tess = squadre.filter(s => s.tipo === 'tesserata').length
  const lib  = squadre.filter(s => s.tipo === 'libera').length
  const pT   = Math.min((tess / MAX_TESSERATI) * 100, 100)
  const pL   = Math.min((lib  / MAX_LIBERE)    * 100, 100)

  return (
    <div className={styles.grid}>
      <div className={`${styles.card} ${styles.tess}`}>
        <div className={styles.lbl}>Squadre Tesseratem</div>
        <div className={`${styles.count} ${styles.colorTess} ${tess >= MAX_TESSERATI ? styles.full : ''}`}>
          {tess}<span className={styles.max}>/{MAX_TESSERATI}</span>
        </div>
        <div className={styles.sub}>
          {tess >= MAX_TESSERATI ? '⚠ Posti esauriti' : `${MAX_TESSERATI - tess} posti disponibili`}
        </div>
        <div className={styles.barOut}>
          <div className={`${styles.barIn} ${styles.barTess}`} style={{ width: `${pT}%` }} />
        </div>
      </div>

      <div className={`${styles.card} ${styles.lib}`}>
        <div className={styles.lbl}>Squadre Libere</div>
        <div className={`${styles.count} ${styles.colorLib} ${lib >= MAX_LIBERE ? styles.full : ''}`}>
          {lib}<span className={styles.max}>/{MAX_LIBERE}</span>
        </div>
        <div className={styles.sub}>
          {lib >= MAX_LIBERE ? '⚠ Posti esauriti' : `${MAX_LIBERE - lib} posti disponibili`}
        </div>
        <div className={styles.barOut}>
          <div className={`${styles.barIn} ${styles.barLib}`} style={{ width: `${pL}%` }} />
        </div>
      </div>
    </div>
  )
}
