// Classement de la veille des candidats (contrat : tools/veille/CONTRACT.md §c.5, §d.6) : la règle de seuil d'un nouveau
// candidat (décision du propriétaire du 17 octobre 2026), appliquée en code et non par un agent, sur la valeur de retour
// du workflow 8 (WATCH_RESULT). Fonction pure : la configuration, l'élection, l'état, les attentes et la politique
// arrivent en paramètre.
//
// Une personne est QUALIFIANTE (préparation automatique sur une branche, puis « OK C-<slug> ») si :
//   1. l'événement est une déclaration (ou une condition levée) d'une personne absente de config.json (knownId null, et
//      aucun candidat de même nom normalisé) ;
//   2. le vérificateur adverse confirme (checker.verdict = confirmed) ;
//   3. la candidature est sans condition pour l'agent ET pour le vérificateur ;
//   4. le seuil tient sur les données de l'agent ET sur celles du vérificateur : le parti qui la soutient compte au
//      moins un député, un sénateur, ou (si policy.mepCountsAsNational, interprétation à confirmer) un député
//      européen élu en France ; ou elle exerce ou a exercé une fonction nationale (président de la République,
//      Premier ministre, gouvernement, député, sénateur, député européen) ; chaque compte, chaque fonction, avec
//      l'adresse qui le prouve (sinon il ne compte pas) ;
//   5. au moins 2 sources de 2 éditeurs différents, dont une primaire (canal propre ou institution), agent et
//      vérificateur réunis ; une page citée par les deux n'est primaire que si les deux le disent ;
//   6. elle n'est ni en attente (C-<slug>), ni refusée (state.refused, ou attente C-<slug> « refusé »).
// Au-delà de caps.prepsPerDay (1) ou caps.prepsPerWeek (2) préparations (attentes C- créées ce jour, cette semaine) :
// différée, et « à surveiller » (plafond-préparations).
//
// Retrait confirmé : withdrawal d'un candidat présenté, vérificateur « confirmed », 2 sources de 2 éditeurs dont une
// primaire, sans attente R-<id> en cours ; sinon « à surveiller » (retrait-incertain). Un masqué n'est jamais retiré :
// sa propre candidature est une redéclaration (attente D-<id>, créée par la session), sauf si le vérificateur adverse
// l'a réfutée (ignorée, notée au journal ; non vérifiée ou incertaine, elle est signalée). Les masqués n'entrent jamais
// dans la liste « à surveiller », qui se publie (state.watch).
//
// Usage :
//   import { classifyWatch } from './lib/classify.mjs'
//   const out = classifyWatch(watchResult, { config, election, state, pending, localWatch, policy, today })

import { DEFAULT_POLICY } from '../schemas.mjs'
import { candidateSlug, normalizeName, sourceKey, splitCandidates, todayInParis, weekStart } from './common.mjs'

