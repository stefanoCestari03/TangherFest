import { useState } from 'react'
import { MAX_TESSERATI, MAX_LIBERE, VERSIONE_DOCUMENTO } from '../lib/constants'
import { validateForm } from '../lib/validators'
import { genId, mkGiocatore, initForm } from '../lib/helpers'
import { insertSquadra, uploadDoc } from '../lib/db'
import SlotBar    from './SlotBar'
import PlayerCard from './PlayerCard'
import styles     from './FormPage.module.css'

export default function FormPage({ squadre, onSuccess }) {
  const [form,           setForm]          = useState(initForm())
  const [status,         setStatus]        = useState('idle')
  const [errors,         setErrors]        = useState({})
  const [gErrs,          setGErrs]         = useState([])
  const [aggiungiQuarto, setAggiungiQuarto] = useState(false)

  const isTess   = form.tipo === 'tesserata'
  const tessFull = squadre.filter(s => s.tipo === 'tesserata').length >= MAX_TESSERATI
  const libFull  = squadre.filter(s => s.tipo === 'libera').length    >= MAX_LIBERE
  const curFull  = isTess ? tessFull : libFull

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleToggleQuarto = (e) => {
    const on = e.target.checked
    setAggiungiQuarto(on)
    if (!on) {
      setForm(f => ({
        ...f,
        giocatori: f.giocatori.map((g, i) =>
          i === 3 ? { ...mkGiocatore('M'), facoltativo: true } : g
        ),
      }))
      // Pulisce eventuali errori del 4° giocatore
      setErrors(prev => {
        const next = { ...prev }
        Object.keys(next).filter(k => k.startsWith('g3')).forEach(k => delete next[k])
        return next
      })
    }
  }

  const setGiocatore = (idx, k, v) =>
    setForm(f => ({
      ...f,
      giocatori: f.giocatori.map((g, i) => i === idx ? { ...g, [k]: v } : g)
    }))

  const switchTipo = (t) => {
    setForm(f => ({
      ...f, tipo: t,
      giocatori: t === 'tesserata'
        ? [mkGiocatore('M'), mkGiocatore('M'), mkGiocatore('F'), { ...mkGiocatore('M'), facoltativo: true }]
        : [mkGiocatore('M'), mkGiocatore('M'), mkGiocatore('M'), { ...mkGiocatore('M'), facoltativo: true }]
    }))
    setAggiungiQuarto(false)
    setErrors({})
    setGErrs([])
  }

  const handleSubmit = async () => {
    if (curFull) { setGErrs(['Posti esauriti per questa categoria.']); return }
    const { errors: errs, globals, isValid } = validateForm(form, squadre, aggiungiQuarto)
    setErrors(errs)
    setGErrs(globals)
    if (!isValid) {
      // Scroll al primo errore
      setTimeout(() => {
        const el = document.querySelector('[class*="ef"], [class*="checkErr"]')
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      return
    }

    setStatus('loading')
    try {
      const id   = genId()
      const docs = []

      for (let i = 0; i < form.giocatori.length; i++) {
        const g = form.giocatori[i]
        if (i === 3 && !aggiungiQuarto) { docs.push(null); continue }

        // Documento principale
        if (g.fileObj) {
          const path = `docs/${id}_g${i + 1}_${g.fileName}`
          await uploadDoc(g.fileObj, path)
          docs.push(path)
        } else {
          docs.push(null)
        }

        // Documento tutore (se minorenne)
        if (g.tutoreFileObj) {
          const path = `docs/${id}_g${i + 1}_tutore_${g.tutoreFileName}`
          await uploadDoc(g.tutoreFileObj, path)
        }
      }

      // Raccoglie IP (best-effort, fallback stringa vuota)
      let ipAddress = ''
      try {
        const res = await fetch('https://api.ipify.org?format=json')
        const d   = await res.json()
        ipAddress = d.ip || ''
      } catch (_) {}

      const nuova = {
        id,
        nomeSquadra:       form.nomeSquadra.trim(),
        referente:         form.referente.trim(),
        email:             form.email.trim(),
        telefono:          form.telefono.trim(),
        tipo:              form.tipo,
        giocatori: form.giocatori.map((g, i) => {
          if (i === 3 && !aggiungiQuarto) return null
          return {
            nome:           g.nome.trim(),
            cognome:        g.cognome.trim(),
            dataNascita:    g.dataNascita,
            codiceFiscale:  g.codiceFiscale.trim().toUpperCase(),
            telefono:       g.telefono.trim(),
            genere:         g.genere,
            categoria:      g.categoria,
            minorenne:      !!(g.dataNascita && new Date().getFullYear() - new Date(g.dataNascita).getFullYear() < 18),
            accettaRegolamento: g.accettaRegolamento,
            consensoMedia:      g.consensoMedia,
            tutore: g.tutoreNome ? {
              nome:     g.tutoreNome.trim(),
              cognome:  g.tutoreCognome.trim(),
              cf:       g.tutoreCF.trim().toUpperCase(),
              email:    g.tutoreEmail.trim(),
              hasDoc:   !!g.tutoreFileObj,
            } : null,
            hasDoc: !!g.fileObj,
            doc:    docs[i],
            facoltativo: i === 3,
          }
        }).filter(Boolean),
        // Metadati legali
        metadati: {
          timestamp:         new Date().toISOString(),
          ipAddress,
          versioneDocumento: VERSIONE_DOCUMENTO,
          userAgent:         navigator.userAgent,
        },
        creato_il: new Date().toISOString(),
      }

      await insertSquadra(nuova)
      onSuccess(nuova)
      setStatus('success')
    } catch (e) {
      console.error(e)
      setGErrs(['Errore durante l\'invio. Riprova o contattaci direttamente.'])
      setStatus('idle')
    }
  }

  if (status === 'success') return (
    <div className={styles.success}>
      <div className={styles.sucIcon}>🏐</div>
      <div className={styles.sucTitle}>Iscrizione Confermata!</div>
      <p className={styles.sucTxt}>
        La squadra <strong>{form.nomeSquadra}</strong> è ufficialmente iscritta al torneo.
      </p>
      <p className={styles.sucTxt}>
        Una conferma sarà inviata a <strong>{form.email}</strong>.
      </p>
      <div className={styles.sucNote}>
        ℹ️ Se nella tua squadra sono presenti <strong>minorenni</strong>, ricorda di portare
        al torneo la <strong>firma autografa sul modulo cartaceo</strong>.
      </div>
      <button className={styles.resetBtn}
        onClick={() => { setForm(initForm()); setStatus('idle'); setErrors({}); setGErrs([]); setAggiungiQuarto(false) }}>
        Iscriviti con un'altra squadra
      </button>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.slabel}>Partecipa</div>
      <h2 className={styles.h2}>Iscrizione <span>Squadra</span></h2>

      {/* Honesty banner */}
      <div className={styles.honesty}>
        <div className={styles.honestyIcon}>🤝</div>
        <div className={styles.honestyTitle}>Un appello all'onestà</div>
        <p className={styles.honestyTxt}>
          Per un torneo <strong>divertente ed equilibrato</strong>, ti chiediamo di inserire
          la <strong>categoria reale</strong> di ogni giocatore con dati veritieri.
          I dati inseriti hanno valore legale per i consensi firmati digitalmente.
          <strong> Gioca leale!</strong> 🏐
        </p>
      </div>

      <SlotBar squadre={squadre} />

      {/* Tipo squadra */}
      <div className={styles.toggle}>
        <button
          className={`${styles.topt} ${form.tipo === 'tesserata' ? styles.tSel : ''} ${tessFull ? styles.tDis : ''}`}
          onClick={() => !tessFull && switchTipo('tesserata')}
        >
          <span className={styles.tLbl}>Squadra Tesserata</span>
          <span className={styles.tSub}>{tessFull ? '⚠ Posti esauriti' : 'Con pallavolisti federati'}</span>
        </button>
        <button
          className={`${styles.topt} ${form.tipo === 'libera' ? styles.tSel : ''} ${libFull ? styles.tDis : ''}`}
          onClick={() => !libFull && switchTipo('libera')}
        >
          <span className={styles.tLbl}>Squadra Libera</span>
          <span className={styles.tSub}>{libFull ? '⚠ Posti esauriti' : 'Nessun vincolo'}</span>
        </button>
      </div>

      {isTess && (
        <div className={styles.warn}>
          <strong>Regola:</strong> max 2 componenti maschili tesserati + almeno 1 componente
          femminile obbligatoria. Allega la tessera FIPaV per i tesserati.
        </div>
      )}

      {/* Dati squadra */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Dati Squadra</div>
        <div className={styles.fg}>
          <label className={styles.lbl}>Nome della squadra *</label>
          <input className={`${styles.input} ${errors.nomeSquadra ? styles.ef : ''}`}
            type="text" placeholder="Es. Aquile di Segonzano"
            value={form.nomeSquadra} onChange={e => setField('nomeSquadra', e.target.value)} />
          {errors.nomeSquadra && <span className={styles.ferr}>{errors.nomeSquadra}</span>}
        </div>
        <div className={styles.row2}>
          <div className={styles.fg}>
            <label className={styles.lbl}>Referente *</label>
            <input className={`${styles.input} ${errors.referente ? styles.ef : ''}`}
              type="text" placeholder="Nome e Cognome"
              value={form.referente} onChange={e => setField('referente', e.target.value)} />
            {errors.referente && <span className={styles.ferr}>{errors.referente}</span>}
          </div>
          <div className={styles.fg}>
            <label className={styles.lbl}>Telefono squadra *</label>
            <input className={`${styles.input} ${errors.telefono ? styles.ef : ''}`}
              type="tel" placeholder="+39 333 ..."
              value={form.telefono} onChange={e => setField('telefono', e.target.value)} />
            {errors.telefono && <span className={styles.ferr}>{errors.telefono}</span>}
          </div>
        </div>
        <div className={styles.fg}>
          <label className={styles.lbl}>Email *</label>
          <input className={`${styles.input} ${errors.email ? styles.ef : ''}`}
            type="email" placeholder="squadra@email.it"
            value={form.email} onChange={e => setField('email', e.target.value)} />
          {errors.email && <span className={styles.ferr}>{errors.email}</span>}
        </div>
      </div>

      {/* Giocatori */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Giocatori
          <span className={styles.cardSub}>3 obbligatori · 1 facoltativo (riserva)</span>
        </div>

        {form.giocatori.slice(0, 3).map((g, i) => (
          <PlayerCard
            key={i}
            idx={i}
            giocatore={g}
            isTesserata={isTess}
            onChange={setGiocatore}
            errors={errors}
            abilitato={true}
          />
        ))}

        {/* Toggle 4° giocatore */}
        <div className={`${styles.addFourthWrap} ${aggiungiQuarto ? styles.addFourthActive : ''}`}>
          <label className={styles.addFourthLabel}>
            <input
              type="checkbox"
              className={styles.addFourthCheck}
              checked={aggiungiQuarto}
              onChange={handleToggleQuarto}
            />
            <span className={`${styles.addFourthBox} ${aggiungiQuarto ? styles.addFourthBoxOn : ''}`}>
              {aggiungiQuarto ? '✓' : '+'}
            </span>
            <div>
              <span className={styles.addFourthTitle}>Aggiungi 4° giocatore</span>
              <span className={styles.addFourthSub}> — riserva facoltativa</span>
            </div>
          </label>
        </div>

        {aggiungiQuarto && (
          <PlayerCard
            idx={3}
            giocatore={form.giocatori[3]}
            isTesserata={isTess}
            onChange={setGiocatore}
            errors={errors}
            abilitato={true}
          />
        )}
      </div>

      {gErrs.length > 0 && (
        <div className={styles.gErr}>
          {gErrs.map((e, i) => <div key={i}>⚠ {e}</div>)}
        </div>
      )}
      {Object.keys(errors).length > 0 && gErrs.length === 0 && (
        <div className={styles.gErr}>⚠ Correggi i campi evidenziati in rosso prima di procedere.</div>
      )}

      <button className={styles.subBtn}
        onClick={handleSubmit}
        disabled={status === 'loading' || curFull}
      >
        {status === 'loading' ? '⏳ Invio in corso...' : 'Invia Iscrizione →'}
      </button>

      <p className={styles.disc}>
        I dati raccolti, inclusi i consensi digitali (timestamp, IP, versione documento),
        sono archiviati in modo sicuro su Supabase e utilizzati esclusivamente per il torneo
        e gli obblighi legali connessi. I documenti caricati sono riservati agli organizzatori.
      </p>
    </div>
  )
}
