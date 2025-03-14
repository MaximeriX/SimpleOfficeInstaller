window.electron.sendTranslations((event, translations) => {
    document.getElementById('theme-toggle').title = translations.toggletheme;
    document.getElementById('minimize').title = translations.minimize;
    document.getElementById('close-app').title = translations.close;
    document.getElementById('offiTR').innerText = translations.officeVersion;
    document.getElementById('editTR').innerText = translations.edition;
    document.getElementById('iconinf').title = translations.infoEdition;
    document.getElementById('iconinftwo').title = translations.infoEdition;
    document.getElementById('iconinfthr').title = translations.infoEdition;
    document.getElementById('appsTR').innerText = translations.apps;
    document.getElementById('peTR').innerText = translations.projectEdition;
    document.getElementById('veTR').innerText = translations.visioEdition;
    document.getElementById('plTR').innerText = translations.primaryLang;
    document.getElementById('alTR').innerText = translations.additionalLang;
    document.getElementById('matchOSTR').innerText = translations.matchOS;
    document.getElementById('matchOSStTR').innerText = translations.matchOS;
    document.getElementById('apTR').innerText = translations.additionalProducts;
    document.getElementById('sbTR').innerText = translations.startButton;
    document.getElementById('exportTR').title = translations.exportTitle;
    document.getElementById('importTR').title = translations.importTitle;
    document.getElementById('author').innerText = translations.author;

    const versionSelect = document.getElementById('version');
    versionSelect.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
    
    const options = [
        { value: 'office-365', text: translations.office365 },
        { value: 'office-2024', text: translations.office2024 },
        { value: 'office-2021', text: translations.office2021 },
        { value: 'office-2019', text: translations.office2019 },
        { value: 'office-2016', text: translations.office2016 }
    ];

    options.forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option.value;
        newOption.text = option.text;
        versionSelect.add(newOption);
    });

    const editionSelect = document.getElementById('edition');
    editionSelect.options[0].text = translations.select;

    const projectEditionSelect = document.getElementById('project-edition');
    projectEditionSelect.options[0].text = translations.select;

    const visioEditionSelect = document.getElementById('visio-edition');
    visioEditionSelect.options[0].text = translations.select;

    const primaryLangSelect = document.getElementById('primary-language');
    primaryLangSelect.options[0].text = translations.select;
    
    const additionalProductsSelect = document.getElementById('additional-products');
    additionalProductsSelect.options[0].text = translations.none;

    window.translations = translations;
});