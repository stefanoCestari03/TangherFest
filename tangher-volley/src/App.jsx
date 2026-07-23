import { useState, useRef, useEffect } from 'react'
import { fetchSquadre, subscribeSquadre } from './lib/db'
import FestivalHome from './components/FestivalHome'
import Hero        from './components/Hero'
import Navbar      from './components/Navbar'
import InfoPage    from './components/InfoPage'
import RegolePage  from './components/RegolePage'
import FormPage    from './components/FormPage'
import SquadrePage from './components/SquadrePage'
import PremiPage   from './components/PremiPage'
import Footer      from './components/Footer'
import styles      from './App.module.css'

export default function App() {
  const [view,    setView]    = useState('festival')
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

  const goVolley = () => {
    setView('volley')
    setTab('info')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const goFestival = () => {
    setView('festival')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const goIscrizione = () => {
    setTab('iscrizione')
    setTimeout(() => navRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const onSuccess = (nuova) => setSquadre(prev => [...prev, nuova])

  return (
    <div className={styles.app}>
      {view === 'festival' ? (
        <>
          <FestivalHome onGoVolley={goVolley} />
          <Footer />
        </>
      ) : (
        <>
          <div className={styles.gridBg} />
          <Hero squadre={squadre} onCta={goIscrizione} />
          <Navbar
            tab={tab} setTab={setTab}
            nSquadre={squadre.length}
            navRef={navRef}
            onBack={goFestival}
          />
          <div className={styles.wrap}>
            {tab === 'info'       && <InfoPage onCta={goIscrizione} />}
            {tab === 'regole'     && <RegolePage />}
            {tab === 'iscrizione' && <FormPage
              nTesserati={squadre.filter(s => s.tipo === 'tesserata').length}
              nLibere={squadre.filter(s => s.tipo === 'libera').length}
              onSuccess={onSuccess}
            />}
            {tab === 'squadre'    && <SquadrePage squadre={squadre} onCta={goIscrizione} />}
            {tab === 'premi'      && <PremiPage />}
          </div>
          <Footer />
        </>
      )}
    </div>
  )
}
