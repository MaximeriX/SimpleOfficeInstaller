(function () {
  const State = {
    locale: '',
    locales: [],
    translations: {}
  };

  async function load(locale) {
    const response = await fetch(`assets/locales/${locale}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load locale ${locale}`);
    }
    return response.json();
  }

  function normalizeTranslations(translations) {
    const flat = {};

    (function visit(value, parentKey, dottedKey) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        if (typeof value === 'string' && parentKey) {
          flat[parentKey] = value;
          if (dottedKey) {
            flat[dottedKey] = value;
          }
        }
        return;
      }

      Object.entries(value).forEach(([key, nestedValue]) => {
        visit(nestedValue, key, dottedKey ? `${dottedKey}.${key}` : key);
      });
    })(translations, '');

    return { ...translations, ...flat };
  }

  function getTranslation(translations, key) {
    if (!key) {
      return '';
    }

    if (translations[key]) {
      return translations[key];
    }

    const nestedValue = key.split('.').reduce((value, segment) => (
      value && typeof value === 'object' ? value[segment] : undefined
    ), translations);

    if (typeof nestedValue === 'string') {
      return nestedValue;
    }

    return '';
  }

  function getLocaleLabel(translations, fallback) {
    const lang = translations.lang || {};
    return lang.native || lang.english || fallback;
  }

  async function setLocale(locale, preloadedTranslations = null) {
    if (!State.locales.includes(locale)) {
      locale = State.locales[0] || 'en_us';
    }

    State.locale = locale;

    const translations = preloadedTranslations || await load(locale);
    const normalizedTranslations = normalizeTranslations(translations);
    State.translations = normalizedTranslations;
    window.translations = normalizedTranslations;

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const text = getTranslation(normalizedTranslations, element.dataset.i18n);
      if (text) {
        element.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach((element) => {
      const text = getTranslation(normalizedTranslations, element.dataset.i18nTitle);
      if (text) {
        element.title = text;
      }
    });

    document.querySelectorAll('[data-i18n-tooltip]').forEach((element) => {
      const text = getTranslation(normalizedTranslations, element.dataset.i18nTooltip);
      if (text) {
        element.dataset.tooltip = text;
        element.setAttribute('aria-label', text.replace(/\s+/g, ' '));
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const text = getTranslation(normalizedTranslations, element.dataset.i18nPlaceholder);
      if (text) {
        element.placeholder = text;
      }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
      const text = getTranslation(normalizedTranslations, element.dataset.i18nAriaLabel);
      if (text) {
        element.setAttribute('aria-label', text);
      }
    });

    const languageTitle = getTranslation(normalizedTranslations, 'nav.langToggle') || 'Language';
    const languageSelect = document.querySelector('.language-select');
    if (languageSelect) {
      languageSelect.value = State.locale;
      languageSelect.title = languageTitle;
      languageSelect.setAttribute('aria-label', getTranslation(normalizedTranslations, 'ui.languageLabel') || 'Language');
    }

    const languageButton = document.querySelector('.lang-select-button');
    if (languageButton) {
      languageButton.title = languageTitle;
      languageButton.setAttribute('aria-label', languageTitle);
    }

    const langFlag = document.querySelector('.flag-icon');
    if (langFlag) {
      langFlag.src = `assets/icons/flags/${State.locale}.svg`;
      langFlag.alt = getLocaleLabel(normalizedTranslations, State.locale);
    }

    document.documentElement.lang = State.locale.replace('_', '-');

    window.dispatchEvent(new CustomEvent('soi:translations-updated', {
      detail: { locale: State.locale, translations: normalizedTranslations }
    }));
  }

  window.soiI18n = {
    ready: new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', () => {
        const bootstrapPromise = window.soi?.app?.bootstrap
          ? window.soi.app.bootstrap()
          : window.soi.locale.getInitial().then((locale) => ({ locale }));

        bootstrapPromise.then(async (initial) => {
          const localeState = initial && initial.locale ? initial.locale : initial;
          State.locale = localeState.locale || localeState.defaultLocale || 'en_us';
          State.locales = Array.isArray(localeState.locales) && localeState.locales.length ? localeState.locales : ['en_us'];

          await setLocale(State.locale, initial && initial.translations ? initial.translations : null);

          const languageSelect = document.querySelector('.language-select');
          if (languageSelect) {
            const labels = await Promise.all(State.locales.map(async (locale) => {
              try {
                const translations = await load(locale);
                return {
                  locale,
                  label: getLocaleLabel(translations, locale)
                };
              } catch {
                return { locale, label: locale };
              }
            }));

            languageSelect.textContent = '';
            labels.forEach(({ locale, label }) => {
              const option = document.createElement('option');
              option.value = locale;
              option.textContent = label;
              languageSelect.appendChild(option);
            });

            languageSelect.value = State.locale;
            languageSelect.disabled = State.locales.length < 2;
            languageSelect.addEventListener('change', async () => {
              try {
                await setLocale(languageSelect.value);
              } catch (error) {
                console.error('Language switch failed:', error);
                languageSelect.value = State.locale;
              }
            });
          }

          window.dispatchEvent(new CustomEvent('soi:selects-updated'));
          resolve();
        }).catch((error) => {
          console.error('i18n initialization failed:', error);
          resolve();
        });
      });
    }),
    get locale() {
      return State.locale;
    },
    get translations() {
      return State.translations;
    }
  };
})();
