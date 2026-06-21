const BrowserGlobals = {
  alert: 'readonly',
  cancelAnimationFrame: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  CustomEvent: 'readonly',
  document: 'readonly',
  Element: 'readonly',
  Event: 'readonly',
  fetch: 'readonly',
  HTMLElement: 'readonly',
  HTMLInputElement: 'readonly',
  MutationObserver: 'readonly',
  navigator: 'readonly',
  Node: 'readonly',
  requestAnimationFrame: 'readonly',
  setTimeout: 'readonly',
  translations: 'readonly',
  URL: 'readonly',
  window: 'readonly'
};

const NodeGlobals = {
  __dirname: 'readonly',
  Buffer: 'readonly',
  clearTimeout: 'readonly',
  console: 'readonly',
  fetch: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly',
  setTimeout: 'readonly',
  URL: 'readonly'
};

const BaseRules = {
  'no-empty': ['error', { allowEmptyCatch: true }],
  'no-undef': 'error',
  'no-unused-vars': ['warn', {
    argsIgnorePattern: '^_',
    caughtErrorsIgnorePattern: '^_',
    varsIgnorePattern: '^_'
  }],
  quotes: ['warn', 'single', {
    allowTemplateLiterals: true,
    avoidEscape: true
  }]
};

module.exports = [
  {
    ignores: ['assets/js/lucide.js']
  },
  {
    files: ['index.js', 'scripts/build.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: NodeGlobals
    },
    rules: BaseRules
  },
  {
    files: ['assets/js/preload.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...BrowserGlobals,
        ...NodeGlobals
      }
    },
    rules: BaseRules
  },
  {
    files: [
      'assets/js/boot.js',
      'assets/js/form.js',
      'assets/js/i18n.js',
      'assets/js/main.js',
      'assets/js/window.js'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: BrowserGlobals
    },
    rules: BaseRules
  }
];
