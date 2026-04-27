import { CATEGORIE } from '../lib/constants'
import styles from './InfoPage.module.css'
export default function InfoPage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.slabel}>Il Torneo</div>
      <h2 className={styles.h2}>Green Volley <span>3×3</span></h2>
      <p className={styles.lead}>Benvenuti al torneo di <strong>Green Volley 3×3</strong> della Tangher Fest 2026! Una competizione su erba verde aperta a tutti — tesserati e non. Tre giorni di sport, musica e festa nel cuore della Val di Cembra.</p>
      <div className={styles.infoGrid}>
        {[{i:'📅',l:'Date',v:'8 · 9 · 10 Agosto 2026'},{i:'📍',l:'Luogo',v:'Loc. Doss Venticcia, Segonzano'},{i:'🏐',l:'Formato',v:'3 contro 3 su erba'},{i:'👥',l:'Max squadre',v:'12 Tesseratem + 12 Libere'}].map(x=>(
          <div key={x.l} className={styles.icard}><span className={styles.iicon}>{x.i}</span><div><div className={styles.ilbl}>{x.l}</div><div className={styles.ival}>{x.v}</div></div></div>
        ))}
      </div>
      <div className={styles.divider}/>
      <div className={styles.slabel}>Regolamento</div>
      <h2 className={styles.h2}>Composizione <span>Squadre</span></h2>
      <p className={styles.lead}>Ogni team è composto da <strong>3 giocatori obbligatori</strong> + 1 riserva facoltativa.</p>
      <div className={styles.rulesGrid}>
        <div className={styles.rbox}>
          <span className={`${styles.rbadge} ${styles.rbT}`}>Tesserata</span>
          <div className={styles.rtitle}>Con pallavolisti federati</div>
          <ul className={styles.rlist}><li>Tessera FIPaV obbligatoria</li><li><strong>Max 2 uomini tesserati</strong></li><li><strong>Min 1 componente femminile</strong></li><li>Allegare tessera federale</li><li>Max 12 squadre</li></ul>
        </div>
        <div className={styles.rbox}>
          <span className={`${styles.rbadge} ${styles.rbL}`}>Libera</span>
          <div className={styles.rtitle}>Senza tesserati</div>
          <ul className={styles.rlist}><li>Nessuna tessera richiesta</li><li><strong>Nessun vincolo di genere</strong></li><li>Aperta a tutti</li><li>Documento identità richiesto</li><li>Max 12 squadre</li></ul>
        </div>
      </div>
      <div className={styles.divider}/>
      <div className={styles.slabel}>Categorie</div>
      <h2 className={styles.h2}>I livelli di <span>Gioco</span></h2>
      <p className={styles.lead}>Inserisci la categoria reale — garantisce un torneo <strong>equilibrato e divertente</strong>.</p>
      <div className={styles.catGrid}>
        {CATEGORIE.slice(1).map(c=><div key={c.value} className={styles.catCard}><span>🏅</span><span className={styles.catLbl}>{c.label}</span></div>)}
      </div>
    </div>
  )
}
