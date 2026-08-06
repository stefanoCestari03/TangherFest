import styles from './Navbar.module.css'
const TABS = [
  { id: 'info',       label: 'Info' },
  { id: 'regole',     label: 'Regole' },
  { id: 'iscrizione', label: 'Iscriviti' },
  { id: 'squadre',    label: 'Squadre' },
  { id: 'torneo',     label: 'Torneo' },
  { id: 'premi',      label: 'Premi' },
]
export default function Navbar({ tab, setTab, nSquadre, navRef, onBack }) {
  return (
    <nav className={styles.nav} ref={navRef}>
      <div className={styles.inner}>
        {onBack && (
          <button className={styles.backBtn} onClick={onBack} title="Torna alla home">
            ← Festa
          </button>
        )}
        {TABS.map(t => (
          <button key={t.id} className={`${styles.tab} ${tab === t.id ? styles.act : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
            {t.id === 'squadre' && nSquadre > 0 && <span className={styles.badge}>{nSquadre}</span>}
          </button>
        ))}
      </div>
    </nav>
  )
}
