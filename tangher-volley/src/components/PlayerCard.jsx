import { CATEGORIE } from '../lib/constants'
import { validateFile } from '../lib/validators'
import { isMinorenne, calcolaEta } from '../lib/helpers'
import styles from './PlayerCard.module.css'

function UploadField({ label, fileName, fileErr, onChange, required = false }) {
  const cls = fileName ? (fileErr ? styles.upErr : styles.upOk) : ''
  return (
    <div className={styles.fg}>
      <label className={styles.lbl}>{label}{required && ' *'}</label>
      <label className={`${styles.upload} ${cls}`}>
        <span className={styles.upIcon}>📎</span>
        <span className={styles.upTxt}>
          {fileErr
            ? <><strong style={{ color: 'var(--err)' }}>✗ {fileErr}</strong><br /><small>{fileName}</small></>
            : fileName
              ? <strong style={{ color: 'var(--ok)' }}>✓ {fileName}</strong>
              : <><strong>Carica file</strong> · JPG, PNG, PDF · max 5MB</>
          }
        </span>
        <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0]
            if (!file) return
            onChange(file)
          }}
        />
      </label>
    </div>
  )
}

function CheckboxField({ id, checked, onChange, children, error }) {
  return (
    <div className={styles.checkWrap}>
      <label className={`${styles.checkLabel} ${error ? styles.checkErr : ''}`} htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          className={styles.checkbox}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
        />
        <span className={styles.checkBox}>{checked ? '✓' : ''}</span>
        <span className={styles.checkTxt}>{children}</span>
      </label>
      {error && <span className={styles.ferr}>{error}</span>}
    </div>
  )
}

