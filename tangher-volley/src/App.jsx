import { useState, useRef, useEffect } from 'react'
import { fetchSquadre, subscribeSquadre } from './lib/db'
import FestivalHome from './components/FestivalHome'
import Hero        from './components/Hero'
import Navbar      from './components/Navbar'
import InfoPage    from './components/InfoPage'
import RegolePage  from './components/RegolePage'
import FormPage    from './components/FormPage'
import SquadrePage from './components/SquadrePage'
import TorneoPage  from './components/TorneoPage'
import PremiPage   from './components/PremiPage'
import Footer      from './components/Footer'
import styles      from './App.module.css'

function parseHash() {
  const h = window.location.hash.replace('#', '')
  const [v, t] = h.split('/')
  const validViews = ['festival', 'volley']
  const validTabs  = ['info', 'regole', 'iscrizione', 'squadre', 'torneo', 'premi']
  return {
    view: validViews.includes(v) ? v : 'festival',
    tab:  validTabs.includes(t)  ? t : 'info',
  }
}

export default function App() {
  const initial = parseHash()
  const [view,    setView]    = useState(initial.view)
  const [tab,     setTab]     = useState(initial.tab)
  const [squadre, setSquadre] = useState([])
  const navRef = useRef()

  // Mantieni l'hash sincronizzato con view/tab
  useEffect(() => {
    const hash = view === 'festival' ? '#festival' : `#volley/${tab}`
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash)
    }
  }, [view, tab])

  // Gestisci il tasto indietro/avanti del browser
  useEffect(() => {
    const onPop = () => {
      const { view: v, tab: t } = parseHash()
      setView(v)
      setTab(t)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

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
    window.history.pushState(null, '', '#volley/info')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const goFestival = () => {
    setView('festival')
    window.history.pushState(null, '', '#festival')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const goIscrizione = () => {
    setTab('iscrizione')
    window.history.pushState(null, '', '#volley/iscrizione')
    setTimeout(() => navRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const onSuccess  = (nuova) => setSquadre(prev => [...prev, nuova])
  const onWithdraw = (id)    => setSquadre(prev => prev.filter(s => s.id !== id))

  const changeTab = (t) => {
    setTab(t)
    window.history.pushState(null, '', `#volley/${t}`)
  }

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
            tab={tab} setTab={changeTab}
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
            {tab === 'squadre'    && <SquadrePage squadre={squadre} onCta={goIscrizione} onWithdraw={onWithdraw} />}
            {tab === 'torneo'     && <TorneoPage squadre={squadre} />}
            {tab === 'premi'      && <PremiPage />}
          </div>
          <Footer />
        </>
      )}
    </div>
  )
}
