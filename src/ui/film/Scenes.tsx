// Les cinq scènes du film. Chaque geste est un repère dans la chronologie de sa scène (variables
// CSS --d pour le départ, --dur pour la durée). La feuille de style ne joue ces gestes que dans la
// scène en cours (.is-play) ; ailleurs, et en images fixes, on voit directement l'état final.
// Les textes de légende sont du vrai texte ; chaque image porte sa description (role="img").

import type { ComponentChildren } from 'preact'
import { Icon } from '../components/Icon'
import { InkCross, InkLoop } from '../components/Ink'
import { RatingMark } from '../components/RatingRuler'
import { Tally } from '../components/Tally'
import { QUESTION, ROWS, SCENES, at, bandOf, fr, sticksOf, type Row } from './script'

export type Mode = 'play' | 'still'

/* ——— Légende : numéro, titre, phrase ——— */

/** Boucle au stylo autour d'un mot du titre : l'ovale lâche des marques, étiré pour un mot entier */
function TitleLoop() {
  return (
    <svg class="film-loop" viewBox="0 0 120 58" aria-hidden="true">
      <path
        pathLength={1}
        d="M91.8 14.2C79.2 7.7 48.6 6.7 30.9 13.2 12.6 20 12 35.7 29.1 43.9c18 8.7 51.9 7.7 66.9-1.7 13.2-8.3 9.9-21.2-7.2-28.1-11.4-4.6-27.9-5.9-41.7-4.6"
      />
    </svg>
  )
}

function Caption({ index, children }: { index: number; children?: ComponentChildren }) {
  const scene = SCENES[index]!
  const [before, rest] = scene.mark ? scene.title.split(scene.mark) : [scene.title, '']
  // La ponctuation qui suit le mot entouré reste collée à lui (jamais seule en début de ligne)
  const glued = rest?.match(/^[,.;:!?]+/)?.[0] ?? ''
  const after = rest?.slice(glued.length) ?? ''
  return (
    <div class="film-caption">
      <p class="film-n fa-fade" style={at(0, 400)} aria-hidden="true">
        {index + 1}
      </p>
      <h2 class="film-h fa-rise" id={`film-h-${index}`} style={at(120, 650)}>
        {scene.mark ? (
          <>
            {before}
            <span class="nowrap">
              <span class="film-mark" style={at(3300, 700)}>
                {scene.mark}
                <TitleLoop />
              </span>
              {glued}
            </span>
            {after}
          </>
        ) : (
          scene.title
        )}
      </h2>
      <p class="film-p fa-rise" style={at(450, 650)}>
        {scene.text}
      </p>
      {children}
    </div>
  )
}

/* ——— 1. Des idées, pas des noms ——— */

