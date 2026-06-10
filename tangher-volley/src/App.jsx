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
  const [view,    setView]    = useState('festival')  // 'festival' | 'volley'
  const [tab,     setTab]     = useState('info')
  const [squadre, setSquadre] = useState([])
  const [musicOn,  setMusicOn]  = useState(true)
  const [showHint, setShowHint] = useState(false)
  const navRef   = useRef()
  const audioRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    fetchSquadre().then(setSquadre).catch(console.error)
    const unsubscribe = subscribeSquadre(nuova => {
      setSquadre(prev => prev.some(s => s.id === nuova.id) ? prev : [...prev, nuova])
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.18

    const onPlay = () => {
      setMusicOn(true)
      setShowHint(true)
      setTimeout(() => setShowHint(false), 5000)
    }

    const tryPlay = () => {
      if (startedRef.current) return
      startedRef.current = true
      audio.play().then(onPlay).catch(() => {})
      document.removeEventListener('click',      tryPlay)
      document.removeEventListener('touchstart', tryPlay)
    }

    audio.play().then(onPlay).catch(() => {
      document.addEventListener('click',      tryPlay)
      document.addEventListener('touchstart', tryPlay)
    })

    return () => {
      document.removeEventListener('click',      tryPlay)
      document.removeEventListener('touchstart', tryPlay)
    }
  }, [])

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (musicOn) { audio.pause(); setMusicOn(false) }
    else         { audio.play();  setMusicOn(true)  }
  }

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
      <audio ref={audioRef} src="/audio/tangher.mp3" loop />

      {view === 'festival' ? (
        <>
          <FestivalHome onGoVolley={goVolley} />
          <Footer />
        </>
      ) : (
        <>
          <div className={styles.gridBg} />
          <div className={styles.wrap}>
            <Hero squadre={squadre} onCta={goIscrizione} />
          </div>
          <Navbar
            tab={tab} setTab={setTab}
            nSquadre={squadre.length}
            navRef={navRef}
            onBack={goFestival}
          />
          <div className={styles.wrap}>
            {tab === 'info'       && <InfoPage onCta={goIscrizione} />}
            {tab === 'regole'     && <RegolePage />}
            {tab === 'iscrizione' && <FormPage squadre={squadre} onSuccess={onSuccess} />}
            {tab === 'squadre'    && <SquadrePage squadre={squadre} onCta={goIscrizione} />}
            {tab === 'premi'      && <PremiPage />}
          </div>
          <Footer />
        </>
      )}

      <button
        className={`${styles.musicBtn} ${musicOn ? styles.musicOn : ''}`}
        onClick={toggleMusic}
        title={musicOn ? 'Pausa musica' : 'Riproduci musica'}
      >
        {musicOn ? '🔊' : '🔇'}
      </button>

      {showHint && (
        <div className={styles.musicHint}>
          🎵 Alza il volume per sentire la musica!
        </div>
      )}
    </div>
  )
}
