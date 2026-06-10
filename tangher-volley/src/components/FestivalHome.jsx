import styles from './FestivalHome.module.css'

const PROGRAMMA = [
  {
    giorno: 'Venerdì', data: '7', attivita: [
      {
        icon: '🥘',
        title: 'Serata Paella',
        ora: 'Serata',
        tag: 'Food',
        tagCls: 'food',
        desc: 'Una grande paella per tutti, preparata con ingredienti freschi nella splendida cornice del Doss Venticcia. Aperto a chiunque voglia partecipare.',
      },
    ],
  },
  {
    giorno: 'Sabato', data: '8', attivita: [
      {
        icon: '🏐',
        title: 'Green Volley 3×3',
        ora: 'Tutto il giorno',
        tag: 'Sport',
        tagCls: 'sport',
        desc: 'Il torneo di beach volley su erba — cuore sportivo della Tangher Fest. Due categorie: Pro e Amatori. Posti limitati a 24 squadre totali.',
        cta: true,
      },
      {
        icon: '🎧',
        title: 'DJ Set Serale',
        ora: 'Serata',
        tag: 'Music',
        tagCls: 'music',
        desc: 'La notte del sabato si scalda con musica, ballo e un\'atmosfera unica sotto le stelle della Val di Cembra.',
      },
    ],
  },
  {
    giorno: 'Domenica', data: '9', attivita: [
      {
        icon: '🎉',
        title: 'Gran Finale',
        ora: 'In arrivo',
        tag: 'Party',
        tagCls: 'party',
        desc: 'Attività e sorprese per chiudere in bellezza tre giorni di festa. Dettagli presto disponibili.',
        tba: true,
      },
    ],
  },
]

export default function FestivalHome({ onGoVolley }) {
  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroGrid} />
        <div className={styles.heroInner}>
          <div className={styles.heroDate}>7 · 8 · 9 Agosto 2026 · Segonzano – Val di Cembra</div>
          <div className={styles.heroLoc}>Loc. Doss Venticcia</div>
          <div className={styles.logoWrap}>
            <span className={styles.logoTop}>Tangher</span>
            <span className={styles.logoBot}>Fest</span>
          </div>
          <div className={styles.heroYear}>2026</div>
          <div className={styles.pills}>
            {['Music', 'Food', 'Party', 'Sport'].map(p => (
              <span key={p} className={styles.pill}>{p}</span>
            ))}
          </div>
          <p className={styles.heroSub}>Tre giorni di sport, musica e festa a Segonzano</p>
        </div>
      </header>

      {/* ── Programma ── */}
      <div className={styles.container}>
        <div className={styles.slabel}>Il Programma</div>
        <h2 className={styles.h2}>Tre giorni di <span>Festa</span></h2>
        <p className={styles.lead}>
          Dal 7 al 9 agosto 2026, il Doss Venticcia di Segonzano si trasforma
          nel cuore pulsante della Val di Cembra. Sport, musica, cibo e amici.
        </p>

        <div className={styles.giorni}>
          {PROGRAMMA.map(g => (
            <div key={g.data} className={styles.giorno}>

              <div className={styles.giornoHeader}>
                <div className={styles.giornoLabel}>
                  <span className={styles.giornoNome}>{g.giorno}</span>
                  <span className={styles.giornoData}>{g.data} Agosto</span>
                </div>
                <div className={styles.giornoLine} />
              </div>

              <div className={styles.cards}>
                {g.attivita.map(a => (
                  <div key={a.title} className={`${styles.card} ${a.cta ? styles.cardVolley : ''}`}>
                    <div className={styles.cardHead}>
                      <span className={styles.cardIcon}>{a.icon}</span>
                      <span className={`${styles.cardTag} ${styles[`tag_${a.tagCls}`]}`}>{a.tag}</span>
                      <span className={styles.cardOra}>{a.ora}</span>
                    </div>
                    <div className={styles.cardTitle}>{a.title}</div>
                    <div className={styles.cardDesc}>{a.desc}</div>
                    {a.cta && (
                      <button className={styles.ctaBtn} onClick={onGoVolley}>
                        Scopri il torneo e iscriviti →
                      </button>
                    )}
                    {a.tba && <div className={styles.tbaBadge}>🔜 Dettagli presto</div>}
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Info location */}
        <div className={styles.locationBar}>
          <span>📍</span>
          <span>Loc. Doss Venticcia · Segonzano (TN) · Parcheggio gratuito in loco</span>
        </div>
      </div>

    </div>
  )
}
