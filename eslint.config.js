import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'research', 'tools', '.impeccable'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // Anonymat structurel : le questionnaire ne doit jamais pouvoir lire qui porte quelle approche.
    // (Les écrans anonymes de « À table », sous src/ui/questionnaire/table, ont aussi leur bloc ci-dessous : en
    // configuration plate, une règle redéclarée remplace la précédente, d'où les mêmes motifs, réunis.)
    files: ['src/ui/questionnaire/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/positions', '**/positions.ts', '**/elections', '**/elections/index', '**/candidates', '**/candidates.ts'], message: 'Le questionnaire ne doit pas accéder aux candidats ni à leurs positions.' },
          ],
        },
      ],
    },
  },
  {
    // « À table » : ni stockage ni partage. Une table ne garde rien sur l'appareil et n'envoie rien ; ses écrans anonymes
    // gardent en plus l'interdiction de lire les candidats et leurs positions
    files: ['src/ui/table/**/*.{ts,tsx}', 'src/ui/questionnaire/table/**/*.{ts,tsx}', 'src/core/table/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'Une table ne garde rien sur l’appareil.' },
        { name: 'sessionStorage', message: 'Une table ne garde rien sur l’appareil.' },
        { name: 'indexedDB', message: 'Une table ne garde rien sur l’appareil.' },
        { name: 'caches', message: 'Une table ne garde rien sur l’appareil.' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'navigator', property: 'share', message: 'L’image de la table se télécharge seulement.' },
        { object: 'document', property: 'cookie', message: 'Une table ne garde rien sur l’appareil.' },
        { object: 'window', property: 'localStorage', message: 'Une table ne garde rien sur l’appareil.' },
        { object: 'window', property: 'sessionStorage', message: 'Une table ne garde rien sur l’appareil.' },
      ],
    },
  },
  {
    // « Faire les comptes » : ni stockage ni envoi par lui-même. Depuis le 18 octobre 2026 (décision du propriétaire), ses
    // réglages sont gardés par l'application avec les réponses, et il reçoit les réponses à jour en paramètre (app.tsx) :
    // il n'importe toujours ni le stockage, ni l'export, ni la lecture des réponses
    files: ['src/ui/budget/**/*.{ts,tsx}', 'src/core/budget/**/*.ts'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'Le jeu ne garde rien lui-même : l’application garde ses réglages (onSave).' },
        { name: 'sessionStorage', message: 'Le jeu ne garde rien lui-même : l’application garde ses réglages (onSave).' },
        { name: 'indexedDB', message: 'Le jeu ne garde rien lui-même : l’application garde ses réglages (onSave).' },
        { name: 'caches', message: 'Le jeu ne garde rien lui-même : l’application garde ses réglages (onSave).' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'navigator', property: 'share', message: 'Le jeu n’envoie rien.' },
        { object: 'navigator', property: 'sendBeacon', message: 'Le jeu n’envoie rien.' },
        { object: 'document', property: 'cookie', message: 'Le jeu ne garde rien sur l’appareil.' },
      ],
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/core/storage', '**/core/revisions', '**/core/exportData', '**/core/answers'], message: 'Le jeu reçoit les réponses de l’application ; il ne lit ni le stockage ni l’export.' }] },
      ],
    },
  },
  {
    files: ['src/ui/questionnaire/table/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/positions', '**/positions.ts', '**/elections', '**/elections/index', '**/candidates', '**/candidates.ts'], message: 'Le questionnaire ne doit pas accéder aux candidats ni à leurs positions.' },
            { group: ['**/core/storage', '**/core/revisions', '**/core/exportData', '**/core/table/subjects', '**/core/carriers', '**/core/table/image'], message: 'Les écrans anonymes de la table ne lisent ni la feuille enregistrée, ni les positions des candidats.' },
          ],
        },
      ],
    },
  },
)