function ArtIdeas() {
  return (
    <div class="fs">
      <p class="fs-prompt fa-rise" style={at(250, 550)}>
        {QUESTION}
      </p>
      <div class="fs-head fa-fade" style={at(1450, 400)}>
        <span class="fs-head-who">Porté par</span>
      </div>
      <ol class="fs-rows fa-rule" style={at(450, 700)}>
        {ROWS.map((r, i) => (
          <li key={r.letter} class="fs-row" style={at(650 + i * 170, 600)}>
            <span class="fs-letter fa-rise" style={at(650 + i * 170)}>
              {r.letter}
            </span>
            <span class="fs-text fa-rise" style={at(720 + i * 170)}>
              {r.text}
            </span>
            <span class="fs-who">
              {/* Le nom s'imprime, puis bascule : il ne reste qu'un point d'interrogation */}
              <span class="fs-named fa-stamp" style={at(1550 + i * 130, 350)}>
                <span class="fs-flip-out" style={at(2900 + i * 140, 280)}>
                  <span class="fs-chip">{r.initials}</span>
                  <span class="fs-name">{r.name}</span>
                </span>
              </span>
              <span class="fs-anon fs-flip-in" style={at(3140 + i * 140, 340)}>
                <span class="fs-chip is-anon">?</span>
                <span class="fs-bar fa-grow" style={at(3260 + i * 140, 420)} />
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ——— 2. Vous donnez votre avis ——— */

/** Réglette à trois crans, dessinée pour le film : le repère part du centre et se pose sur son cran */
function Ruler({ row, drawAt, markAt }: { row: Row; drawAt: number; markAt: number }) {
  const up = row.rating === 1
  return (
    <span class={`fr ${up ? 'is-up' : 'is-down'}`} data-tone={up ? 'tres-proche' : 'eloigne'}>
      <span class="fr-line fa-grow" style={at(drawAt, 450)} />
      <span class="fr-tick is-a fa-fade" style={at(drawAt + 200, 250)}>
        <span class={`fr-tick-line${up ? '' : ' is-hit'}`} style={up ? undefined : at(markAt + 380, 200)} />
      </span>
      <span class="fr-open fa-fade" style={at(drawAt + 260, 250)} />
      <span class="fr-tick is-c fa-fade" style={at(drawAt + 320, 250)}>
        <span class={`fr-tick-line${up ? ' is-hit' : ''}`} style={up ? at(markAt + 380, 200) : undefined} />
      </span>
      <span class="fr-mark" style={at(markAt, 560)}>
        <span class="fr-dot" />
        <span class="fr-loop-at" style={at(markAt + 520, 520)}>
          <InkLoop class="fr-loop" />
        </span>
      </span>
      <span class="fr-word fa-rise" style={at(markAt + 800, 380)}>
        {up ? 'D’accord' : 'Pas d’accord'}
      </span>
    </span>
  )
}

function ArtOpinion() {
  // Départ de chaque repère : A, puis B, puis la ligne rouge de C (qui force « Pas d'accord »)
  const markAt = [1400, 2800, 4800]
  return (
    <div class="fs is-rating">
      <p class="fs-prompt">{QUESTION}</p>
      <div class="fs-legend fa-fade" style={at(200, 450)}>
        <span class="fs-legend-crans">
          <span data-tone="eloigne">Pas d’accord</span>
          <span data-tone="mitige">Sans avis</span>
          <span data-tone="tres-proche">D’accord</span>
        </span>
        <span class="fs-legend-red">
          <Icon name="cross" />
          Ligne rouge
        </span>
      </div>
      <ol class="fs-rows">
        {ROWS.map((r, i) => (
          <li key={r.letter} class={`fs-row${r.redLine ? ' is-redline' : ''}`}>
            <span class="fs-letter">{r.letter}</span>
            <span class="fs-text">
              {r.redLine ? (
                <span class="fs-strike" style={at(4700, 700)}>
                  {r.text}
                </span>
              ) : (
                r.text
              )}
            </span>
            <Ruler row={r} drawAt={300 + i * 120} markAt={markAt[i]!} />
            <span class="fs-box" style={{ ...at(420 + i * 120, 450), '--d2': '4300ms' }}>
              <svg class="fs-box-frame" viewBox="0 0 28 28" aria-hidden="true">
                <rect class="fa-draw" pathLength={1} x="0.75" y="0.75" width="26.5" height="26.5" rx="1" />
              </svg>
              {r.redLine ? (
                <span class="fs-cross" style={at(4300, 300)}>
                  <InkCross />
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ——— 3. On dépouille sur votre appareil ——— */

function ArtCount({ mode }: { mode: Mode }) {
  return (
    <div class="fd">
      <div class="fd-head fa-fade" style={at(150, 400)}>
        <span class="fd-h-avis">Vos avis</span>
        <span class="fd-h-who">Porté par</span>
        <span class="fd-h-aff">Affinité</span>
      </div>
      <ol class="fd-rows">
        {ROWS.map((r, i) => {
          const band = bandOf(r.pct)
          const count = 1500 + i * 220
          return (
            <li key={r.letter} class={`fd-row${r.redLine ? ' is-flagged' : ''}`} style={{ '--d2': '3500ms' }}>
              <span class="fd-letter">{r.letter}</span>
              <span class="fd-avis">
                <RatingMark value={r.rating} redLine={r.redLine} />
              </span>
              <svg class="fd-arrow" viewBox="0 0 36 20" aria-hidden="true" style={at(450 + i * 150, 450)}>
                <path class="fa-draw" pathLength={1} d="M2 10h31M27 4l6 6-6 6" />
              </svg>
              <span class="fd-who">
                <span class="fd-chip fa-stamp" style={at(800 + i * 150, 350)}>
                  {r.initials}
                </span>
                <span class="fd-name fa-fade" style={at(880 + i * 150, 400)}>
                  {r.name}
                </span>
                {r.redLine ? (
                  <span class="fd-flag" style={at(3500, 320)}>
                    <InkCross />
                  </span>
                ) : null}
                {r.redLine ? (
                  <span class="fd-why fa-fade" style={at(3700, 400)}>
                    franchit votre ligne rouge
                  </span>
                ) : null}
              </span>
              <span class="fd-tally">
                <Tally
                  count={sticksOf(r.pct)}
                  label={`${sticksOf(r.pct)} bâtons`}
                  maxGroups={Infinity}
                  drawAll={mode === 'play'}
                  delay={count}
                />
              </span>
              <span class={`fd-pct aff-${band.key}`}>
                <span class="fd-n" style={{ '--to': String(r.pct), ...at(count, 1150) }} />
                <span class="fd-unit">%</span>
                <span class="fd-band fa-fade" style={at(count + 1000, 400)}>
                  {band.label}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
      <p class="fd-note fa-fade" style={at(4300, 500)}>
        <Icon name="lock" />
        {fr('Calculé sur cet appareil : aucune réponse envoyée.')}
      </p>
    </div>
  )
}

/* ——— 4. Rien ne part ——— */

/** Plis du rideau : traits verticaux inégaux, ourlet légèrement ondulé (comme le rideau hors ligne) */
const PLEATS = (() => {
  const xs = [3.5, 13, 21.5, 33.5, 40]
  const ends = [96, 92, 95, 91, 94]
  let d = ''
  for (let k = 0; k < 240; k += 46)
    xs.forEach((x, j) => {
      if (k + x < 240) d += `M${k + x} 0V${ends[j]}`
    })
  return `${d}M0 93q5.75 3 11.5 0${'t11.5 0'.repeat(20)}`
})()

function Phone() {
  return (
    <svg class="diagram fc-phone" viewBox="0 0 120 200" aria-hidden="true">
      <rect class="dg-box dg-strong" x="4" y="4" width="112" height="192" rx="16" />
      <line class="dg-soft" x1="50" y1="17" x2="70" y2="17" />
      {/* Le mode avion s'allume dans la barre d'état */}
      <g class="fc-plane" style={at(1300, 320)}>
        <path
          class="dg-plane"
          transform="translate(86 8) scale(0.62)"
          d="M12 2.8c.8 0 1.4.7 1.4 1.6v5l7.1 4.2v2l-7.1-2.1v4.2l2.3 1.8v1.7L12 20.3l-3.7.9v-1.7l2.3-1.8v-4.2l-7.1 2.1v-2l7.1-4.2v-5c0-.9.6-1.6 1.4-1.6z"
        />
      </g>
      {/* La feuille, en miniature : trois réglettes, une ligne rouge, des bâtons */}
      {[58, 90, 122].map((y, i) => (
        <g key={y}>
          <g class="dg-print">
            <line x1="18" y1={y} x2="62" y2={y} />
            <line x1="18" y1={y - 5} x2="18" y2={y + 5} />
            <line x1="62" y1={y - 5} x2="62" y2={y + 5} />
          </g>
          <circle class="dg-open-dot" cx="40" cy={y} r="2.4" />
          {i === 0 ? (
            <>
              <circle class="dg-tone-dot" cx="62" cy={y} r="2.6" />
              <circle class="dg-tone-ring" cx="62" cy={y} r="7" />
            </>
          ) : (
            <>
              <circle class="dg-tone-dot is-low" cx="18" cy={y} r="2.6" />
              <circle class="dg-tone-ring is-low" cx="18" cy={y} r="7" />
            </>
          )}
          <rect class="dg-box" x="80" y={y - 8} width="16" height="16" />
          {i === 2 ? (
            <g class="dg-red">
              <line x1="83" y1={y - 5} x2="93" y2={y + 5} />
              <line x1="93" y1={y - 5} x2="83" y2={y + 5} />
            </g>
          ) : null}
        </g>
      ))}
      <g class="dg-ink">
        <line x1="24" y1="152" x2="24" y2="174" />
        <line x1="31" y1="151" x2="31" y2="174" />
        <line x1="38" y1="152" x2="38" y2="173" />
        <line x1="45" y1="151" x2="45" y2="174" />
        <line x1="19" y1="170" x2="51" y2="155" />
        <line x1="62" y1="152" x2="62" y2="174" />
        <line x1="69" y1="151" x2="69" y2="173" />
      </g>
    </svg>
  )
}

function ArtClosed() {
  return (
    <div class="fc">
      <div class="fc-net">
        <span class="fc-net-label fa-fade" style={at(600, 400)}>
          Internet
        </span>
        <span class="fc-mode fa-fade" style={at(1400, 400)}>
          <Icon name="plane" />
          Mode avion
        </span>
        <svg class="fc-arrow" viewBox="0 0 24 64" aria-hidden="true" style={at(350, 650)}>
          <path class="fa-draw" pathLength={1} d="M12 63V5M5 12l7-7 7 7" />
        </svg>
        <span class="fc-cross" style={at(1800, 300)}>
          <InkCross />
        </span>
        <span class="fc-off fa-fade" style={at(2100, 400)}>
          rien ne sort
        </span>
      </div>
      <div class="fc-booth">
        <Phone />
        <div class="fc-curtain" style={at(2600, 1000)}>
          <svg class="fc-pleats" viewBox="0 0 240 100" preserveAspectRatio="none" aria-hidden="true">
            <path d={PLEATS} />
          </svg>
        </div>
        <span class="fc-tag fa-stamp" style={at(3500, 380)}>
          <Icon name="plane" />
          {fr('Isoloir fermé : rien ne peut partir')}
        </span>
      </div>
    </div>
  )
}

/* ——— 5. Vous gardez votre affiche ——— */

function ArtPoster() {
  return (
    <div class="fp">
      {/* La feuille, et dessous son double jaune, qui en sort */}
      <div class="fp-sheet">
        <p class="fp-brand">Isoloir</p>
        <p class="fp-form">Feuille de pointage</p>
        <svg class="diagram fp-lines" viewBox="0 0 120 92" aria-hidden="true">
          {[14, 44, 74].map((y, i) => (
            <g key={y}>
              <line class="dg-soft" x1="2" y1={y - 7} x2={72 - i * 12} y2={y - 7} />
              {i === 2 ? <line class="dg-red" x1="0" y1={y - 7} x2="62" y2={y - 7} /> : null}
              <g class="dg-print">
                <line x1="4" y1={y + 7} x2="40" y2={y + 7} />
                <line x1="4" y1={y + 3} x2="4" y2={y + 11} />
                <line x1="40" y1={y + 3} x2="40" y2={y + 11} />
              </g>
              <circle class={`dg-tone-dot${i ? ' is-low' : ''}`} cx={i ? 4 : 40} cy={y + 7} r="2.6" />
            </g>
          ))}
        </svg>
      </div>
      <div class="fp-copy on-copy" style={at(300, 1100)}>
        <p class="fp-kicker">Isoloir · exemple fictif</p>
        <p class="fp-title">Mon dépouillement</p>
        <ol class="fp-list">
          {ROWS.map((r, i) => (
            <li key={r.letter}>
              <span class="fp-rank">{i + 1}</span>
              <span class="fp-name">{r.name}</span>
              <span class="fp-pct">{fr(`${r.pct} %`)}</span>
            </li>
          ))}
        </ol>
        <p class="fp-foot fa-fade" style={at(1400, 500)}>
          Fabriquée sur cet appareil. Rien n’a été envoyé.
        </p>
      </div>
    </div>
  )
}

/* ——— Une scène : légende à gauche (ou en haut), image à droite (ou dessous) ——— */

/** L'appel final du film : il suit l'état de la feuille (commencer, reprendre, voir le dépouillement) */
export interface Cta {
  href: string
  label: string
  note: string
}

export function SceneFrame({ index, mode, off, cta: action }: { index: number; mode: Mode; off?: boolean; cta: Cta }) {
  const scene = SCENES[index]!
  const last = index === SCENES.length - 1
  /** L'appel final : sous la légende sur grand écran, sous l'affiche sur téléphone */
  const cta = (where: string) => (
    <p class={`film-cta ${where} fa-rise`} style={at(2200, 600)}>
      <a class="btn-primary" href={action.href}>
        {action.label}
        <Icon name="arrow-right" />
      </a>
      {action.note ? <span class="film-cta-note">{action.note}</span> : null}
    </p>
  )
  return (
    <section
      class={`film-scene is-${mode}${off ? ' is-off' : ''}`}
      aria-hidden={off ? 'true' : undefined}
      aria-labelledby={`film-h-${index}`}
    >
      <Caption index={index}>{last ? cta('is-wide') : null}</Caption>
      <div class="film-visual">
        <div class="film-art" role="img" aria-label={scene.alt}>
          {index === 0 ? <ArtIdeas /> : null}
          {index === 1 ? <ArtOpinion /> : null}
          {index === 2 ? <ArtCount mode={mode} /> : null}
          {index === 3 ? <ArtClosed /> : null}
          {index === 4 ? <ArtPoster /> : null}
        </div>
        {last ? cta('is-narrow') : null}
      </div>
    </section>
  )
}
