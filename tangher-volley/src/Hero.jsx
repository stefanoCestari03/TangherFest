import styles from './Hero.module.css'

export default function Hero({ onCta }) {
  return (
    <header className={styles.hero}>
      <div className={styles.bg} />
      <div className={styles.grid} />

      <div className={styles.inner}>
        <div className={styles.topLine}>
          <span className={styles.date}>8 · 9 · 10 Agosto 2026</span>
          <span className={styles.sep}>·</span>
          <span className={styles.place}>Segonzano – Val di Cembra</span>
        </div>
        <p className={styles.loc}>Loc. Doss Venticcia</p>

        <div className={styles.logoWrap}>
          <div className={styles.logoTop}>Tangher</div>
          <div className={styles.logoBot}>Fest</div>
          <div className={styles.year}>2026</div>
        </div>

        <div className={styles.tags}>
          {['Music', 'Food', 'Party', 'Sport'].map(t => (
            <span key={t} className={styles.tag}>{t}</span>
          ))}
        </div>

        <div className={styles.divider} />

        <h2 className={styles.eventTitle}>
          Green Volley <span>3×3</span>
        </h2>
        <p className={styles.eventSub}>Torneo su erba · Aperto a tutti</p>

        <button className={styles.cta} onClick={onCta}>
          Iscriviti al Torneo ↓
        </button>
      </div>
    </header>
  )
}
