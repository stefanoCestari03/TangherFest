import { useState, useCallback } from 'react'
import { MAX_TESSERATI, MAX_LIBERE, VERSIONE_DOCUMENTO } from '../lib/constants'
import { validateForm } from '../lib/validators'
import { genId, mkGiocatore, initForm } from '../lib/helpers'
import { insertSquadra, uploadDoc } from '../lib/db'
import SlotBar    from './SlotBar'
import PlayerCard from './PlayerCard'
import styles     from './FormPage.module.css'

function IbanCopyBtn() {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText('IT04Z0830435450000068731087').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    })
  }, [])
  return (
    <button
      type="button"
      className={copied ? `${styles.ibanCopyBtn} ${styles.ibanCopyBtnOk}` : styles.ibanCopyBtn}
      onClick={handleCopy}
    >
      {copied ? '✓ Copiato!' : 'Copia IBAN'}
    </button>
  )
}

export default function FormPage({ squadre, onSuccess }) {
  const [form,           setForm]          = useState(initForm())
  const [status,         setStatus]        = useState('idle')
  const [errors,         setErrors]        = useState({})
  const [gErrs,          setGErrs]         = useState([])
  const [aggiungiQuarto, setAggiungiQuarto] = useState(false)
  const [ricevutaFile,   setRicevutaFile]  = useState(null)
  const [ricevutaName,   setRicevutaName]  = useState('')
  const [ricevutaErr,    setRicevutaErr]   = useState(null)

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
    const { errors: errs, globals, isValid } = validateForm(form, squadre, aggiungiQuarto, ricevutaFile)
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

      // Upload ricevuta di pagamento
      let ricevutaPath = null
      if (ricevutaFile) {
        const rPath = `ricevute/${id}_ricevuta_${ricevutaName}`
        await uploadDoc(ricevutaFile, rPath)
        ricevutaPath = rPath
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
        ricevutaPath,
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
      <div className={styles.sucTitle}>Iscrizione Confermata!</div>
      <p className={styles.sucTxt}>
        La squadra <strong>{form.nomeSquadra}</strong> è ufficialmente iscritta al torneo.
      </p>
      <p className={styles.sucTxt}>
        Una conferma sarà inviata a <strong>{form.email}</strong>.
      </p>
      <div className={styles.sucNote}>
        Se nella tua squadra sono presenti <strong>minorenni</strong>, ricorda di portare
        al torneo la <strong>firma autografa sul modulo cartaceo</strong>.
      </div>
      <button className={styles.resetBtn}
        onClick={() => { setForm(initForm()); setStatus('idle'); setErrors({}); setGErrs([]); setAggiungiQuarto(false); setRicevutaFile(null); setRicevutaName(''); setRicevutaErr(null) }}>
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
        <div className={styles.honestyTitle}>Un appello all'onestà</div>
        <p className={styles.honestyTxt}>
          Per un torneo <strong>divertente ed equilibrato</strong>, ti chiediamo di inserire
          la <strong>categoria reale</strong> di ogni giocatore con dati veritieri.
          I dati inseriti hanno valore legale per i consensi firmati digitalmente.
          <strong> Gioca leale!</strong>
        </p>
      </div>

      <SlotBar squadre={squadre} />

      {/* Guida scelta tipo */}
      <div className={styles.tipoHint}>
        <div className={styles.tipoHintRow}>
          <span className={styles.tipoHintBadge}>Pro</span>
          <span className={styles.tipoHintTxt}>
            Per chi sa giocare a pallavolo — <strong>con o senza tessera FIPaV</strong>.
            L'unico vincolo è che tra i 3 titolari ci sia <strong>almeno 1 componente femminile</strong>.
            I tesserati FIPaV rientrano obbligatoriamente in questa categoria.
          </span>
        </div>
        <div className={styles.tipoHintRow}>
          <span className={`${styles.tipoHintBadge} ${styles.tipoHintBadgeLib}`}>Amatori</span>
          <span className={styles.tipoHintTxt}>
            Per chi gioca per divertimento o si avvicina alla pallavolo per la prima volta.
            <strong> Nessun vincolo di genere</strong>, aperta a tutti i livelli.
          </span>
        </div>
      </div>

      {/* Tipo squadra */}
      <div className={styles.toggle}>
        <button
          className={`${styles.topt} ${form.tipo === 'tesserata' ? styles.tSel : ''} ${tessFull ? styles.tDis : ''}`}
          onClick={() => !tessFull && switchTipo('tesserata')}
        >
          <span className={styles.tLbl}>Categoria Pro</span>
          <span className={styles.tSub}>{tessFull ? 'Posti esauriti' : '1 ragazza obbligatoria tra i titolari'}</span>
        </button>
        <button
          className={`${styles.topt} ${form.tipo === 'libera' ? styles.tSel : ''} ${libFull ? styles.tDis : ''}`}
          onClick={() => !libFull && switchTipo('libera')}
        >
          <span className={styles.tLbl}>Categoria Amatori</span>
          <span className={styles.tSub}>{libFull ? 'Posti esauriti' : 'Nessun vincolo'}</span>
        </button>
      </div>

      {isTess && (
        <div className={styles.warn}>
          <strong>Regola Pro:</strong> tra i 3 titolari è obbligatoria almeno 1 componente femminile (max 2 maschi).
          La riserva (4° giocatore) è libera senza vincoli di genere.
          Se hai giocatori con tessera FIPaV, allega la loro tessera.
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

      {/* Pagamento */}
      <div className={styles.card}>
        <div className={styles.cardTitle}>Quota di Partecipazione</div>

        <div className={styles.payPricing}>
          <div className={styles.payPerPerson}>
            <span className={styles.payAmount}>15€</span>
            <span className={styles.payUnit}>a persona</span>
          </div>
          <div className={styles.payOptions}>
            <div className={styles.payOpt}>
              <span className={styles.payOptPlayers}>4 giocatori</span>
              <span className={styles.payOptArrow}>→</span>
              <span className={styles.payOptTotal}>60€ totali</span>
            </div>
            <div className={styles.payOpt}>
              <span className={styles.payOptPlayers}>3 giocatori (minimo)</span>
              <span className={styles.payOptArrow}>→</span>
              <span className={styles.payOptTotal}>45€ totali</span>
            </div>
          </div>
        </div>

        <div className={styles.ibanBlock}>
          <div className={styles.ibanLabel}>Bonifico bancario all'associazione</div>
          <div className={styles.ibanRow}>
            <div className={styles.ibanCode}>IT04Z0830435450000068731087</div>
            <IbanCopyBtn />
          </div>
          <div className={styles.ibanHint}>Causale: <strong>iscrizione-NomeSquadra-tangherVolley2026</strong></div>
        </div>

        <div className={styles.contattiBlock}>
          <div className={styles.contattiLabel}>Contatti organizzatori</div>
          <a href="tel:+393477208122" className={styles.contattoRow}>Gabriele Magro · 347 720 8122</a>
          <a href="tel:+393284743223" className={styles.contattoRow}>Stefano Cestari · 328 474 3223</a>
        </div>

        <div className={styles.payIncluded}>
          La quota include una <strong>bibita</strong> e un <strong>panino</strong> per ogni partecipante.
        </div>

        <div className={styles.fg}>
          <label className={styles.lbl}>Ricevuta di pagamento (PDF) *</label>
          <label className={`${styles.upload} ${ricevutaName ? (ricevutaErr ? styles.uploadErr : styles.uploadOk) : ''} ${errors.ricevuta && !ricevutaName ? styles.uploadEf : ''}`}>
            <span className={styles.upTxt}>
              {ricevutaErr
                ? <><strong style={{ color: 'var(--err)' }}>✗ {ricevutaErr}</strong><br /><small>{ricevutaName}</small></>
                : ricevutaName
                  ? <strong style={{ color: 'var(--ok)' }}>✓ {ricevutaName}</strong>
                  : <><strong>Carica ricevuta PDF</strong> · Solo PDF · max 5MB</>
              }
            </span>
            <input type="file" accept=".pdf" style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const err = file.type !== 'application/pdf'
                  ? 'Solo PDF accettato'
                  : file.size > 5 * 1024 * 1024
                    ? 'File troppo grande. Max 5MB.'
                    : null
                setRicevutaFile(file)
                setRicevutaName(file.name)
                setRicevutaErr(err)
              }}
            />
          </label>
          {errors.ricevuta && <span className={styles.ferr}>{errors.ricevuta}</span>}
        </div>
      </div>

      {gErrs.length > 0 && (
        <div className={styles.gErr}>
          {gErrs.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
      {Object.keys(errors).length > 0 && gErrs.length === 0 && (
        <div className={styles.gErr}>Correggi i campi evidenziati in rosso prima di procedere.</div>
      )}

      <button className={styles.subBtn}
        onClick={handleSubmit}
        disabled={status === 'loading' || curFull}
      >
        {status === 'loading' ? 'Invio in corso...' : 'Invia Iscrizione →'}
      </button>

      <p className={styles.disc}>
        I dati raccolti, inclusi i consensi digitali (timestamp, IP, versione documento),
        sono archiviati in modo sicuro su Supabase e utilizzati esclusivamente per il torneo
        e gli obblighi legali connessi. I documenti caricati sono riservati agli organizzatori.
      </p>
    </div>
  )
}
