import { MAX_TESSERATI, MAX_LIBERE } from '../lib/constants'
import styles from './SlotBar.module.css'
export default function SlotBar({ squadre }) {
  const t=squadre.filter(s=>s.tipo==='tesserata').length
  const l=squadre.filter(s=>s.tipo==='libera').length
  return <div className={styles.grid}>
    <div className={`${styles.card} ${styles.tess}`}>
      <div className={styles.lbl}>Tesseratem</div>
      <div className={`${styles.count} ${styles.cT} ${t>=MAX_TESSERATI?styles.full:''}`}>{t}<span className={styles.max}>/{MAX_TESSERATI}</span></div>
      <div className={styles.sub}>{t>=MAX_TESSERATI?'⚠ Esaurito':`${MAX_TESSERATI-t} posti`}</div>
      <div className={styles.barOut}><div className={`${styles.barIn} ${styles.bT}`} style={{width:`${Math.min(t/MAX_TESSERATI*100,100)}%`}}/></div>
    </div>
    <div className={`${styles.card} ${styles.lib}`}>
      <div className={styles.lbl}>Libere</div>
      <div className={`${styles.count} ${styles.cL} ${l>=MAX_LIBERE?styles.full:''}`}>{l}<span className={styles.max}>/{MAX_LIBERE}</span></div>
      <div className={styles.sub}>{l>=MAX_LIBERE?'⚠ Esaurito':`${MAX_LIBERE-l} posti`}</div>
      <div className={styles.barOut}><div className={`${styles.barIn} ${styles.bL}`} style={{width:`${Math.min(l/MAX_LIBERE*100,100)}%`}}/></div>
    </div>
  </div>
}
