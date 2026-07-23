import { useState, useCallback } from 'react'
import { MAX_TESSERATI, MAX_LIBERE, VERSIONE_DOCUMENTO } from '../lib/constants'
import { validateForm } from '../lib/validators'
import { genId, mkGiocatore, initForm } from '../lib/helpers'
import { insertSquadra, uploadDoc, fetchSquadreValidation } from '../lib/db'
import SlotBar    from './SlotBar'
import PlayerCard from './PlayerCard'
import styles     from './FormPage.module.css'

const sanitize = name => name.replace(/[^a-zA-Z0-9._-]/g, '_')

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

export default function FormPage({ nTesserati, nLibere, onSuccess }) {
  const [form,           setForm]          = useState(initForm())
  const [status,         setStatus]        = useState('idle')
  const [errors,         setErrors]        = useState({})
  const [gErrs,          setGErrs]         = useState([])
  const [nRiserve, setNRiserve] = useState(0)
  const [ricevutaFile,   setRicevutaFile]  = useState(null)
  const [ricevutaName,   setRicevutaName]  = useState('')
  const [ricevutaErr,    setRicevutaErr]   = useState(null)

  const isTess   = form.tipo === 'tesserata'
  const tessFull = nTesserati >= MAX_TESSERATI
  const libFull  = nLibere    >= MAX_LIBERE
  const curFull  = isTess ? tessFull : libFull

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAddRiserva = () => setNRiserve(n => Math.min(n + 1, 3))

  const handleRemoveRiserva = () => {
    const idx = 2 + nRiserve
    setForm(f => ({
      ...f,
      giocatori: f.giocatori.map((g, i) =>
        i === idx ? { ...mkGiocatore('M'), facoltativo: true } : g
      ),
    }))
    setErrors(prev => {
      const next = { ...prev }
      Object.keys(next).filter(k => k.startsWith(`g${idx}`)).forEach(k => delete next[k])
      return next
    })
    setNRiserve(n => Math.max(n - 1, 0))
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
        ? [mkGiocatore('M'), mkGiocatore('M'), mkGiocatore('F'), { ...mkGiocatore('M'), facoltativo: true }, { ...mkGiocatore('M'), facoltativo: true }, { ...mkGiocatore('M'), facoltativo: true }]
        : [mkGiocatore('M'), mkGiocatore('M'), mkGiocatore('M'), { ...mkGiocatore('M'), facoltativo: true }, { ...mkGiocatore('M'), facoltativo: true }, { ...mkGiocatore('M'), facoltativo: true }]
    }))
    setNRiserve(0)
    setErrors({})
    setGErrs([])
  }

  const handleSubmit = async () => {
    if (curFull) { setGErrs(['Posti esauriti per questa categoria.']); return }
    // Fetch fresh minimal data for duplicate validation (non espone IP/ricevute/metadati)
    const squadreValidation = await fetchSquadreValidation().catch(() => [])
    const { errors: errs, globals, isValid } = validateForm(form, squadreValidation, nRiserve, ricevutaFile)
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
        if (i >= 3 + nRiserve) { docs.push(null); continue }

        // Documento identità (PDF unico fronte+retro)
        let docPath = null
        if (g.docFileObj) {
          const path = `docs/${id}_g${i + 1}_${sanitize(g.docFileName)}`
          await uploadDoc(g.docFileObj, path)
          docPath = path
        }
        docs.push(docPath)

        // Documento tutore (se minorenne)
        if (g.tutoreFileObj) {
          const path = `docs/${id}_g${i + 1}_tutore_${sanitize(g.tutoreFileName)}`
          await uploadDoc(g.tutoreFileObj, path)
        }
      }

      // Upload ricevuta di pagamento
      let ricevutaPath = null
      if (ricevutaFile) {
        const rPath = `ricevute/${id}_ricevuta_${sanitize(ricevutaName)}`
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
          if (i >= 3 + nRiserve) return null
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
            hasDoc: !!g.docFileObj,
            doc:    docs[i] || null,
            facoltativo: i >= 3,
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
        La squadra <strong>{form.nomeSquadra}</strong> è ufficialmente iscritta al torneo Green Volley 3×3 – TangherFest 2026.
      </p>
      <p className={styles.sucTxt}>
        Puoi verificare la tua iscrizione nella sezione <strong>Squadre</strong> — se il nome compare nella lista sei dentro!
      </p>
      <div className={styles.sucNote}>
        Se nella tua squadra sono presenti <strong>minorenni</strong>, ricorda di portare
        al torneo la <strong>firma autografa sul modulo cartaceo</strong>.
      </div>
      <a href="https://chat.whatsapp.com/DODc0HK8mGo0nirlqTMlwM" target="_blank" rel="noreferrer" className={styles.waBtn}>
        <svg viewBox="0 0 24 24" className={styles.waIcon} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.547a.5.5 0 0 0 .609.61l5.79-1.474A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.735.951.983-3.648-.235-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1c5.467 0 9.9 4.433 9.9 9.9 0 5.467-4.433 9.9-9.9 9.9z"/></svg>
        Unisciti al gruppo WhatsApp del torneo
      </a>
      <button className={styles.resetBtn}
        onClick={() => { setForm(initForm()); setStatus('idle'); setErrors({}); setGErrs([]); setNRiserve(0); setRicevutaFile(null); setRicevutaName(''); setRicevutaErr(null) }}>
        Iscriviti con un'altra squadra
      </button>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.slabel}>Partecipa</div>
      <h2 className={styles.h2}>Iscrizione <span>Squadra</span></h2>

      {/* WhatsApp gruppo torneo */}
      <a href="https://chat.whatsapp.com/DODc0HK8mGo0nirlqTMlwM" target="_blank" rel="noreferrer" className={styles.waBanner}>
        <svg viewBox="0 0 24 24" className={styles.waIcon} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.526 5.845L.057 23.547a.5.5 0 0 0 .609.61l5.79-1.474A11.955 11.955 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.373l-.361-.214-3.735.951.983-3.648-.235-.374A9.86 9.86 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1c5.467 0 9.9 4.433 9.9 9.9 0 5.467-4.433 9.9-9.9 9.9z"/></svg>
        <div>
          <div className={styles.waBannerTitle}>Gruppo WhatsApp del Torneo</div>
          <div className={styles.waBannerSub}>Aggiornamenti, orari e comunicazioni ufficiali</div>
        </div>
        <span className={styles.waBannerArrow}>→</span>
      </a>

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

      <SlotBar nTesserati={nTesserati} nLibere={nLibere} />

      {/* Guida scelta tipo */}
      <div className={styles.tipoHint}>
        <div className={styles.tipoHintRow}>
          <span className={styles.tipoHintBadge}>Pro</span>
          <span className={styles.tipoHintTxt}>
            Per chi sa giocare a pallavolo a un buon livello.
            L'unico vincolo è che tra i 3 titolari ci sia <strong>almeno 1 componente femminile</strong>.
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
          <span className={styles.cardSub}>3 obbligatori · fino a 3 riserve</span>
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

        {/* Riserve facoltative */}
        {nRiserve > 0 && Array.from({ length: nRiserve }, (_, k) => k + 3).map(i => (
          <PlayerCard
            key={i}
            idx={i}
            giocatore={form.giocatori[i]}
            isTesserata={isTess}
            onChange={setGiocatore}
            errors={errors}
            abilitato={true}
          />
        ))}

        {/* Controlli riserve */}
        <div className={styles.riserveRow}>
          {nRiserve > 0 && (
            <button type="button" className={styles.removeRiservaBtn} onClick={handleRemoveRiserva}>
              − Rimuovi riserva
            </button>
          )}
          {nRiserve < 3 && (
            <button type="button" className={styles.addRiservaBtn} onClick={handleAddRiserva}>
              + Riserva ({3 + nRiserve + 1}° giocatore)
            </button>
          )}
        </div>
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
            {[3, 4, 5, 6].map(n => (
              <div key={n} className={styles.payOpt}>
                <span className={styles.payOptPlayers}>{n} giocatori{n === 3 ? ' (minimo)' : ''}</span>
                <span className={styles.payOptArrow}>→</span>
                <span className={styles.payOptTotal}>{n * 15}€ totali</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.ibanBlock}>
          <div className={styles.ibanLabel}>Bonifico bancario</div>
          <div className={styles.ibanBenef}>Beneficiario: <strong>Giovani Segonzano</strong></div>
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
