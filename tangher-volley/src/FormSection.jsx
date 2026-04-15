import { useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import styles from './FormSection.module.css'

const EMPTY_PLAYER = { nome: '', cognome: '', genere: 'M', file: null, fileName: '' }

const initState = () => ({
  nomeSquadra: '',
  referente: '',
  telefono: '',
  email: '',
  tipo: 'tesserata',
  players: [
    { ...EMPTY_PLAYER },
    { ...EMPTY_PLAYER },
    { ...EMPTY_PLAYER, genere: 'F' },
  ]
})

export default function FormSection() {
  const [form, setForm] = useState(initState())
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const fileRefs = [useRef(), useRef(), useRef()]
  const sectionRef = useRef()

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const setPlayer = (idx, key, val) =>
    setForm(f => ({
      ...f,
      players: f.players.map((p, i) => i === idx ? { ...p, [key]: val } : p)
    }))

  const handleFile = (idx, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPlayer(idx, 'file', file)
    setPlayer(idx, 'fileName', file.name)
  }

  const isTesserata = form.tipo === 'tesserata'

  const validate = () => {
    if (!form.nomeSquadra.trim()) return 'Inserisci il nome della squadra'
    if (!form.referente.trim()) return 'Inserisci il referente'
    if (!form.email.trim() || !form.email.includes('@')) return 'Email non valida'
    if (!form.telefono.trim()) return 'Inserisci il telefono'
    for (let i = 0; i < 3; i++) {
      const p = form.players[i]
      if (!p.nome.trim() || !p.cognome.trim()) return `Completa i dati del giocatore ${i + 1}`
    }
    if (isTesserata) {
      const maschiTess = form.players.filter(p => p.genere === 'M').length
      const femmine = form.players.filter(p => p.genere === 'F').length
      if (maschiTess > 2) return 'Squadra tesserata: max 2 componenti maschili'
      if (femmine < 1) return 'Squadra tesserata: obbligatoria almeno 1 componente femminile'
    }
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setErrorMsg(err); return }
    setErrorMsg('')
    setStatus('loading')

    try {
      // Upload files to Supabase Storage
      const uploadedDocs = []
      for (let i = 0; i < 3; i++) {
        const file = form.players[i].file
        if (file) {
          const path = `documenti/${Date.now()}_g${i + 1}_${file.name}`
          const { error: upErr } = await supabase.storage
            .from('volley-docs')
            .upload(path, file)
          if (upErr) throw upErr
          uploadedDocs.push(path)
        } else {
          uploadedDocs.push(null)
        }
      }

      // Insert team registration
      const { error: dbErr } = await supabase.from('squadre').insert([{
        nome_squadra: form.nomeSquadra,
        referente: form.referente,
        email: form.email,
        telefono: form.telefono,
        tipo: form.tipo,
        giocatori: form.players.map((p, i) => ({
          nome: p.nome,
          cognome: p.cognome,
          genere: p.genere,
          documento: uploadedDocs[i]
        })),
        creato_il: new Date().toISOString()
      }])

      if (dbErr) throw dbErr
      setStatus('success')
    } catch (e) {
      console.error(e)
      setStatus('error')
      setErrorMsg('Errore durante l\'invio. Riprova o contattaci.')
    }
  }

  if (status === 'success') {
    return (
      <section className={styles.wrap} id="iscrizione" ref={sectionRef}>
        <div className={styles.inner}>
          <div className={styles.successBox}>
            <div className={styles.successIcon}>🏐</div>
            <div className={styles.successTitle}>Iscrizione Inviata!</div>
            <p className={styles.successText}>
              Grazie, <strong>{form.nomeSquadra}</strong>! La tua iscrizione è stata ricevuta.
              Ti contatteremo a breve all'indirizzo <strong>{form.email}</strong>.
            </p>
            <button className={styles.resetBtn} onClick={() => { setForm(initState()); setStatus('idle') }}>
              Iscriviti con un'altra squadra
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.wrap} id="iscrizione" ref={sectionRef}>
      <div className={styles.inner}>
        <div className={styles.sectionLabel}>Partecipa</div>
        <h2 className={styles.h2}>Iscrizione <span>Squadra</span></h2>
        <p className={styles.lead}>
          Compila il form con i dati della tua squadra e carica i documenti richiesti.
          Riceverai una conferma via email.
        </p>

        {/* TIPO SQUADRA */}
        <div className={styles.typeToggle}>
          <button
            className={`${styles.typeOpt} ${form.tipo === 'tesserata' ? styles.typeActive : ''}`}
            onClick={() => setField('tipo', 'tesserata')}
          >
            <span className={styles.typeLabel}>Squadra Tesserata</span>
            <span className={styles.typeSub}>Con pallavolisti federati</span>
          </button>
          <button
            className={`${styles.typeOpt} ${form.tipo === 'libera' ? styles.typeActive : ''}`}
            onClick={() => setField('tipo', 'libera')}
          >
            <span className={styles.typeLabel}>Squadra Libera</span>
            <span className={styles.typeSub}>Nessun vincolo</span>
          </button>
        </div>

        {isTesserata && (
          <div className={styles.warnBox}>
            <strong>Attenzione squadra tesserata:</strong> massimo 2 componenti maschili federati +
            obbligatoriamente almeno 1 componente femminile. Allega la tessera federale per ogni tesserato.
          </div>
        )}

        {/* DATI SQUADRA */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Dati Squadra</div>
          <div className={styles.fgroup}>
            <label className={styles.flabel}>Nome della squadra *</label>
            <input
              className={styles.finput}
              type="text"
              placeholder="Es. Aquile di Segonzano"
              value={form.nomeSquadra}
              onChange={e => setField('nomeSquadra', e.target.value)}
            />
          </div>
          <div className={styles.frow}>
            <div className={styles.fgroup}>
              <label className={styles.flabel}>Referente *</label>
              <input
                className={styles.finput}
                type="text"
                placeholder="Nome e Cognome"
                value={form.referente}
                onChange={e => setField('referente', e.target.value)}
              />
            </div>
            <div className={styles.fgroup}>
              <label className={styles.flabel}>Telefono *</label>
              <input
                className={styles.finput}
                type="tel"
                placeholder="+39 333 ..."
                value={form.telefono}
                onChange={e => setField('telefono', e.target.value)}
              />
            </div>
          </div>
          <div className={styles.fgroup}>
            <label className={styles.flabel}>Email *</label>
            <input
              className={styles.finput}
              type="email"
              placeholder="squadra@email.it"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
            />
          </div>
        </div>

        {/* GIOCATORI */}
        {form.players.map((player, idx) => {
          const isF3 = isTesserata && idx === 2
          return (
            <div key={idx} className={styles.card}>
              <div className={styles.pHead}>
                <div className={styles.pNum}>{idx + 1}</div>
                <div className={styles.cardTitle} style={{ marginBottom: 0 }}>
                  Giocatore {idx + 1}
                  {isF3 && <span className={styles.reqBadge}>Femminile obbligatorio</span>}
                  {isTesserata && idx < 2 && <span className={styles.tessBadge}>Tesserato</span>}
                </div>
              </div>

              <div className={styles.frow}>
                <div className={styles.fgroup}>
                  <label className={styles.flabel}>Nome *</label>
                  <input
                    className={styles.finput}
                    type="text"
                    placeholder="Nome"
                    value={player.nome}
                    onChange={e => setPlayer(idx, 'nome', e.target.value)}
                  />
                </div>
                <div className={styles.fgroup}>
                  <label className={styles.flabel}>Cognome *</label>
                  <input
                    className={styles.finput}
                    type="text"
                    placeholder="Cognome"
                    value={player.cognome}
                    onChange={e => setPlayer(idx, 'cognome', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fgroup}>
                <label className={styles.flabel}>Genere</label>
                <div className={styles.genderSel}>
                  {['M', 'F'].map(g => (
                    <button
                      key={g}
                      className={`${styles.gOpt} ${player.genere === g ? styles.gActive : ''}`}
                      onClick={() => setPlayer(idx, 'genere', g)}
                      disabled={isF3}
                    >
                      {g === 'M' ? 'Maschile' : 'Femminile'}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.fgroup}>
                <label className={styles.flabel}>
                  {isTesserata && idx < 2 ? 'Tessera federale (scansione) *' : 'Documento identità (scansione)'}
                </label>
                <div
                  className={styles.uploadZone}
                  onClick={() => fileRefs[idx].current?.click()}
                >
                  <span className={styles.uploadIcon}>📎</span>
                  <span className={styles.uploadTxt}>
                    {player.fileName
                      ? <><strong style={{ color: '#FF70E8' }}>✓ {player.fileName}</strong></>
                      : <><strong>Carica file</strong> o trascina qui · JPG, PNG, PDF · max 5MB</>
                    }
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileRefs[idx]}
                  style={{ display: 'none' }}
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={e => handleFile(idx, e)}
                />
              </div>
            </div>
          )
        })}

        {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Invio in corso...' : 'Invia Iscrizione →'}
        </button>

        <p className={styles.disc}>
          I dati raccolti saranno archiviati in modo sicuro su Supabase e utilizzati esclusivamente
          per l'organizzazione del torneo. I documenti caricati sono protetti e riservati agli organizzatori.
        </p>
      </div>
    </section>
  )
}
