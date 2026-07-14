import styles from './InfoPage.module.css'

const INFO_CARDS = [
  { l: 'Giorno torneo', v: 'Sabato 8 Agosto 2026' },
  { l: 'Evento',        v: 'TangherFest 7 · 8 · 9 Agosto' },
  { l: 'Luogo',         v: 'Loc. Doss Venticcia, Segonzano' },
  { l: 'Formato',       v: '3 contro 3 su erba' },
  { l: 'Posti',         v: '12 Pro + 12 Amatori' },
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
        Il Green Volley si gioca nella giornata del <strong>sabato 8 agosto</strong> ed è il cuore sportivo
        della <strong>Tangher Fest</strong>, il festival estivo di Segonzano che unisce musica live,
        gastronomia locale e sport nella splendida cornice della Val di Cembra.
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
        <div className={styles.waSep}>oppure</div>
        <a href="https://chat.whatsapp.com/DODc0HK8mGo0nirlqTMlwM" target="_blank" rel="noreferrer" className={styles.waBtn}>
          <svg viewBox="0 0 24 24" className={styles.waIcon} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.547a.5.5 0 0 0 .609.61l5.79-1.474A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.735.951.983-3.648-.235-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1c5.467 0 9.9 4.433 9.9 9.9 0 5.467-4.433 9.9-9.9 9.9z"/></svg>
          Unisciti al gruppo WhatsApp
        </a>
      </div>

    </div>
  )
}
