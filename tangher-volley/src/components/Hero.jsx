import styles from './Hero.module.css'
export default function Hero({ squadre, onCta }) {
  const t=squadre.filter(s=>s.tipo==='tesserata').length
  const l=squadre.filter(s=>s.tipo==='libera').length
  return (
    <header className={styles.hero}>
      <div className={styles.bg}/><div className={styles.grid}/>
      <div className={styles.inner}>
        <div className={styles.topDate}>8 · 9 · 10 Agosto 2026 · Segonzano – Val di Cembra</div>
        <div className={styles.topLoc}>Loc. Doss Venticcia</div>
        <div className={styles.logoWrap}>
          <span className={styles.logoTop}>Tangher</span>
          <span className={styles.logoBot}>Fest</span>
        </div>
        <div className={styles.year}>2026</div>
        <div className={styles.pills}>{['Music','Food','Party','Sport'].map(t=><span key={t} className={styles.pill}>{t}</span>)}</div>
        <div className={styles.divider}/>
        <h1 className={styles.eventTitle}>Green Volley <span>3×3</span></h1>
        <p className={styles.eventSub}>Torneo su erba · Aperto a tutti</p>
        <div className={styles.counters}>
          <div className={styles.count}><span className={styles.countVal}>{t}</span><span className={styles.countLbl}>Tesseratem</span></div>
          <span className={styles.countSep}>+</span>
          <div className={styles.count}><span className={styles.countVal} style={{color:'var(--sky)'}}>{l}</span><span className={styles.countLbl}>Libere</span></div>
          <span className={styles.countSep}>=</span>
          <div className={styles.count}><span className={styles.countVal} style={{color:'var(--gold)'}}>{t+l}</span><span className={styles.countLbl}>Iscritte</span></div>
        </div>
        <button className={styles.cta} onClick={onCta}>Iscriviti al Torneo ↓</button>
      </div>
    </header>
  )
}
