function loadTranslations() {
    return new Promise((resolve) => {
        const newTranslations = {};
        resolve(newTranslations);
    });
}

loadTranslations().then(newTranslations => {
    window.translations = newTranslations;
    updateErrorUI(newTranslations);
});

function updateErrorUI(translations) {
    document.getElementById('error-title').innerText = translations.errorTitle
    document.getElementById('error-message').innerText = translations.errorMessage
    document.getElementById('exit_bt').innerText = translations.exit
}

document.addEventListener('DOMContentLoaded', () => {
    loadTranslations();
});