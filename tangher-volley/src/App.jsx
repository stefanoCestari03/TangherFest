import { useState, useRef, useEffect } from 'react'
import { fetchSquadre, subscribeSquadre } from './lib/db'
import Hero        from './components/Hero'
import Navbar      from './components/Navbar'
import InfoPage    from './components/InfoPage'
import RegolePage  from './components/RegolePage'
import FormPage    from './components/FormPage'
import SquadrePage from './components/SquadrePage'
import Footer      from './components/Footer'
import styles      from './App.module.css'

export default function App() {
  const [tab,     setTab]     = useState('info')
  const [squadre, setSquadre] = useState([])
  const navRef = useRef()

  useEffect(() => {
    fetchSquadre().then(setSquadre).catch(console.error)
    const unsubscribe = subscribeSquadre(nuova => {
      setSquadre(prev => prev.some(s => s.id === nuova.id) ? prev : [...prev, nuova])
    })
    return unsubscribe
  }, [])

  const goIscrizione = () => {
    setTab('iscrizione')
    setTimeout(() => navRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const onSuccess = (nuova) => setSquadre(prev => [...prev, nuova])

  return (
    <div className={styles.app}>
      <div className={styles.gridBg} />
      <div className={styles.wrap}>
        <Hero squadre={squadre} onCta={goIscrizione} />
      </div>
      <Navbar tab={tab} setTab={setTab} nSquadre={squadre.length} navRef={navRef} />
      <div className={styles.wrap}>
        {tab === 'info'       && <InfoPage onCta={goIscrizione} />}
        {tab === 'regole'     && <RegolePage />}
        {tab === 'iscrizione' && <FormPage squadre={squadre} onSuccess={onSuccess} />}
        {tab === 'squadre'    && <SquadrePage squadre={squadre} onCta={goIscrizione} />}
      </div>
      <Footer />
    </div>
  )
}
