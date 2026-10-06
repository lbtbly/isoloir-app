// Garde-fou d'accessibilité des vidéos : la scène dessinée est masquée aux lecteurs d'écran (aria-hidden), donc
// tout ce qu'elle écrit doit se retrouver dans la transcription du panneau Sources (ce qui est dit, le chiffre
// clé et sa source, l'« alt » du passage). Le script passe chaque passage de chaque vidéo en image fixe
// (mouvement réduit, horloge simulée) et liste les textes de la scène absents de la transcription.
//
// Usage : serveur de développement lancé (pnpm dev), puis
//   node tools/check-transcript.mjs [adresse]        (par défaut http://localhost:5173/)
// Code de sortie 1 s'il reste un texte non transcrit.
//
// Tolérés : le numéro du passage, les mentions « Chiffre clé », « La question » et « Source : … », le sommaire
// de fin de série (déjà dans le panneau Sommaire), un mot dit dans un autre passage de la même vidéo, un nombre
// écrit avec son signe (« +2 », « 100 € » pour « 2 », « 100 euros »), et quelques équivalences listées plus bas.
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:5173/'
/** Équivalences écrites à la main : le dessin abrège ce que la voix dit en toutes lettres */
const SAME = {
  'logement-construire-02': ['× 4'], // « multipliés par quatre »
  'logement-intro-06': ['logements existants'], // « les logements qui existent déjà »
}
const norm = s =>
  s
    .normalize('NFC')
    .replace(/[  ]/g, ' ')
    .replace(/[«»"]/g, '')
    .replace(/€/g, 'euros')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

const browser = await chromium.launch()
const failures = []
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  await p.clock.install()
  await p.goto(`${base}#/essai-videos`)
  await p.locator('.vl-btn').first().waitFor()
  const buttons = await p.locator('.vl-btn').count()
  for (let b = 0; b < buttons; b++) {
    const videoId = await p.locator('.vl-btn').nth(b).getAttribute('data-video')
    await p.locator('.vl-btn').nth(b).click()
    await p.locator('dialog.vp[open]').waitFor()
    await p.clock.runFor(300)
    const video = p.locator('.vp-video:not([inert])')
    const total = await video.locator('.vp-bar').count()
    await video.locator('.vp-ctl[aria-haspopup="dialog"]').click()
    await p.locator('.vp-transcript').waitFor()
    const transcript = (await p.$$eval('.vp-transcript > li', lis => lis.map(li => li.textContent ?? ''))).map(norm)
    await p.locator('.vp-sheet-close').click()
    const whole = transcript.join(' ')
    for (let step = 1; step <= total; step++) {
      // Pas de 500 ms : un passage dure au moins 1,5 s, aucun n'est sauté
      for (let t = 0; t < 120; t++) {
        const cur = await video.locator('.vc-frame').getAttribute('data-step').catch(() => null)
        if (cur && Number(cur) >= step) break
        await p.clock.runFor(500)
      }
      await p.clock.runFor(60)
      const bits = await video.evaluate(v => {
        const stage = v.querySelector('.vp-stage')
        const out = []
        for (const t of stage.querySelectorAll('text')) out.push([...t.querySelectorAll('tspan')].map(s => s.textContent).join(' ') || t.textContent || '')
        const walk = document.createTreeWalker(stage, NodeFilter.SHOW_ELEMENT)
        for (let e = walk.nextNode(); e; e = walk.nextNode()) {
          if (e.closest('svg, .vc-chap-n, .vc-chap-t')) continue
          const cs = getComputedStyle(e)
          if (cs.visibility === 'hidden' || cs.opacity === '0') continue
          if ([...e.childNodes].some(c => c.nodeType === 3 && c.textContent.trim())) out.push(e.textContent ?? '')
        }
        return out
      })
      const here = transcript[step - 1] ?? ''
      const segmentId = `${videoId}-${String(step).padStart(2, '0')}`
      const missing = [...new Set(bits.map(norm))].filter(x => {
        if (!x || x === String(step) || x === 'chiffre clé' || x === 'la question' || x.startsWith('source :')) return false
        if ((SAME[segmentId] ?? []).includes(x)) return false
        const bare = x.replace(/^[+×−-]\s*/, '')
        if (!bare || here.includes(bare) || whole.includes(bare)) return false
        return !bare.split(' ').every(w => here.includes(w))
      })
      if (missing.length) failures.push(`${segmentId} : ${missing.map(m => `« ${m} »`).join(', ')}`)
    }
    await p.locator('.vp-close').click()
    await p.clock.runFor(300)
  }
  await ctx.close()
} finally {
  await browser.close()
}
if (failures.length) {
  console.error(`Textes de la scène absents de la transcription (ajouter un « alt » au passage, dans series.ts) :\n${failures.join('\n')}`)
  process.exitCode = 1
} else console.log('Transcription complète : tout ce que montrent les scènes est dans le panneau Sources.')
