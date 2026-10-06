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
)
