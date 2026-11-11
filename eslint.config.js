import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Feature modules under src/features. Keep in sync when adding a feature. */
const FEATURES = [
  'auth',
  'dashboard',
  'leads',
  'nurture',
  'deals',
  'tasks',
  'contacts',
  'companies',
  'onboarding',
  'reports',
  'automation',
  'settings',
  'import',
  'extras',
  'products',
];

const deepFeatureImport = {
  regex: '^@/features/[^/]+/.+',
  message: 'Import other features only through their public index: "@/features/<name>".',
};

/** Inside feature F, a relative path into another feature folder crosses the boundary. */
const crossFeatureRelative = (feature) => ({
  regex: `^\\.{1,2}/(?:.*/)?(?:${FEATURES.filter((name) => name !== feature).join('|')})(?:/|$)`,
  message: 'Features must not import another feature’s internals. Use "@/features/<name>".',
});

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'coverage']),

  // TypeScript (new code)
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // `text || fallback` is intentional for empty strings.
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: { string: true } },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-restricted-imports': ['error', { patterns: [deepFeatureImport] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: 'Use a string-literal union or an `as const` object.',
        },
      ],
    },
  },

  // Feature boundaries
  ...FEATURES.map((feature) => ({
    files: [`src/features/${feature}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [deepFeatureImport, crossFeatureRelative(feature)] },
      ],
    },
  })),

  // shadcn/ui generated sources: keep them close to upstream.
  {
    files: ['src/components/ui/**/*.{ts,tsx}', 'src/hooks/use-mobile.ts'],
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      // Wrappers pass through loosely typed third-party props (e.g. recharts payloads).
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },

  // Route modules export route config next to small components.
  {
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  // Node-side config files
  {
    files: ['*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
]);
