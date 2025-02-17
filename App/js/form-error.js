function loadTranslations() {
    return new Promise((resolve) => {
        const newTranslations = {};
        resolve(newTranslations);
    });
}

loadTranslations().then(newTranslations => {
    window.translations = newTranslations;
});

let currentLanguageIndex = 0;
let supportedLanguages = [];
let langloaded = 0;

function loadSupportedLanguages() {
    fetch('locales/list.json')
        .then(response => response.json())
        .then(data => {
            supportedLanguages = data.supportedLanguages;
            langloaded = 1;
            updateLanguageUI();
        })
        .catch(error => console.error('Error loading languages:', error));
}

function updateLanguageUI() {
    if (langloaded === 1) {
        const currentLanguage = supportedLanguages[currentLanguageIndex];
        setTimeout(() => {
        fetch(`locales/${currentLanguage}.json`)
            .then(response => response.json())
            .then(translations => {
                document.getElementById('theme-toggle').title = translations.toggletheme;
                document.getElementById('minimize').title = translations.minimize;
                document.getElementById('close-app').title = translations.close;
                document.getElementById('error-title').innerText = translations.errorTitle;
                document.getElementById('error-message').innerText = translations.errorMessage;
                document.getElementById('exit_bt').innerText = translations.exit;;
                
                const nextLanguageIndex = (currentLanguageIndex + 1) % supportedLanguages.length;
                const nextLanguage = supportedLanguages[nextLanguageIndex];
                const langToggle = document.getElementById('lang-toggle');

                fetch(`locales/${nextLanguage}.json`)
                    .then(response => response.json())
                    .then(nextTranslations => {
                        langToggle.title = `${nextTranslations.switchTo} ${nextTranslations.langname}`;
                    })
                    .catch(error => console.error('Error loading next language translations:', error));
                    
                    window.translations = translations;
                })
        }, 200);
    };
};

function updateLangIcon() {
    const langToggle = document.getElementById('lang-toggle');
    const currentLanguage = supportedLanguages[currentLanguageIndex];
    langToggle.style.opacity = 0;

    setTimeout(() => {
        langToggle.src = `images/flags/${currentLanguage}.png`;
        langToggle.style.opacity = 1;
    }, 200);
}

document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLanguageIndex = (currentLanguageIndex + 1) % supportedLanguages.length;
    updateLanguageUI();
    updateLangIcon();
});

loadSupportedLanguages();
document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();
    loadSupportedLanguages();
    updateLanguageUI();
});