import { CATEGORIE } from '../lib/constants'
import styles from './RegolePage.module.css'

const FORMATO_STEPS = [
  { n: '1', title: 'Girone eliminatorio',   desc: 'Ogni squadra affronta le altre del suo gruppo. Le migliori avanzano al turno successivo.' },
  { n: '2', title: 'Fase a eliminazione',   desc: 'Scontri diretti — chi perde è fuori, chi vince avanza. Tutto in un set.' },
  { n: '3', title: 'Finali e premiazione',  desc: 'Le migliori si contendono il titolo. Podio e premi per i vincitori di entrambe le categorie.' },
]

const DOCUMENTI = [
  { icon: '🪪', title: 'Documento di identità',  desc: 'Obbligatorio per tutti i giocatori, caricato al momento dell\'iscrizione.' },
  { icon: '🏥', title: 'Certificato medico',      desc: 'Sportivo non agonistico valido per la pratica del volley.' },
  { icon: '📋', title: 'Tessera FIPaV',           desc: 'Solo per i giocatori tesserati — portarla al torneo.' },
  { icon: '✍️', title: 'Modulo genitore',         desc: 'Per i minorenni: firma autografa del tutore sul modulo cartaceo.' },
]

const FAQ = [
  {
    q: 'Posso giocare senza essere tesserato?',
    a: 'Sì. La categoria Libera è aperta a tutti, senza vincoli di tessera o livello.',
  },
  {
    q: 'I minorenni possono partecipare?',
    a: 'Sì, con autorizzazione del genitore o tutore legale — compilata online al momento dell\'iscrizione e confermata con firma cartacea al torneo.',
  },
  {
    q: 'Posso modificare la rosa dopo l\'iscrizione?',
    a: 'Sì, fino a 48h prima del torneo contattando direttamente gli organizzatori.',
  },
  {
    q: 'Cosa succede in caso di infortunio?',
    a: 'Ogni giocatore deve essere in possesso di certificato medico sportivo valido. Gli organizzatori non rispondono di infortuni durante il torneo.',
  },
]

export default function RegolePage() {
  return (
    <div className={styles.wrap}>

      {/* Intro */}
      <div className={styles.slabel}>Regolamento Ufficiale</div>
      <h2 className={styles.h2}>Regole del <span>Torneo</span></h2>
      <p className={styles.lead}>
        Leggi attentamente il regolamento prima di iscriverti.
        Per un torneo <strong>equo e divertente per tutti</strong> è fondamentale
        rispettare categorie e vincoli di composizione. I dati inseriti hanno valore legale.
      </p>

      {/* Composizione squadre */}
      <div className={styles.slabel}>Composizione squadre</div>
      <h2 className={styles.h2}>Chi può <span>partecipare</span></h2>

      <div className={styles.rulesGrid}>
        <div className={styles.rbox}>
          <span className={`${styles.rbadge} ${styles.rbT}`}>Tesserata</span>
          <div className={styles.rtitle}>Con pallavolisti federati</div>
          <ul className={styles.rlist}>
            <li>Tessera FIPaV obbligatoria per i tesserati</li>
            <li><strong>Max 2 componenti maschili tesserati</strong></li>
            <li><strong>Minimo 1 componente femminile</strong></li>
            <li>Documento di identità per tutti i giocatori</li>
            <li>Max 12 squadre per questa categoria</li>
          </ul>
        </div>
        <div className={styles.rbox}>
          <span className={`${styles.rbadge} ${styles.rbL}`}>Libera</span>
          <div className={styles.rtitle}>Aperta a tutti</div>
          <ul className={styles.rlist}>
            <li>Nessuna tessera federale richiesta</li>
            <li><strong>Nessun vincolo di genere</strong></li>
            <li>Aperta a tutti i livelli e età</li>
            <li>Documento di identità richiesto</li>
            <li>Max 12 squadre per questa categoria</li>
          </ul>
        </div>
      </div>

      <div className={styles.honesty}>
        <span className={styles.honestyIcon}>🤝</span>
        <div>
          <strong>Fair play</strong> — inserisci la categoria reale di ogni giocatore.
          Un torneo equilibrato è più bello per tutti. Grazie!
        </div>
      </div>

      <div className={styles.divider} />

      {/* Categorie */}
      <div className={styles.slabel}>Categorie tecniche</div>
      <h2 className={styles.h2}>I livelli di <span>gioco</span></h2>
      <p className={styles.lead}>
        Ogni giocatore deve indicare la propria <strong>categoria reale</strong>.
        Dalle categorie giovanili fino alla Serie A.
      </p>

      <div className={styles.catGrid}>
        {CATEGORIE.slice(1).map(c => (
          <div key={c.value} className={styles.catCard}>
            <span>🏅</span>
            <span className={styles.catLbl}>{c.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Formato torneo */}
      <div className={styles.slabel}>Come si gioca</div>
      <h2 className={styles.h2}>Formato del <span>torneo</span></h2>
      <p className={styles.lead}>
        Il torneo si svolge nell'arco dei <strong>tre giorni</strong> dell'evento,
        con partite su campo in erba naturale.
      </p>

      <div className={styles.steps}>
        {FORMATO_STEPS.map(s => (
          <div key={s.n} className={styles.step}>
            <div className={styles.stepNum}>{s.n}</div>
            <div>
              <div className={styles.stepTitle}>{s.title}</div>
              <div className={styles.stepDesc}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Documenti */}
      <div className={styles.slabel}>Documenti necessari</div>
      <h2 className={styles.h2}>Cosa portare al <span>torneo</span></h2>

      <div className={styles.docsGrid}>
        {DOCUMENTI.map(d => (
          <div key={d.title} className={styles.docCard}>
            <span className={styles.docIcon}>{d.icon}</span>
            <div>
              <div className={styles.docTitle}>{d.title}</div>
              <div className={styles.docDesc}>{d.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.divider} />

      {/* FAQ */}
      <div className={styles.slabel}>Domande frequenti</div>
      <h2 className={styles.h2}>FAQ</h2>

      <div className={styles.faqList}>
        {FAQ.map((f, i) => (
          <div key={i} className={styles.faqItem}>
            <div className={styles.faqQ}>{f.q}</div>
            <div className={styles.faqA}>{f.a}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
