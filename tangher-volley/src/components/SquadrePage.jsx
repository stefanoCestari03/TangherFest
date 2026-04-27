import { useState } from 'react'
import { CAT_LABEL } from '../lib/constants'
import { formatDate } from '../lib/helpers'
import styles from './SquadrePage.module.css'
export default function SquadrePage({ squadre }) {
  const [filtro,setFiltro]=useState('tesserata')
  const filtered=squadre.filter(s=>s.tipo===filtro)
  const tC=squadre.filter(s=>s.tipo==='tesserata').length
  const lC=squadre.filter(s=>s.tipo==='libera').length
  return (
    <div className={styles.wrap}>
      <div className={styles.hype}><div className={styles.hypeTitle}>🔥 Chi c'è già al via</div><p className={styles.hypeTxt}>Le squadre si stanno iscrivendo! Guarda chi è già dentro e preparati — sarà una battaglia sul verde di Segonzano.</p></div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${filtro==='tesserata'?styles.act:''}`} onClick={()=>setFiltro('tesserata')}>Tesseratem · {tC}</button>
        <button className={`${styles.tab} ${filtro==='libera'?styles.act:''}`} onClick={()=>setFiltro('libera')}>Libere · {lC}</button>
      </div>
      {filtered.length===0
        ?<div className={styles.empty}><div className={styles.emptyIcon}>🏐</div><p>Nessuna squadra ancora. <strong>Sii il primo!</strong></p></div>
        :<div className={styles.grid}>{filtered.map((sq,i)=>(
          <div key={sq.id} className={`${styles.card} ${sq.tipo==='libera'?styles.lib:''}`}>
            <div className={styles.ord}>#{i+1}</div>
            <div className={styles.name}>{sq.nomeSquadra}</div>
            <div className={styles.ref}>Ref: {sq.referente}</div>
            <div className={styles.players}>{(sq.giocatori||[]).map((g,j)=>(
              <div key={j} className={styles.player}>
                <span className={`${styles.dot} ${g.genere==='F'?styles.dotF:sq.tipo==='libera'?styles.dotL:''}`}/>
                <span>{g.nome} {g.cognome}</span>
                <span className={styles.cat}>{CAT_LABEL[g.categoria]||g.categoria}</span>
                {g.facoltativo&&<span className={styles.fac}>riserva</span>}
              </div>
            ))}</div>
            <div className={styles.since}>Iscritto il {formatDate(sq.creato_il)}</div>
          </div>
        ))}</div>
      }
    </div>
  )
}
