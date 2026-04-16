import { CATEGORIE } from '../lib/constants'
import styles from './InfoPage.module.css'

export default function InfoPage() {
  return (
    <div className={styles.wrap}>

      {/* ── Torneo ── */}
      <div className={styles.slabel}>Il Torneo</div>
      <h2 className={styles.h2}>Green Volley <span>3×3</span></h2>
      <p className={styles.lead}>
        Benvenuti al torneo di <strong>Green Volley 3×3</strong> della Tangher Fest 2026!
        Una competizione all'aperto su erba verde, aperta a tutti — sia squadre con pallavolisti
        tesserati che squadre amatoriali. Tre giorni di sport, musica e festa nel cuore della
        Val di Cembra, a Segonzano.
      </p>

      <div className={styles.infoGrid}>
        {[
          { icon: '📅', lbl: 'Date',       val: '8 · 9 · 10 Agosto 2026' },
          { icon: '📍', lbl: 'Luogo',      val: 'Loc. Doss Venticcia, Segonzano' },
          { icon: '🏐', lbl: 'Formato',    val: '3 contro 3 su erba' },
          { icon: '👥', lbl: 'Squadre max',val: '12 Tesseratem + 12 Libere' },
        ].map(i => (
          <div key={i.lbl} className={styles.icard}>
            <span className={styles.icardIcon}>{i.icon}</span>
            <div>
              <div className={styles.icardLbl}>{i.lbl}</div>
              <div className={styles.icardVal}>{i.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* ── Regolamento ── */}
      <div className={styles.slabel}>Regolamento</div>
      <h2 className={styles.h2}>Composizione <span>Squadre</span></h2>
      <p className={styles.lead}>
        Ogni team è composto da <strong>3 giocatori</strong>. Le regole variano in base al
        tesseramento federale. Leggi attentamente prima di iscriverti.
      </p>

      <div className={styles.rulesGrid}>
        <div className={styles.rbox}>
          <span className={`${styles.rbadge} ${styles.rbTess}`}>Tesserata</span>
          <div className={styles.rtitle}>Con pallavolisti federati</div>
          <ul className={styles.rlist}>
            <li>Pallavolisti con tessera FIPaV o affiliata</li>
            <li><strong>Massimo 2 componenti maschili tesserati</strong></li>
            <li><strong>Obbligatoriamente almeno 1 componente femminile</strong></li>
            <li>Allegare la tessera federale per ogni tesserato</li>
            <li>Massimo 12 squadre per categoria</li>
          </ul>
        </div>
        <div className={styles.rbox}>
          <span className={`${styles.rbadge} ${styles.rbLib}`}>Libera</span>
          <div className={styles.rtitle}>Senza pallavolisti tesserati</div>
          <ul className={styles.rlist}>
            <li>Nessuna tessera federale richiesta</li>
            <li><strong>Nessun vincolo di genere</strong></li>
            <li>Aperta a tutti: amici, colleghi, famiglie</li>
            <li>Documento d'identità per ogni componente</li>
            <li>Massimo 12 squadre per categoria</li>
          </ul>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Categorie ── */}
      <div className={styles.slabel}>Livelli di Gioco</div>
      <h2 className={styles.h2}>Le <span>Categorie</span></h2>
      <p className={styles.lead}>
        Ogni giocatore deve indicare onestamente la propria categoria federale. Questo garantisce
        un torneo <strong>equilibrato e divertente</strong> per tutti i partecipanti.
      </p>

      <div className={styles.catGrid}>
        {CATEGORIE.slice(1).map(c => (
          <div key={c.value} className={styles.catCard}>
            <span className={styles.catIcon}>🏅</span>
            <span className={styles.catLabel}>{c.label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
