import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          <span className={styles.t1}>Tangher</span>
          <span className={styles.t2}>Fest</span>
        </div>
        <p className={styles.sub}>Green Volley 3×3 · Segonzano 2026</p>
        <p className={styles.copy}>© 2026 Tangher Fest · Segonzano, Val di Cembra · Loc. Doss Venticcia</p>
      </div>
    </footer>
  )
}
