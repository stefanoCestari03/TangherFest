import styles from './InfoPage.module.css'

const INFO_CARDS = [
  { l: 'Giorno torneo',        v: 'Sabato 8 Agosto 2026' },
  { l: 'Scadenza iscrizioni',  v: '31 Luglio 2026', highlight: true },
  { l: 'Evento',               v: 'TangherFest 7 · 8 · 9 Agosto' },
  { l: 'Luogo',                v: 'Loc. Doss Venticcia, Segonzano' },
  { l: 'Formato',              v: '3 contro 3 su erba' },
  { l: 'Posti',                v: '14 Pro + 14 Amatori' },
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
        Due categorie basate sul livello di gioco: <strong>Pro</strong> per chi sa giocare (ragazza obbligatoria tra i titolari)
        e <strong>Amatori</strong> per chi gioca per divertimento, senza vincoli di genere.
      </p>

      <div className={styles.infoGrid}>
        {INFO_CARDS.map(x => (
          <div key={x.l} className={`${styles.icard} ${x.highlight ? styles.icardDeadline : ''}`}>
            <div>
              <div className={styles.ilbl}>{x.l}</div>
              <div className={`${styles.ival} ${x.highlight ? styles.ivalDeadline : ''}`}>{x.v}</div>
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
          { title: 'In auto',    val: 'SS47 da Trento → SP71 verso Segonzano · ~30 min' },
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
        <p className={styles.ctaTxt}>Iscriviti ora — i posti sono limitati a 28 squadre totali. <strong>Iscrizioni aperte fino al 31 luglio.</strong></p>
        <button className={styles.ctaBtn} onClick={onCta}>Iscriviti al Torneo →</button>
      </div>

      {/* ── Bio Volley Promo ── */}
      <div className={styles.biolagoPromo}>
        <div className={styles.biolagoChip}>Prossimo torneo di volley</div>
        <div className={styles.biolagoInner}>
          <a href="/biolagotorneo.jpeg" target="_blank" rel="noreferrer" className={styles.bioPosterWrap}>
            <img src="/biolagotorneo.jpeg" alt="Bio Volley 2026 – Biolago di Predazzo" className={styles.bioPoster} />
          </a>
          <div className={styles.bioInfo}>
            <div className={styles.bioTitle}>B!o Volley 2026</div>
            <div className={styles.bioDate}>23 Agosto · Predazzo (TN)</div>
            <div className={styles.bioDesc}>
              Torneo al Biolago di Predazzo.<br />
              €25 a persona — pranzo e ingresso inclusi.
            </div>
            <div className={styles.bioContacts}>
              <a href="https://www.instagram.com/gabry_magro02/" target="_blank" rel="noreferrer" className={styles.bioIg}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                @gabry_magro02
              </a>
              <a href="tel:+393477208122" className={styles.bioTel}>347 720 8122</a>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