export default function PlayerCard({ idx, giocatore: g, isTesserata, onChange, errors, abilitato }) {
  const isF3    = isTesserata && idx === 2
  const isMale  = isTesserata && idx < 2
  const minore  = isMinorenne(g.dataNascita)
  const eta     = calcolaEta(g.dataNascita)
  const pre     = `g${idx}`
  const fac     = idx === 3

  const set = (k, v) => onChange(idx, k, v)

  const handleFile = (file) => {
    const err = validateFile(file)
    set('fileObj', file); set('fileName', file.name); set('fileErr', err || '')
  }

  const handleTutoreFile = (file) => {
    const err = validateFile(file)
    set('tutoreFileObj', file); set('tutoreFileName', file.name); set('tutoreFileErr', err || '')
  }

  const docLabel = 'Documento di identità'

  return (
    <div className={`${styles.card} ${!abilitato ? styles.cardDisabled : ''}`}>

      {/* ── Header ── */}
      <div className={styles.head}>
        <div className={styles.num}>{idx + 1}</div>
        <div className={styles.titleRow}>
          <span className={styles.title}>
            Giocatore {idx + 1}
            {fac && <span className={styles.facTag}> (facoltativo)</span>}
          </span>
          <div className={styles.badges}>
            {isMale  && <span className={`${styles.badge} ${styles.bTess}`}>Tesserato</span>}
            {isF3    && <span className={`${styles.badge} ${styles.bFem}`}>♀ Obbligatoria</span>}
            {!isTesserata && <span className={`${styles.badge} ${styles.bLib}`}>Libero</span>}
            {abilitato && minore && <span className={`${styles.badge} ${styles.bMinore}`}>⚠ Minorenne</span>}
            {abilitato && eta !== null && !minore && <span className={`${styles.badge} ${styles.bAge}`}>{eta} anni</span>}
          </div>
        </div>
      </div>

      {fac && !abilitato && (
        <p className={styles.facHint}>Compila questo giocatore se la squadra ha un 4° membro (riserva).</p>
      )}

      {abilitato && <>

        {/* ── Dati anagrafici ── */}
        <div className={styles.sectionTitle}>Dati anagrafici</div>

        <div className={styles.row2}>
          <div className={styles.fg}>
            <label className={styles.lbl}>Nome *</label>
            <input className={`${styles.input} ${errors[`${pre}_nome`] ? styles.ef : ''}`}
              type="text" placeholder="Nome" value={g.nome}
              onChange={e => set('nome', e.target.value)} />
            {errors[`${pre}_nome`] && <span className={styles.ferr}>{errors[`${pre}_nome`]}</span>}
          </div>
          <div className={styles.fg}>
            <label className={styles.lbl}>Cognome *</label>
            <input className={`${styles.input} ${errors[`${pre}_cognome`] ? styles.ef : ''}`}
              type="text" placeholder="Cognome" value={g.cognome}
              onChange={e => set('cognome', e.target.value)} />
            {errors[`${pre}_cognome`] && <span className={styles.ferr}>{errors[`${pre}_cognome`]}</span>}
          </div>
        </div>

        <div className={styles.row2}>
          <div className={styles.fg}>
            <label className={styles.lbl}>Data di nascita *</label>
            <input className={`${styles.input} ${errors[`${pre}_data`] ? styles.ef : ''}`}
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={g.dataNascita}
              onChange={e => set('dataNascita', e.target.value)} />
            {errors[`${pre}_data`] && <span className={styles.ferr}>{errors[`${pre}_data`]}</span>}
            {minore && <span className={styles.minoreWarn}>⚠ Minorenne — richiesta autorizzazione genitore</span>}
          </div>
          <div className={styles.fg}>
            <label className={styles.lbl}>Codice Fiscale *</label>
            <input className={`${styles.input} ${errors[`${pre}_cf`] ? styles.ef : ''}`}
              type="text" placeholder="RSSMRA85T10A562S"
              maxLength={16}
              value={g.codiceFiscale}
              onChange={e => set('codiceFiscale', e.target.value.toUpperCase())} />
            {errors[`${pre}_cf`] && <span className={styles.ferr}>{errors[`${pre}_cf`]}</span>}
          </div>
        </div>

        <div className={styles.row3}>
          <div className={styles.fg}>
            <label className={styles.lbl}>Telefono *</label>
            <input className={`${styles.input} ${errors[`${pre}_tel`] ? styles.ef : ''}`}
              type="tel" placeholder="+39 333 1234567"
              value={g.telefono}
              onChange={e => set('telefono', e.target.value)} />
            {errors[`${pre}_tel`] && <span className={styles.ferr}>{errors[`${pre}_tel`]}</span>}
          </div>
          <div className={styles.fg}>
            <label className={styles.lbl}>Genere</label>
            <div className={styles.gSel}>
              {['M', 'F'].map(gn => (
                <button key={gn}
                  className={`${styles.gOpt} ${g.genere === gn ? styles.gAct : ''}`}
                  onClick={() => set('genere', gn)}
                  disabled={isF3}
                >{gn === 'M' ? 'M' : 'F'}</button>
              ))}
            </div>
          </div>
          <div className={styles.fg}>
            <label className={styles.lbl}>Categoria *</label>
            <select className={`${styles.select} ${errors[`${pre}_cat`] ? styles.ef : ''}`}
              value={g.categoria} onChange={e => set('categoria', e.target.value)}>
              {CATEGORIE.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors[`${pre}_cat`] && <span className={styles.ferr}>{errors[`${pre}_cat`]}</span>}
          </div>
        </div>

        {/* ── Documento ── */}
        <UploadField
          label={docLabel}
          fileName={g.fileName}
          fileErr={g.fileErr}
          required={isTesserata && idx < 2}
          onChange={handleFile}
        />

        {/* ── Consensi Maggiorenne ── */}
        {!minore && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Dichiarazioni e Consensi</div>

            <CheckboxField
              id={`${pre}_reg`}
              checked={g.accettaRegolamento}
              onChange={v => set('accettaRegolamento', v)}
              error={errors[`${pre}_reg`]}
            >
              Dichiaro di aver letto il <strong>Regolamento e lo Scarico di Responsabilità</strong>,
              esonerando gli organizzatori da ogni responsabilità per danni o infortuni durante il torneo.
            </CheckboxField>

            <CheckboxField
              id={`${pre}_media`}
              checked={g.consensoMedia}
              onChange={v => set('consensoMedia', v)}
            >
              <span style={{ color: 'rgba(255,255,255,.65)' }}>
                (Facoltativo) Autorizzo l'uso di <strong>foto e video</strong> che mi ritraggono
                per i canali social del torneo Tangher Fest 2026.
              </span>
            </CheckboxField>
          </div>
        )}

        {/* ── Sezione Minorenni ── */}
        {minore && (
          <div className={`${styles.section} ${styles.sectionMinore}`}>
            <div className={styles.sectionTitle}>
              <span className={styles.minoreIcon}>👨‍👧</span>
              Dati Genitore / Tutore legale
            </div>
            <p className={styles.sectionDesc}>
              Il partecipante è minorenne. È obbligatorio compilare i dati del genitore o tutore legale
              e caricare la copia del documento di identità.
            </p>

            <div className={styles.row2}>
              <div className={styles.fg}>
                <label className={styles.lbl}>Nome genitore/tutore *</label>
                <input className={`${styles.input} ${errors[`${pre}_tnome`] ? styles.ef : ''}`}
                  type="text" placeholder="Nome"
                  value={g.tutoreNome} onChange={e => set('tutoreNome', e.target.value)} />
                {errors[`${pre}_tnome`] && <span className={styles.ferr}>{errors[`${pre}_tnome`]}</span>}
              </div>
              <div className={styles.fg}>
                <label className={styles.lbl}>Cognome genitore/tutore *</label>
                <input className={`${styles.input} ${errors[`${pre}_tcog`] ? styles.ef : ''}`}
                  type="text" placeholder="Cognome"
                  value={g.tutoreCognome} onChange={e => set('tutoreCognome', e.target.value)} />
                {errors[`${pre}_tcog`] && <span className={styles.ferr}>{errors[`${pre}_tcog`]}</span>}
              </div>
            </div>

            <div className={styles.fg}>
              <label className={styles.lbl}>Codice Fiscale genitore/tutore *</label>
              <input className={`${styles.input} ${errors[`${pre}_tcf`] ? styles.ef : ''}`}
                type="text" placeholder="RSSMRA85T10A562S"
                maxLength={16}
                value={g.tutoreCF} onChange={e => set('tutoreCF', e.target.value.toUpperCase())} />
              {errors[`${pre}_tcf`] && <span className={styles.ferr}>{errors[`${pre}_tcf`]}</span>}
            </div>

            <div className={styles.fg}>
              <label className={styles.lbl}>Email genitore/tutore *</label>
              <input className={`${styles.input} ${errors[`${pre}_temail`] ? styles.ef : ''}`}
                type="email" placeholder="genitore@email.it"
                value={g.tutoreEmail} onChange={e => set('tutoreEmail', e.target.value)} />
              {errors[`${pre}_temail`] && <span className={styles.ferr}>{errors[`${pre}_temail`]}</span>}
            </div>

            <UploadField
              label="Carta d'identità genitore/tutore"
              fileName={g.tutoreFileName}
              fileErr={g.tutoreFileErr}
              required
              onChange={handleTutoreFile}
            />

            <CheckboxField
              id={`${pre}_ttut`}
              checked={g.accettaTutore}
              onChange={v => set('accettaTutore', v)}
              error={errors[`${pre}_ttut`]}
            >
              In qualità di <strong>genitore/tutore legale</strong>, autorizzo la partecipazione
              del minore al torneo e mi assumo la <strong>responsabilità legale</strong> descritta
              nel modulo di scarico di responsabilità. Dichiaro inoltre che il minore è in possesso
              di certificato medico sportivo valido.
            </CheckboxField>
          </div>
        )}

      </>}
    </div>
  )
}
