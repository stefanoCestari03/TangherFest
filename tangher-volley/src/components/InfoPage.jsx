import styles from './InfoPage.module.css'

const INFO_CARDS = [
  { l: 'Date',    v: '7 · 8 · 9 Agosto 2026' },
  { l: 'Luogo',   v: 'Loc. Doss Venticcia, Segonzano' },
  { l: 'Formato', v: '3 contro 3 su erba' },
  { l: 'Posti',   v: '12 Pro + 12 Amatori' },
]

const ATMOSFERA = [
  { title: 'Musica Live',   desc: 'Concerti e DJ set ogni sera nelle aree festival' },
  { title: 'Food & Drink',  desc: 'Stand gastronomici con prodotti tipici trentini' },
  { title: 'Green Volley',  desc: 'Il torneo 3×3 su erba, aperto a tutti i livelli' },
  { title: 'Party & Fun',   desc: 'Atmosfera unica tra amici, natura e divertimento' },
]

export default function InfoPage({ onCta }) {
  return (
    <div className={styles.wrap}>

      {/* Intro evento */}
      <div className={styles.slabel}>Il Torneo</div>
      <h2 className={styles.h2}>Green Volley <span>3×3</span></h2>
      <p className={styles.lead}>
        Benvenuti al torneo di <strong>Green Volley 3×3</strong> della Tangher Fest 2026!
        Due categorie: <strong>Pro</strong> per chi sa giocare (con o senza tessera FIPaV, ragazza obbligatoria tra i titolari)
        e <strong>Amatori</strong> per chi gioca per divertimento senza vincoli di genere.
      </p>

      <div className={styles.infoGrid}>
        {INFO_CARDS.map(x => (
          <div key={x.l} className={styles.icard}>
            <div>
              <div className={styles.ilbl}>{x.l}</div>
              <div className={styles.ival}>{x.v}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Contesto festival */}
      <div className={styles.slabel}>Tangher Fest 2026</div>
      <h2 className={styles.h2}>Tre giorni di <span>Festa</span></h2>
      <p className={styles.lead}>
        Il Green Volley è il cuore sportivo della <strong>Tangher Fest</strong>,
        il festival estivo di Segonzano che unisce musica live, gastronomia locale
        e sport nella splendida cornice della Val di Cembra.
      </p>

      <div className={styles.atmosGrid}>
        {ATMOSFERA.map(x => (
          <div key={x.title} className={styles.atmosCard}>
            <div className={styles.atmosTitle}>{x.title}</div>
            <div className={styles.atmosDesc}>{x.desc}</div>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Location */}
      <div className={styles.slabel}>Come raggiungerci</div>
      <h2 className={styles.h2}>Segonzano, <span>Val di Cembra</span></h2>
      <p className={styles.lead}>
        Siamo a <strong>Loc. Doss Venticcia</strong>, nel comune di Segonzano.
        Facilmente raggiungibile in auto da Trento in circa 30 minuti lungo la Val di Cembra.
      </p>

      <div className={styles.locationCard}>
        {[
          { title: 'Indirizzo',  val: 'Loc. Doss Venticcia · Segonzano (TN)' },
          { title: 'In auto',    val: 'SS47 da Trento → SP11 verso Segonzano · ~30 min' },
          { title: 'Parcheggio', val: 'Disponibile in loco, gratuito' },
        ].map(r => (
          <div key={r.title} className={styles.locationRow}>
            <div>
              <div className={styles.locationTitle}>{r.title}</div>
              <div className={styles.locationVal}>{r.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className={styles.cta}>
        <div className={styles.ctaTitle}>Pronto a scendere in campo?</div>
        <p className={styles.ctaTxt}>Iscriviti ora — i posti sono limitati a 24 squadre totali.</p>
        <button className={styles.ctaBtn} onClick={onCta}>Iscriviti al Torneo →</button>
      </div>

    </div>
  )
}
