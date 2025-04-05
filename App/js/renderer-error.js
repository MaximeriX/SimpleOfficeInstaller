window.electron.sendTranslations((event, translations) => {
    document.getElementById('theme-toggle').title = translations.toggletheme;
    document.getElementById('minimize').title = translations.minimize;
    document.getElementById('close-app').title = translations.close;
    document.getElementById('error-title').innerText = translations.errorTitle;
    document.getElementById('error-message').innerText = translations.errorMessage;
    document.getElementById('exit_bt').innerText = translations.exit;
    document.getElementById('author').innerText = translations.author;

    window.translations = translations;
});