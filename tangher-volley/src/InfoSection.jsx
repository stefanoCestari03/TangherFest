import styles from './InfoSection.module.css'

export default function InfoSection() {
  return (
    <section className={styles.wrap} id="info">
      <div className={styles.inner}>

        <div className={styles.sectionLabel}>Il Torneo</div>
        <h2 className={styles.h2}>Green Volley 3×3 <span>Tangher Fest</span></h2>
        <p className={styles.lead}>
          Un torneo di beach volley su erba aperto a tutti, nel cuore della Val di Cembra.
          Tre giorni di sport, musica e festa a Segonzano.
        </p>

        <div className={styles.infoGrid}>
          {[
            { icon: '📅', label: 'Date', val: '8 · 9 · 10 Agosto 2026' },
            { icon: '📍', label: 'Luogo', val: 'Loc. Doss Venticcia, Segonzano' },
            { icon: '🏐', label: 'Formato', val: '3 contro 3 su erba' },
            { icon: '👥', label: 'Categorie', val: 'Tesserati e Liberi' },
          ].map(i => (
            <div key={i.label} className={styles.infoCard}>
              <span className={styles.infoIcon}>{i.icon}</span>
              <div>
                <div className={styles.infoLabel}>{i.label}</div>
                <div className={styles.infoVal}>{i.val}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.sectionLabel}>Regolamento</div>
        <h2 className={styles.h2}>Composizione <span>Squadre</span></h2>
        <p className={styles.lead}>
          Il torneo è aperto a due tipologie di squadre. Ogni team è composto da <strong>3 giocatori</strong>.
          Le regole variano in base al tesseramento.
        </p>

        <div className={styles.rulesGrid}>
          <div className={styles.ruleCard}>
            <div className={styles.ruleHeader}>
              <span className={styles.ruleBadge} style={{background:'rgba(139,48,204,0.3)',borderColor:'rgba(139,48,204,0.5)',color:'#D080FF'}}>Tesserata</span>
              <div className={styles.ruleTitle}>Squadra con pallavolisti federati</div>
            </div>
            <ul className={styles.ruleList}>
              <li>Pallavolisti con tessera FIPaV o federazione affiliata</li>
              <li><strong>Massimo 2 componenti maschili tesserati</strong></li>
              <li><strong>Obbligatoriamente almeno 1 componente femminile</strong></li>
              <li>Allegare la tessera federale per ogni tesserato</li>
            </ul>
          </div>

          <div className={styles.ruleCard}>
            <div className={styles.ruleHeader}>
              <span className={styles.ruleBadge} style={{background:'rgba(112,202,255,0.15)',borderColor:'rgba(112,202,255,0.35)',color:'#70CAFF'}}>Libera</span>
              <div className={styles.ruleTitle}>Squadra senza tesserati</div>
            </div>
            <ul className={styles.ruleList}>
              <li>Nessuna tessera federale richiesta</li>
              <li><strong>Nessun vincolo di genere</strong></li>
              <li>Aperta a tutti: amici, colleghi, famiglie</li>
              <li>Documento d'identità per ogni componente</li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  )
}
