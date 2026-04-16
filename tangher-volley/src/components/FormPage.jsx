import { useState } from 'react'
import { MAX_TESSERATI, MAX_LIBERE } from '../lib/constants'
import { validateForm } from '../lib/validators'
import { genId, mkGiocatore, initForm } from '../lib/helpers'
import { insertSquadra, uploadDoc } from '../lib/db'
import SlotBar    from './SlotBar'
import PlayerCard from './PlayerCard'
import styles     from './FormPage.module.css'

export default function FormPage({ squadre, onSuccess }) {
  const [form,   setForm]   = useState(initForm())
  const [status, setStatus] = useState('idle')   // idle | loading | success
  const [errors, setErrors] = useState({})
  const [gErrs,  setGErrs]  = useState([])

  const isTess  = form.tipo === 'tesserata'
  const tessFull = squadre.filter(s => s.tipo === 'tesserata').length >= MAX_TESSERATI
  const libFull  = squadre.filter(s => s.tipo === 'libera').length    >= MAX_LIBERE
  const curFull  = isTess ? tessFull : libFull

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setGiocatore = (idx, k, v) =>
    setForm(f => ({
      ...f,
      giocatori: f.giocatori.map((g, i) => i === idx ? { ...g, [k]: v } : g)
    }))

  const switchTipo = (t) => {
    setForm(f => ({
      ...f, tipo: t,
      giocatori: t === 'tesserata'
        ? [mkGiocatore('M'), mkGiocatore('M'), mkGiocatore('F')]
        : [mkGiocatore('M'), mkGiocatore('M'), mkGiocatore('M')]
    }))
    setErrors({})
    setGErrs([])
  }

  const handleSubmit = async () => {
    if (curFull) { setGErrs(['Posti esauriti per questa categoria.']); return }

    const { errors: errs, globals, isValid } = validateForm(form, squadre)
    setErrors(errs)
    setGErrs(globals)
    if (!isValid) return

    setStatus('loading')
    try {
      const id   = genId()
      const docs = []

      for (let i = 0; i < form.giocatori.length; i++) {
        const g = form.giocatori[i]
        if (g.fileObj) {
          const path = `docs/${id}_g${i + 1}_${g.fileName}`
          await uploadDoc(g.fileObj, path)
          docs.push(path)
        } else {
          docs.push(null)
        }
      }

      const nuova = {
        id,
        nomeSquadra: form.nomeSquadra.trim(),
        referente:   form.referente.trim(),
        email:       form.email.trim(),
        telefono:    form.telefono.trim(),
        tipo:        form.tipo,
        giocatori:   form.giocatori.map((g, i) => ({
          nome:      g.nome.trim(),
          cognome:   g.cognome.trim(),
          genere:    g.genere,
          categoria: g.categoria,
          hasDoc:    !!g.fileObj,
          doc:       docs[i],
        })),
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
        La squadra <strong>{form.nomeSquadra}</strong> è registrata ufficialmente.
      </p>
      <p className={styles.sucTxt}>
        Una conferma sarà inviata a <strong>{form.email}</strong>.
      </p>
      <button className={styles.resetBtn} onClick={() => { setForm(initForm()); setStatus('idle'); setErrors({}); setGErrs([]) }}>
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
          la <strong>categoria reale</strong> di ogni giocatore. Dichiarare una categoria inferiore
          penalizza tutti e rovina il clima di festa. <strong>Gioca leale — vinci o perdi, è sport!</strong> 🏐
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
          <strong>Regola:</strong> max 2 componenti maschili tesserati + almeno 1 componente femminile obbligatoria. Allega la tessera FIPaV per ogni tesserato.
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
            <label className={styles.lbl}>Telefono *</label>
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
        <div className={styles.cardTitle}>Giocatori</div>
        {form.giocatori.map((g, i) => (
          <PlayerCard
            key={i}
            idx={i}
            giocatore={g}
            isTesserata={isTess}
            onChange={setGiocatore}
            errors={errors}
          />
        ))}
      </div>

      {gErrs.length > 0 && (
        <div className={styles.gErr}>
          {gErrs.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
      {Object.keys(errors).length > 0 && gErrs.length === 0 && (
        <div className={styles.gErr}>Correggi i campi evidenziati prima di procedere.</div>
      )}

      <button className={styles.subBtn} onClick={handleSubmit} disabled={status === 'loading' || curFull}>
        {status === 'loading' ? 'Invio in corso...' : 'Invia Iscrizione →'}
      </button>

      <p className={styles.disc}>
        I dati saranno archiviati in modo sicuro su Supabase e utilizzati esclusivamente per il torneo.
        I documenti caricati sono riservati agli organizzatori.
      </p>
    </div>
  )
}
