import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.logoWrap}>
        <span className={styles.logoT}>Tangher</span>
        <span className={styles.logoB}>Fest</span>
      </div>
      <p className={styles.sub}>Green Volley 3×3 · Segonzano 2026</p>
      <p className={styles.copy}>© 2026 Tangher Fest · Segonzano, Val di Cembra · Loc. Doss Venticcia</p>
    </footer>
  )
}
