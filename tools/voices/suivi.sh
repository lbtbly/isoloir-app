#!/bin/zsh
# Suivi de la génération des voix (file d'attente tools/voices/file-attente.py), en lecture seule.
# Usage : tools/voices/suivi.sh            (état une fois)
#         tools/voices/suivi.sh --suivre   (état rafraîchi toutes les 30 s ; Ctrl-C pour quitter)

ICI=${0:A:h}
RACINE=${ICI:h:h}
Q=$ICI/queue
LOG=$ICI/report/file-attente.log
EN_COURS=$ICI/report/file-attente-en-cours.log
TOTAL_THEMES=23
export LC_TIME=fr_FR.UTF-8

etat() {
  print "Voix des vidéos — $(date '+%A %d %B, %H:%M')"
  print

  # Le démon tourne-t-il ?
  if pgrep -f "tools/voices/file-attente.py" >/dev/null; then
    print "Génération : en marche"
  elif [[ -f $Q/TERMINE ]]; then
    print "Génération : terminée"
  else
    print "Génération : ARRÊTÉE (le démon ne tourne pas)"
  fi

  # Thèmes faits
  local faits=( $Q/*.done(N:t:r) )
  print "Thèmes terminés : ${#faits} sur $TOTAL_THEMES${faits:+  (${(j:, :)faits})}"

  # Thème en cours et passages déjà faits dans ce thème
  local cours=$(grep -o "→ thème [a-z_]*" $LOG 2>/dev/null | tail -1 | sed 's/→ thème //')
  if [[ -n $cours && ! -f $Q/$cours.done ]]; then
    local faitsCours=$(grep -cE "^  → [a-z0-9-]+ : [0-9.]+ s" $EN_COURS 2>/dev/null)
    local prevus=$(grep -oE "[0-9]+ passages" $Q/$cours.ready 2>/dev/null | head -1 | grep -oE "[0-9]+")
    print "En cours : $cours — ${faitsCours:-0} passage(s) sur ${prevus:-?}"
  fi

  # Passages enregistrés en tout
  local fichiers=$(find $RACINE/public/videos/audio/aigue -name '*.m4a' 2>/dev/null | wc -l | tr -d ' ')
  print "Passages enregistrés : $fichiers sur environ 1 014"

  # Estimation de fin : durée moyenne d'un thème (journal) × thèmes restants
  local durees=( ${(f)"$(grep -oE "généré\(s\) en [0-9.]+ min" $LOG 2>/dev/null | grep -oE "[0-9.]+ min" | grep -v '^0.0' | sed 's/ min//')"} )
  if (( ${#durees} > 0 )) && [[ ! -f $Q/TERMINE ]]; then
    local somme=0; for d in $durees; do (( somme += d )); done
    local moyenne=$(( somme / ${#durees} ))
    local restants=$(( TOTAL_THEMES - ${#faits} ))
    local minutes=$(( moyenne * restants ))
    print "Fin estimée des thèmes : vers $(date -v+${minutes%.*}M '+%A %H:%M') (≈ ${moyenne%.*} min par thème), puis contrôle final (1 à 2 h)"
  fi

  [[ -f $Q/TERMINE ]] && { print; print "Résumé final :"; cat $Q/TERMINE; }
  print
  print "Dernières lignes du journal :"
  tail -3 $LOG 2>/dev/null | cut -c1-150
}

if [[ $1 == --suivre ]]; then
  while true; do clear; etat; sleep 30; done
else
  etat
fi
