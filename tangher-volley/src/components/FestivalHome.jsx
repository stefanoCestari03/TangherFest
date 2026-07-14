import { useState } from 'react'
import styles from './FestivalHome.module.css'

const IBAN = 'IT04Z0830435450000068731087'
const DJ_LINEUP = ['Ober One', 'Upward', 'Lex e Mirko', 'Des3ett', 'Purin', 'Danyl']

function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }
  return (
    <button className={`${styles.copyBtn} ${copied ? styles.copyBtnOk : ''}`} onClick={handleCopy}>
      {copied ? '✓ Copiato!' : label}
    </button>
  )
}

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

        {/* ════════════ VENERDÌ 7 ════════════ */}
        <div className={styles.giorno}>
          <div className={styles.giornoHeader}>
            <div className={styles.giornoLabel}>
              <span className={styles.giornoNome}>Venerdì</span>
              <span className={styles.giornoData}>7 Agosto</span>
            </div>
            <div className={styles.giornoLine} />
          </div>

          <div className={styles.posterStrip}>
            {[
              { src: '/locandine/paella.png',            alt: 'Cena Spettacolo Paella' },
              { src: '/locandine/valentino-magnani.png', alt: 'Valentino Magnani' },
              { src: '/locandine/adrij-deejay.png',      alt: 'Adrij Deejay' },
            ].map(p => (
              <a key={p.src} href={p.src} target="_blank" rel="noreferrer" className={styles.posterItem}>
                <img src={p.src} alt={p.alt} className={styles.posterImg} loading="lazy" />
              </a>
            ))}
          </div>

          <div className={styles.cards}>

            {/* Cena Spettacolo */}
            <div className={`${styles.card} ${styles.cardCena}`}>
              <div className={styles.cardHead}>
                <span className={`${styles.cardTag} ${styles.tag_food}`}>Food</span>
                <span className={styles.cardPrice}>35€ <small>a persona</small></span>
              </div>
              <div className={styles.cardTitle}>Cena Spettacolo</div>

              <div className={styles.menu}>
                {['Antipasto', 'Paella', 'Dolce', 'Acqua e vino da tavola'].map(v => (
                  <span key={v} className={styles.menuItem}>{v}</span>
                ))}
              </div>

              <div className={styles.prenotaBox}>
                <div className={styles.prenotaTitle}>Prenotazione obbligatoria</div>
                <div className={styles.prenotaDeadline}>Entro domenica 26 luglio</div>
                <a
                  href="https://wa.me/393477441319"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.waBtn}
                >
                  <svg viewBox="0 0 24 24" className={styles.waBtnIcon} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.547a.5.5 0 0 0 .609.61l5.79-1.474A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.735.951.983-3.648-.235-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1c5.467 0 9.9 4.433 9.9 9.9 0 5.467-4.433 9.9-9.9 9.9z"/></svg>
                  <span>
                    <span className={styles.waBtnMain}>Prenota su WhatsApp</span>
                    <span className={styles.waBtnSub}>347 744 1319</span>
                  </span>
                </a>
              </div>

              <div className={styles.ibanMini}>
                <div className={styles.ibanMiniLabel}>Bonifico bancario</div>
                <div className={styles.ibanMiniRow}>
                  <span className={styles.ibanMiniCode}>{IBAN}</span>
                  <CopyBtn text={IBAN} label="Copia IBAN" />
                </div>
                <div className={styles.ibanMiniRow}>
                  <span className={styles.causaleDisplay}>Causale: <strong>Paella – Nome Cognome</strong></span>
                  <CopyBtn text="Paella – " label="Copia causale" />
                </div>
                <div className={styles.ibanMiniHint}>Dopo aver copiato la causale aggiungi il tuo nome e cognome</div>
              </div>
            </div>

            {/* Adry DJ + SAX */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={`${styles.cardTag} ${styles.tag_music}`}>Music</span>
                <span className={styles.cardOra}>A seguire la cena</span>
              </div>
              <div className={styles.cardTitle}>Adry DJ con SAX</div>
              <div className={styles.cardDesc}>Musica dal vivo per chiudere la serata in bellezza.</div>
            </div>

          </div>
        </div>

        {/* ════════════ SABATO 8 ════════════ */}
        <div className={styles.giorno}>
          <div className={styles.giornoHeader}>
            <div className={styles.giornoLabel}>
              <span className={styles.giornoNome}>Sabato</span>
              <span className={styles.giornoData}>8 Agosto</span>
            </div>
            <div className={styles.giornoLine} />
          </div>

          <div className={styles.posterStrip}>
            {[
              { src: '/locandine/apple-dj-trece.png', alt: 'Apple DJ + Trece' },
              { src: '/locandine/gabriele-purin.png', alt: 'Gabriele Purin' },
            ].map(p => (
              <a key={p.src} href={p.src} target="_blank" rel="noreferrer" className={styles.posterItem}>
                <img src={p.src} alt={p.alt} className={styles.posterImg} loading="lazy" />
              </a>
            ))}
          </div>

          <div className={styles.cards}>

            {/* Green Volley — card prominente */}
            <div className={`${styles.card} ${styles.cardVolley}`}>
              <div className={styles.cardHead}>
                <span className={`${styles.cardTag} ${styles.tag_sport}`}>Sport</span>
                <span className={styles.volleyHighlight}>★ TORNEO</span>
              </div>
              <div className={styles.cardTitle}>Green Volley 3×3</div>
              <div className={styles.cardDesc}>
                Torneo di beach volley su erba — due categorie: <strong>Pro</strong> e <strong>Amatori</strong>.
                Posti limitati a 24 squadre totali.
              </div>
              <div className={styles.volleyInfo}>
                <span className={styles.volleyPrice}>15€ <small>a persona</small></span>
                <span className={styles.volleyInclude}>panino + bibita inclusi</span>
              </div>
              <button className={styles.ctaBtn} onClick={onGoVolley}>
                Iscriviti al Torneo →
              </button>
            </div>

            {/* Laser Game */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={`${styles.cardTag} ${styles.tag_fun}`}>Fun</span>
                <span className={styles.cardOra}>Durante il giorno</span>
              </div>
              <div className={styles.cardTitle}>Laser Game</div>
              <div className={styles.cardDesc}>Sfida i tuoi amici in una battaglia laser adrenalinica.</div>
            </div>

            {/* Serata DJ */}
            <div className={`${styles.card} ${styles.cardSerata}`}>
              <div className={styles.cardHead}>
                <span className={`${styles.cardTag} ${styles.tag_party}`}>Party</span>
                <span className={styles.serataOra}>dalle 21:30</span>
              </div>
              <div className={styles.serataTitle}>La Grande Festa<br />del Sabato Sera</div>
              <div className={styles.lineupLabel}>DJ SET · LINE UP</div>
              <div className={styles.lineup}>
                {DJ_LINEUP.map(a => (
                  <div key={a} className={styles.artist}>{a}</div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ════════════ DOMENICA 9 ════════════ */}
        <div className={styles.giorno}>
          <div className={styles.giornoHeader}>
            <div className={styles.giornoLabel}>
              <span className={styles.giornoNome}>Domenica</span>
              <span className={styles.giornoData}>9 Agosto</span>
            </div>
            <div className={styles.giornoLine} />
          </div>

          <div className={styles.cards}>

            {/* Lumberjack Show */}
            <div className={`${styles.card} ${styles.cardLumber}`}>
              <div className={styles.cardHead}>
                <span className={`${styles.cardTag} ${styles.tag_show}`}>Show</span>
              </div>
              <div className={styles.cardTitle}>TangherCut<br />Lumberjack Show</div>
              <div className={styles.cardDesc}>
                Forza, adrenalina e spettacolo.<br />
                Competizioni di tagli, abbattimenti e prove di abilità tra i boschi del Trentino.
              </div>
              <div className={styles.lumberBy}>
                <span className={styles.lumberByLabel}>by</span>
                <img
                  src="/giacomelli.png"
                  alt="Team Giacomelli"
                  className={styles.lumberLogo}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline' }}
                />
                <span className={styles.lumberLogoFallback} style={{ display: 'none' }}>Team Giacomelli</span>
              </div>
            </div>

            {/* Bambini */}
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <span className={`${styles.cardTag} ${styles.tag_fun}`}>Fun</span>
              </div>
              <div className={styles.cardTitle}>Animazione per Bambini</div>
              <div className={styles.cardDesc}>Giochi, animazione e divertimento per i più piccoli.</div>
            </div>

          </div>
        </div>

        {/* ════════════ INSTAGRAM CTA ════════════ */}
        <a
          href="https://www.instagram.com/tangherfest_giovanisegonzano/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.igCta}
        >
          <div className={styles.igCtaInner}>
            <svg viewBox="0 0 24 24" className={styles.igCtaIcon} fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <div>
              <div className={styles.igCtaHandle}>@tangherfest_giovanisegonzano</div>
              <div className={styles.igCtaSub}>Seguici per aggiornamenti, foto e video dell'evento</div>
            </div>
            <span className={styles.igCtaArrow}>→</span>
          </div>
        </a>

        {/* Location bar */}
        <div className={styles.locationBar}>
          <span>Loc. Doss Venticcia · Segonzano (TN) · Parcheggio gratuito in loco</span>
        </div>

      </div>
    </div>
  )
}