const OFFICE_LABEL = {
  'président-de-la-république': 'président de la République',
  'premier-ministre': 'Premier ministre',
  gouvernement: 'membre du gouvernement',
  député: 'député',
  sénateur: 'sénateur',
  'député-européen': 'député européen',
}
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`
/** Identifiant d'une personne absente de config : candidateSlug, toujours au motif CANDIDATE_ID (une lettre d'abord) */
export const slugOf = (name, taken = []) => {
  const s = candidateSlug(name, taken)
  return /^[a-z]/.test(s) ? s : candidateSlug(`x c${s}`, taken)
}

/**
 * Le seuil sur un jeu de données (agent ou vérificateur) : { met, via: [textes], mepOnly, unproved }. pne =
 * partyNationalElected, office = nationalOffice ; absents ou null : rien n'est établi. Rien ne compte sans l'adresse qui
 * le prouve (CONTRACT.md c.5) : des comptes d'élus sans url, une fonction sans url, sont écartés (unproved le dit).
 */
export function thresholdOf(pne, office, policy = DEFAULT_POLICY) {
  const via = []
  const unproved = []
  const proved = !!pne?.url
  const dep = proved ? Number(pne?.deputies) || 0 : 0
  const sen = proved ? Number(pne?.senators) || 0 : 0
  const mep = proved ? Number(pne?.meps) || 0 : 0
  if (!proved && ((Number(pne?.deputies) || 0) + (Number(pne?.senators) || 0) + (Number(pne?.meps) || 0) > 0)) unproved.push('élus nationaux du parti sans adresse')
  const meps = policy.mepCountsAsNational !== false && mep >= 1
  if (dep >= 1 || sen >= 1 || meps) {
    via.push(`parti : ${plural(dep, 'député', 'députés')}, ${plural(sen, 'sénateur', 'sénateurs')}, ${plural(mep, 'député européen', 'députés européens')} (${pne.url})`)
  }
  const current = (office?.current ?? []).filter(o => o?.url)
  const former = (office?.former ?? []).filter(o => o?.url)
  const dropped = (office?.current ?? []).length + (office?.former ?? []).length - current.length - former.length
  if (dropped > 0) unproved.push(`${plural(dropped, 'fonction nationale', 'fonctions nationales')} sans adresse`)
  for (const o of current) via.push(`fonction nationale actuelle : ${OFFICE_LABEL[o.office] ?? o.office}`)
  for (const o of former) via.push(`fonction nationale passée : ${OFFICE_LABEL[o.office] ?? o.office}`)
  const mepOnly = meps && dep < 1 && sen < 1 && !current.length && !former.length
  return { met: via.length > 0, via, mepOnly, unproved }
}

/**
 * Sources de l'agent et du vérificateur réunies (une adresse une fois) : { sources, publishers, primary, ok }. Une page
 * citée par les deux n'est primaire que si les deux le disent (même règle que la fusion des chercheurs du workflow 8) :
 * un vérificateur qui relit comme presse la page que l'agent disait primaire l'emporte.
 */
export function sourcesOf(event) {
  const at = new Map()
  const sources = []
  for (const s of [...(event?.sources ?? []), ...(event?.checker?.sources ?? [])]) {
    const k = sourceKey(s.url)
    if (at.has(k)) {
      const prev = sources[at.get(k)]
      prev.primary = prev.primary && !!s.primary
      continue
    }
    at.set(k, sources.length)
    sources.push({ url: s.url, title: s.title, publisher: s.publisher, date: s.date ?? null, primary: !!s.primary })
  }
  const publishers = new Set(sources.map(s => normalizeName(s.publisher)).filter(Boolean))
  const primary = sources.filter(s => s.primary).length
  return { sources, publishers: publishers.size, primary, ok: publishers.size >= 2 && primary >= 1 }
}

/**
 * Le classement (CLASSIFY_RESULT, plus watchNew : les clés « à surveiller » vues pour la première fois, et log).
 * ctx : { config, election, state, pending (PENDING_ITEM[], tous statuts), localWatch (entrées de L/watch.json),
 * policy, today }.
 */
export function classifyWatch(result, ctx) {
  const { config, election, state = {}, pending = [], localWatch = [], policy = DEFAULT_POLICY, today = result.today } = ctx
  const split = splitCandidates(config, election)
  const visible = new Set(split.visibleIds)
  const hidden = new Set(split.hiddenIds)
  const configIds = config.candidates.map(c => c.id)
  const byName = new Map(config.candidates.map(c => [normalizeName(c.name), c.id]))
  const cand = id => config.candidates.find(c => c.id === id)
  const knownIdOf = ev => ev.person?.knownId ?? byName.get(normalizeName(ev.person?.name)) ?? null

  const pendingC = pending.filter(p => /^C-/.test(p.id))
  const waitingIds = new Set(pending.filter(p => p.status === 'attente').map(p => p.id))
  const refusedKeys = new Set([...(state.refused ?? []).map(r => r.key), ...pendingC.filter(p => p.status === 'refusé').map(p => p.id.slice(2))])
  const refusedNames = new Set([...(state.refused ?? []).map(r => normalizeName(r.name)), ...pendingC.filter(p => p.status === 'refusé').map(p => normalizeName(p.details?.name ?? ''))].filter(Boolean))
  const dayOf = iso => todayInParis(new Date(iso))
  let prepsToday = pendingC.filter(p => dayOf(p.createdAt) === today).length
  let prepsWeek = pendingC.filter(p => weekStart(dayOf(p.createdAt)) === weekStart(today)).length
  const caps = policy.caps ?? DEFAULT_POLICY.caps

  const known = new Map()
  for (const w of [...(state.watch ?? []), ...localWatch]) if (!known.has(w.key)) known.set(w.key, w)

  const out = { qualifying: [], deferred: [], withdrawals: [], redeclarations: [], conditions: [], official: [], watch: [], unchanged: [], stillDeclaredFalse: [], watchNew: [], log: [] }
  const watchKeys = new Set()
  const toWatch = (key, name, party, reason, detail, sources = []) => {
    if (hidden.has(key) || [...hidden].some(h => normalizeName(cand(h)?.name) === normalizeName(name))) return
    if (watchKeys.has(key)) return
    watchKeys.add(key)
    const prev = known.get(key)
    if (!prev) out.watchNew.push(key)
    out.watch.push({ key, name, party: party ?? null, reason, ...(detail ? { detail } : {}), firstSeen: prev?.firstSeen ?? today, lastSeen: today, sources: sources.slice(0, 5) })
  }

  const seen = new Map()
  const once = (key, ev) => {
    if (!seen.has(key)) {
      seen.set(key, ev.ref)
      return true
    }
    out.unchanged.push(ev.ref)
    out.log.push(`${ev.ref} : doublon de ${seen.get(key)} (${key}), compté une fois`)
    return false
  }

  const declaration = ev => {
    const name = ev.person.name
    const slug = slugOf(name, configIds)
    if (!once(`personne:${slug}`, ev)) return
    const pendingId = `C-${slug}`
    if (refusedKeys.has(slug) || refusedNames.has(normalizeName(name))) {
      out.unchanged.push(ev.ref)
      out.log.push(`${ev.ref} : ${name}, refusé par le propriétaire, n'est pas signalé à nouveau`)
      return
    }
    const src = sourcesOf(ev)
    if (waitingIds.has(pendingId)) return toWatch(slug, name, ev.party, 'déjà-en-attente', `attente ${pendingId} en cours`, src.sources)
    const ch = ev.checker
    if (!ch || ch.verdict === 'uncertain') return toWatch(slug, name, ev.party, 'non-confirmé', ch ? `vérificateur incertain : ${(ch.reasons ?? []).join(' ; ')}` : 'pas de vérificateur', src.sources)
    if (ch.verdict !== 'confirmed') return toWatch(slug, name, ev.party, 'déclaration-contestée', (ch.reasons ?? []).join(' ; '), src.sources)
    if (ev.unconditional !== true || ch.unconditional !== true) {
      const who = ev.unconditional !== true ? (ch.unconditional !== true ? 'l’agent et le vérificateur' : 'l’agent') : 'le vérificateur'
      return toWatch(slug, name, ev.party, 'condition', `candidature non établie sans condition pour ${who}${ev.condition ? ` : ${ev.condition}` : ''}`, src.sources)
    }
    const a = thresholdOf(ev.partyNationalElected, ev.nationalOffice, policy)
    const c = thresholdOf(ch.partyNationalElected, ch.nationalOffice, policy)
    if (!a.met || !c.met) {
      const who = !a.met ? (!c.met ? 'ni pour l’agent ni pour le vérificateur' : 'pas pour l’agent') : 'pas pour le vérificateur'
      const unproved = [...new Set([...a.unproved, ...c.unproved])]
      return toWatch(slug, name, ev.party, 'seuil', `ni élu national du parti, ni fonction nationale, prouvés par une adresse : ${who}${unproved.length ? ` (${unproved.join(', ')})` : ''}`, src.sources)
    }
    if (!src.ok) return toWatch(slug, name, ev.party, 'sources', `${plural(src.sources.length, 'source', 'sources')}, ${plural(src.publishers, 'éditeur', 'éditeurs')}, ${src.primary} primaire(s) : il faut 2 éditeurs dont une source primaire`, src.sources)
    if (prepsToday >= caps.prepsPerDay || prepsWeek >= caps.prepsPerWeek) {
      const reason = prepsToday >= caps.prepsPerDay ? `déjà ${prepsToday} préparation(s) aujourd’hui (plafond ${caps.prepsPerDay})` : `déjà ${prepsWeek} préparation(s) cette semaine (plafond ${caps.prepsPerWeek})`
      out.deferred.push({ ref: ev.ref, slug, reason })
      return toWatch(slug, name, ev.party, 'plafond-préparations', reason, src.sources)
    }
    prepsToday++
    prepsWeek++
    const reasons = [
      'candidature sans condition, confirmée par le vérificateur adverse',
      ...a.via,
      ...(a.mepOnly || c.mepOnly ? ['seuil tenu par les seuls députés européens : interprétation à confirmer par le propriétaire'] : []),
      `${plural(src.sources.length, 'source', 'sources')} de ${plural(src.publishers, 'éditeur', 'éditeurs')}, dont ${src.primary} primaire(s)`,
    ]
    out.qualifying.push({ ref: ev.ref, slug, name, party: ev.party ?? null, reasons, sources: src.sources })
  }

  const withdrawalIds = new Set()
  for (const ev of result.events ?? []) {
    const kid = knownIdOf(ev)
    switch (ev.kind) {
      case 'official':
        out.official.push({ ref: ev.ref, type: ev.official?.type ?? 'autre', detail: ev.official?.detail ?? ev.summary, date: ev.date ?? null })
        break
      case 'redeclaration':
      case 'declaration':
        if (kid && hidden.has(kid)) {
          // Réfutée par le vérificateur adverse (le workflow 8 garde l'événement avec son verdict) : pas d'attente D-<id>
          if (ev.checker?.verdict === 'refuted') {
            out.unchanged.push(ev.ref)
            out.log.push(`${ev.ref} : redéclaration d'un masqué réfutée par le vérificateur, ignorée`)
          }
          else if (once(`redeclaration:${kid}`, ev)) out.redeclarations.push({ ref: ev.ref, candidateId: kid, date: ev.date ?? null })
        }
        else if (kid && (visible.has(kid) || configIds.includes(kid))) out.unchanged.push(ev.ref)
        else declaration(ev)
        break
      case 'condition':
        if (kid && visible.has(kid)) out.conditions.push({ ref: ev.ref, candidateId: kid, conditionChange: ev.conditionChange ?? null, summary: ev.summary })
        else if (kid) out.unchanged.push(ev.ref)
        else if (ev.conditionChange === 'levée') declaration(ev)
        else toWatch(slugOf(ev.person.name, configIds), ev.person.name, ev.party, 'condition', ev.condition ?? ev.summary, sourcesOf(ev).sources)
        break
      case 'withdrawal': {
        if (!kid || !visible.has(kid)) {
          out.unchanged.push(ev.ref)
          out.log.push(`${ev.ref} : retrait d'une personne qui n'est pas un candidat présenté, ignoré`)
          break
        }
        withdrawalIds.add(kid)
        if (!once(`retrait:${kid}`, ev)) break
        if (waitingIds.has(`R-${kid}`)) {
          out.unchanged.push(ev.ref)
          out.log.push(`${ev.ref} : retrait de ${kid} déjà en attente (R-${kid})`)
          break
        }
        const src = sourcesOf(ev)
        if (ev.checker?.verdict === 'confirmed' && src.ok) out.withdrawals.push({ ref: ev.ref, candidateId: kid, sources: src.sources, date: ev.date ?? null })
        else {
          const why = ev.checker?.verdict !== 'confirmed' ? `vérificateur : ${ev.checker?.verdict ?? 'absent'}` : `${plural(src.publishers, 'éditeur', 'éditeurs')}, ${src.primary} primaire(s)`
          toWatch(kid, cand(kid)?.name ?? ev.person.name, cand(kid)?.party ?? ev.party, 'retrait-incertain', why, src.sources)
        }
        break
      }
      default:
        out.unchanged.push(ev.ref)
    }
  }
  for (const s of result.stillDeclared ?? []) {
    if (s.declared === false && visible.has(s.candidateId) && !withdrawalIds.has(s.candidateId)) out.stillDeclaredFalse.push(s.candidateId)
  }
  return out
}
