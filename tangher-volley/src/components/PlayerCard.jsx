import { CATEGORIE } from '../lib/constants'
import { validateFile } from '../lib/validators'
import styles from './PlayerCard.module.css'

export default function PlayerCard({ idx, giocatore, isTesserata, onChange, errors }) {
  const isF3   = isTesserata && idx === 2
  const isMale = isTesserata && idx < 2

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateFile(file)
    onChange(idx, 'fileObj',  file)
    onChange(idx, 'fileName', file.name)
    onChange(idx, 'fileErr',  err || '')
  }

  const docLabel = isTesserata && idx < 2 ? 'Tessera federale *' : 'Documento identità'

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.num}>{idx + 1}</div>
        <div className={styles.title}>
          Giocatore {idx + 1}
          {isMale && <span className={`${styles.badge} ${styles.tess}`}>Tesserato</span>}
          {isF3   && <span className={`${styles.badge} ${styles.fem}`}>♀ Obbligatoria</span>}
          {!isTesserata && <span className={`${styles.badge} ${styles.lib}`}>Libero</span>}
        </div>
      </div>

      {/* Nome / Cognome */}
      <div className={styles.row2}>
        <div className={styles.fg}>
          <label className={styles.lbl}>Nome *</label>
          <input
            className={`${styles.input} ${errors[`g${idx}_nome`] ? styles.errField : ''}`}
            type="text" placeholder="Nome"
            value={giocatore.nome}
            onChange={e => onChange(idx, 'nome', e.target.value)}
          />
          {errors[`g${idx}_nome`] && <span className={styles.ferr}>{errors[`g${idx}_nome`]}</span>}
        </div>
        <div className={styles.fg}>
          <label className={styles.lbl}>Cognome *</label>
          <input
            className={`${styles.input} ${errors[`g${idx}_cognome`] ? styles.errField : ''}`}
            type="text" placeholder="Cognome"
            value={giocatore.cognome}
            onChange={e => onChange(idx, 'cognome', e.target.value)}
          />
          {errors[`g${idx}_cognome`] && <span className={styles.ferr}>{errors[`g${idx}_cognome`]}</span>}
        </div>
      </div>

      {/* Genere / Categoria */}
      <div className={styles.row2}>
        <div className={styles.fg}>
          <label className={styles.lbl}>Genere</label>
          <div className={styles.gSel}>
            {['M', 'F'].map(g => (
              <button
                key={g}
                className={`${styles.gOpt} ${giocatore.genere === g ? styles.gAct : ''}`}
                onClick={() => onChange(idx, 'genere', g)}
                disabled={isF3}
              >
                {g === 'M' ? 'Maschile' : 'Femminile'}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.fg}>
          <label className={styles.lbl}>Categoria *</label>
          <select
            className={`${styles.select} ${errors[`g${idx}_cat`] ? styles.errField : ''}`}
            value={giocatore.categoria}
            onChange={e => onChange(idx, 'categoria', e.target.value)}
          >
            {CATEGORIE.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {errors[`g${idx}_cat`] && <span className={styles.ferr}>{errors[`g${idx}_cat`]}</span>}
        </div>
      </div>

      {/* Upload */}
      <div className={styles.fg}>
        <label className={styles.lbl}>{docLabel}</label>
        <label className={`${styles.upload} ${giocatore.fileName ? (giocatore.fileErr ? styles.upErr : styles.upOk) : ''}`}>
          <span className={styles.upIcon}>📎</span>
          <span className={styles.upTxt}>
            {giocatore.fileErr
              ? <><strong style={{ color: 'var(--err)' }}>✗ {giocatore.fileErr}</strong><br /><small>{giocatore.fileName}</small></>
              : giocatore.fileName
                ? <strong style={{ color: 'var(--ok)' }}>✓ {giocatore.fileName}</strong>
                : <><strong>Carica file</strong> · JPG, PNG, PDF · max 5MB</>
            }
          </span>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }} onChange={handleFile} />
        </label>
      </div>
    </div>
  )
}
