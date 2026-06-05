import styles from './PremiPage.module.css'

const PODIO = [
  { pos: 1, icon: '🥇', label: '1° Classificato' },
  { pos: 2, icon: '🥈', label: '2° Classificato' },
  { pos: 3, icon: '🥉', label: '3° Classificato' },
]

const CATEGORIE = [
  { id: 'pro',     label: 'Categoria Pro',     badge: 'Pro',     cls: 'T' },
  { id: 'amatori', label: 'Categoria Amatori', badge: 'Amatori', cls: 'L' },
]

export default function PremiPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.slabel}>Ricompense</div>
      <h2 className={styles.h2}>I <span>Premi</span></h2>
      <p className={styles.lead}>
        Chi arriva in vetta non tornerà a mani vuote.<br />
        Qualcosa di speciale attende i primi tre classificati di ciascuna categoria —
        ma i dettagli <strong>restano segreti fino al giorno del torneo</strong>.
      </p>

      <div className={styles.categories}>
        {CATEGORIE.map(cat => (
          <div key={cat.id} className={styles.catBlock}>
            <div className={styles.catHeader}>
              <span className={`${styles.badge} ${styles[`badge${cat.cls}`]}`}>{cat.badge}</span>
              <span className={styles.catTitle}>{cat.label}</span>
            </div>
            <div className={styles.podio}>
              {PODIO.map(p => (
                <div key={p.pos} className={`${styles.podCard} ${styles[`pos${p.pos}`]}`}>
                  <span className={styles.podIcon}>{p.icon}</span>
                  <span className={styles.podLabel}>{p.label}</span>
                  <span className={styles.podMystery}>???</span>
                  <span className={styles.podLock}>🔒</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.hint}>
        <span className={styles.hintIcon}>✨</span>
        <div>
          <strong>Vale la pena giocarsi tutto.</strong><br />
          I premi verranno svelati solo sul palco, al momento della premiazione.
        </div>
      </div>
    </div>
  )
}
