import styles from './Hero.module.css'
export default function Hero({ squadre, onCta }) {
  const t=squadre.filter(s=>s.tipo==='tesserata').length
  const l=squadre.filter(s=>s.tipo==='libera').length
  return (
    <header className={styles.hero}>
      <div className={styles.bg}/><div className={styles.grid}/>
      <div className={styles.inner}>
        <div className={styles.topDate}>7 · 8 · 9 Agosto 2026 · Segonzano – Val di Cembra</div>
        <div className={styles.topLoc}>Loc. Doss Venticcia</div>
        <div className={styles.logoWrap}>
          <span className={styles.logoTop}>Tangher</span>
          <span className={styles.logoBot}>Fest</span>
        </div>
        <div className={styles.year}>2026</div>
        <div className={styles.pills}>{['Music','Food','Party','Sport'].map(t=><span key={t} className={styles.pill}>{t}</span>)}</div>
        <h1 className={styles.eventTitle}>Green Volley <span>3×3</span></h1>
        <p className={styles.eventSub}>Torneo su erba · <strong>Sabato 8 Agosto</strong> · Aperto a tutti</p>
        <div className={styles.counters}>
          <div className={styles.count}><span className={styles.countVal}>{t}</span><span className={styles.countLbl}>Pro</span></div>
          <span className={styles.countSep}>+</span>
          <div className={styles.count}><span className={styles.countVal} style={{color:'var(--sky)'}}>{l}</span><span className={styles.countLbl}>Amatori</span></div>
          <span className={styles.countSep}>=</span>
          <div className={styles.count}><span className={styles.countVal} style={{color:'var(--gold)'}}>{t+l}</span><span className={styles.countLbl}>Iscritte</span></div>
        </div>
        <button className={styles.cta} onClick={onCta}>Iscriviti al Torneo ↓</button>
        <div className={styles.waRow}>
          <a href="https://chat.whatsapp.com/DODc0HK8mGo0nirlqTMlwM" target="_blank" rel="noreferrer" className={styles.waBtn}>
            <svg viewBox="0 0 24 24" className={styles.waIcon} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.547a.5.5 0 0 0 .609.61l5.79-1.474A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.735.951.983-3.648-.235-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1c5.467 0 9.9 4.433 9.9 9.9 0 5.467-4.433 9.9-9.9 9.9z"/></svg>
            Unisciti al gruppo WhatsApp
          </a>
        </div>
      </div>
    </header>
  )
}
