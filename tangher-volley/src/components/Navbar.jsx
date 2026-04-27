import styles from './Navbar.module.css'
const TABS=[{id:'info',label:'Info'},{id:'regole',label:'Regole'},{id:'iscrizione',label:'Iscriviti'},{id:'squadre',label:'Squadre'}]
export default function Navbar({tab,setTab,nSquadre,navRef}){
  return(
    <nav className={styles.nav} ref={navRef}>
      <div className={styles.inner}>
        {TABS.map(t=>(
          <button key={t.id} className={`${styles.tab} ${tab===t.id?styles.act:''}`} onClick={()=>setTab(t.id)}>
            {t.label}
            {t.id==='squadre'&&nSquadre>0&&<span className={styles.badge}>{nSquadre}</span>}
          </button>
        ))}
      </div>
    </nav>
  )
}
