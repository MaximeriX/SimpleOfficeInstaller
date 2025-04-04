let currentLanguageIndex = 0;
let supportedLanguages = [];
let langloaded = 0;

function loadTranslations() {
    return new Promise((resolve) => {
        const newTranslations = {};
        resolve(newTranslations);
    });
}

loadTranslations().then(newTranslations => {
    window.translations = newTranslations;
});

function loadSupportedLanguages() {
    fetch('locales/list.json')
        .then(response => response.json())
        .then(data => {
            supportedLanguages = data.list;
            langloaded = 1;
        })
        .catch(error => console.error('Error loading languages:', error));
}

loadSupportedLanguages();

function updateLanguageUI() {
    if (langloaded === 1) {
        const currentLanguage = supportedLanguages[currentLanguageIndex];

        setTimeout(() => {
            resetForm();
        }, 200);

        setTimeout(() => {
        fetch(`locales/${currentLanguage}.json`)
            .then(response => response.json())
            .then(translations => {
                document.getElementById('theme-toggle').title = translations.toggletheme;
                document.getElementById('minimize').title = translations.minimize;
                document.getElementById('close-app').title = translations.close;
                document.getElementById('offiTR').innerText = translations.officeVersion;
                document.getElementById('editTR').innerText = translations.edition;
                document.getElementById('iconinf').title = translations.infoEdition;
                document.getElementById('iconinftwo').title = translations.infoEdition;
                document.getElementById('iconinfthr').title = translations.infoEdition;
                document.getElementById('appsTR').innerText = translations.apps;
                document.getElementById('biTR').title = translations.bingTitle;
                document.getElementById('lyTR').title = translations.lyncTitle;
                document.getElementById('peTR').innerText = translations.projectEdition;
                document.getElementById('veTR').innerText = translations.visioEdition;
                document.getElementById('ouTR').innerText = translations.outlookType;
                document.getElementById('teTR').innerText = translations.teamsType;
                document.getElementById('plTR').innerText = translations.primaryLang;
                document.getElementById('alTR').innerText = translations.additionalLang;
                document.getElementById('matchOSTR').innerText = translations.matchOS;
                document.getElementById('matchOSStTR').innerText = translations.matchOS;
                document.getElementById('apTR').innerText = translations.additionalProducts;
                document.getElementById('sbTR').innerText = translations.startButton;
                document.getElementById('exportTR').title = translations.exportTitle;
                document.getElementById('importTR').title = translations.importTitle;
                document.getElementById('author').innerText = translations.author;
                const nextLanguageIndex = (currentLanguageIndex + 1) % supportedLanguages.length;
                const nextLanguage = supportedLanguages[nextLanguageIndex];
                const langToggle = document.getElementById('lang-toggle');

                fetch(`locales/${nextLanguage}.json`)
                    .then(response => response.json())
                    .then(nextTranslations => {
                        langToggle.title = `${nextTranslations.switchTo} ${nextTranslations.langname}`;
                    })
                    .catch(error => console.error('Error loading next language translations:', error));
                    
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

                    const outlookTypeSelect = document.getElementById('outlook-type');
                    outlookTypeSelect.options[0].text = translations.select;
                
                    const teamsTypeSelect = document.getElementById('teams-type');
                    teamsTypeSelect.options[0].text = translations.select;
                
                    const primaryLangSelect = document.getElementById('primary-language');
                    primaryLangSelect.options[0].text = translations.select;
                    
                    const additionalProductsSelect = document.getElementById('additional-products');
                    additionalProductsSelect.options[0].text = translations.none;
                
                    window.translations = translations;

                    updateEditions();
                })
                .catch(error => console.error('Error loading translations:', error));
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

function resetForm () {
    document.getElementById('version').value = '';
    document.getElementById('edition').value = '';
    document.getElementById('project-edition').value = '';
    document.getElementById('visio-edition').value = '';
    document.getElementById('outlook-type').value = '';
    document.getElementById('teams-type').value = '';
    document.getElementById('primary-language').value = '';
    document.getElementById('additional-products').value = '';
    document.getElementById('additional-languages').classList.add("disabled");
    document.getElementById('AdditionalLangCursor').style.cursor = 'not-allowed';
    document.querySelectorAll('.language-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateEditions();
};

function getOSArchitecture() {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("WOW64") !== -1 || userAgent.indexOf("Win64") !== -1 || userAgent.indexOf("x64") !== -1) {
        return "64";
    } else {
        return "32";
    }
}

document.querySelector('.start-button').addEventListener('click', () => {
    const startButton = document.querySelector('.start-button');
    const importButton = document.querySelector('.import');
    if (validateForm()) {
        const isOutlookNewSelected = document.getElementById('outlook-type').value;
        const isTeamsSelected = document.getElementById('teams-type').value;
        const appsSelected = ['accessCheckbox', 'bingCheckbox','excelCheckbox', 'onedriveCheckbox', 'onenoteCheckbox', 'outlookCheckbox', 'powerpointCheckbox', 'publisherCheckbox', 'projectCheckbox', 'visioCheckbox', 'wordCheckbox'];
        const isAnyAppSelected = appsSelected.some(appId => document.getElementById(appId).checked);
        const tempDir = window.electron.path.join(window.electron.os.tmpdir(), 'OfficeSetupFiles');
        const configFilePath = window.electron.path.join(tempDir, 'config.xml');

        const xmlContent = generateXMLConfig();

        window.electron.fs.mkdir(tempDir);
        window.electron.fs.writeFile(configFilePath, xmlContent);
        console.log('Configuration file generated successfully at: ' + configFilePath);

        importButton.style.backgroundColor = "#00508d";
        importButton.classList.add("disabled"); 

        startButton.style.backgroundColor = "#00508d";
        startButton.style.color = "#ffffff";
        startButton.classList.add("disabled");

        function downloadOutlookNew () {
            const tempDir = window.electron.path.join(window.electron.os.tmpdir(), 'OfficeSetupFiles');
            const outlookNewSetupFilePath = window.electron.path.join(tempDir, 'OutlookNewSetup.exe');

            window.electron.fs.mkdir(tempDir);

            const url = 'https://res.cdn.office.net/nativehost/5mttl/installer/v2/indirect/Setup.exe';
            
            startButton.textContent = `${translations.startButtonOutlook}`;
            window.electron.downloadOutlookNewSetup(outlookNewSetupFilePath, url);
        }

        function downloadTeams () {
            const tempDir = window.electron.path.join(window.electron.os.tmpdir(), 'OfficeSetupFiles');
            const teamsSetupFilePath = window.electron.path.join(tempDir, 'MSTeamsSetup.exe');

            window.electron.fs.mkdir(tempDir);

            const url = 'https://statics.teams.cdn.office.net/evergreen-assets/DesktopClient/MSTeamsSetup.exe';
            
            startButton.textContent = `${translations.startButtonTeams}`;
            window.electron.downloadTeamsSetup(teamsSetupFilePath, url);
        }

        if (isOutlookNewSelected === 'outlookNewI') {
            downloadOutlookNew();
        } else {
            startButton.textContent = `${translations.startButtonOffice}`;
        }
        if (isOutlookNewSelected === 'outlookBothI') {
            downloadOutlookNew();
        } else {
            startButton.textContent = `${translations.startButtonOffice}`;
        }

        if (isTeamsSelected === 'teamsAddin') {
            downloadTeams();
        } else {
            startButton.textContent = `${translations.startButtonOffice}`;
        }
        if (isTeamsSelected === 'teamsBoth') {
            downloadTeams();
        } else {
            startButton.textContent = `${translations.startButtonOffice}`;
        }

        if (isAnyAppSelected) {
            const tempDir = window.electron.path.join(window.electron.os.tmpdir(), 'OfficeSetupFiles');
            const odtSetupFilePath = window.electron.path.join(tempDir, 'officedeploymenttool.exe');

            window.electron.fs.mkdir(tempDir);

            startButton.textContent = `${translations.startButtonOffice}`;

            const urlODT = 'https://download.microsoft.com/download/6c1eeb25-cf8b-41d9-8d0d-cc1dbc032140/officedeploymenttool_18526-20146.exe';

            window.electron.downloadOdtSetup(odtSetupFilePath, urlODT);
        }

        setTimeout(() => {
            startButton.textContent = `${translations.startButton}`;
            startButton.style.backgroundColor = "";
            startButton.style.color = "";
            startButton.classList.remove("disabled");
            importButton.style.backgroundColor = "";
            importButton.style.color = "";
            importButton.classList.remove("disabled");
        }, 15000);
    } else {
        startButton.textContent = `${translations.startButton}`;
        startButton.style.backgroundColor = "";
        startButton.style.color = "";
        startButton.classList.remove("disabled");
        importButton.style.backgroundColor = "";
        importButton.style.color = "";
        importButton.classList.remove("disabled");
    }
});

function generateXMLConfig() {
    const lang = document.getElementById('additional-languages').value;
    const primaryLanguage = document.getElementById('primary-language').value;
    const officeVersion = document.getElementById('version').value;
    const officeEdition = document.getElementById('edition').value;
    const additionalProducts = document.getElementById('additional-products').value;
    const isProjectSelected = document.getElementById('projectCheckbox').checked;
    const isVisioSelected = document.getElementById('visioCheckbox').checked;
    const projectEdition = document.getElementById('project-edition').value;
    const visioEdition = document.getElementById('visio-edition').value;
    
    let updateChannel, productID, productKey, productIDVS, productKeyVS, productIDPR, productKeyPR;

    const officeClientEdition = getOSArchitecture();

    if (officeVersion === 'office-365') {
        updateChannel = 'Current';
        productKey = '';
        if (officeEdition === 'enterprise') {
            productID = 'O365ProPlusRetail';
        } else if (officeEdition === 'enterprise-no-teams') {
            productID = 'O365ProPlusEEANoTeamsRetail';
        } else if (officeEdition === 'business') {
            productID = 'O365BusinessRetail';
        } else if (officeEdition === 'business-no-teams') {
            productID = 'O365BusinessEEANoTeamsRetail';
        }
    } else if (officeVersion === 'office-2024') {
        updateChannel = 'PerpetualVL2024';
        if (officeEdition === 'ltsc-pro-plus-vl') {
            productID = 'ProPlus2024Volume';
            productKey = 'XJ2XN-FW8RK-P4HMP-DKDBV-GCVGB';
        } else if (officeEdition === 'pro-plus-vl') {
            updateChannel = 'Broad';
            productID = 'ProPlus2024Retail';
            productKey = 'HD4NY-QVXPH-VPXH8-YY4WV-R9GQV';
        } else if (officeEdition === 'ltsc-stand-vl') {
            productID = 'Standard2024Volume';
            productKey = 'V28N4-JG22K-W66P8-VTMGK-H6HGR';
        }
    } else if (officeVersion === 'office-2021') {
        updateChannel = 'PerpetualVL2021';
        if (officeEdition === 'ltsc-pro-plus-vl') {
            productID = 'ProPlus2021Volume';
            productKey = 'FXYTK-NJJ8C-GB6DW-3DYQT-6F7TH';
        } else if (officeEdition === 'pro-plus-vl') {
            updateChannel = 'Broad';
            productID = 'ProPlus2021Retail';
            productKey = 'YNYDT-B8RMY-G8WJX-RPTY2-PG343';
        } else if (officeEdition === 'pro-rl') {
            updateChannel = 'Broad';
            productID = 'Professional2021Retail';
            productKey = 'G7R2D-6NQ7C-CX62B-9YR9J-DGRYH';
        } else if (officeEdition === 'ltsc-stand-vl') {
            productID = 'Standard2021Volume';
            productKey = 'KDX7X-BNVR8-TXXGX-4Q7Y8-78VT3';
        } else if (officeEdition === 'stand-vl') {
            updateChannel = 'Broad';
            productID = 'Standard2021Retail';
            productKey = 'RXK2W-N42KP-FT9W3-Q7DG8-TRBHK';
        } else if (officeEdition === 'personal-rl') {
            updateChannel = 'Broad';
            productID = 'Personal2021Retail';
            productKey = 'WN2B7-QJPXV-93VY2-6WTH3-BHC6H';
        }
    } else if (officeVersion === 'office-2019') {
        updateChannel = 'PerpetualVL2019';
        if (officeEdition === 'pro-plus-vl') {
            productID = 'ProPlus2019Volume';
            productKey = 'XJ2XN-FW8RK-P4HMP-DKDBV-GCVGB';
        } else if (officeEdition === 'pro-rl') {
            updateChannel = 'Broad';
            productID = 'Professional2019Retail';
            productKey = '7PND3-J7G8B-9M7V3-8VXHR-QGQYY';
        } else if (officeEdition === 'stand-vl') {
            productID = 'Standard2019Volume';
            productKey = '6NWWJ-YQWMR-QKGCB-6TMB3-9D9HK';
        } else if (officeEdition === 'personal-rl') {
            updateChannel = 'Broad';
            productID = 'Personal2019Retail';
            productKey = 'VQFTQ-GNRXK-HCVHQ-DWJDJ-JFJHV';
        }
    } else if (officeVersion === 'office-2016') {
        updateChannel = 'Broad';
        if (officeEdition === 'pro-plus-rl') {
            productID = 'ProPlusRetail';
            productKey = 'CYC3N-BHX8G-QJVJV-H2WWP-BTDRB';
        } else if (officeEdition === 'pro-rl') {
            productID = 'ProfessionalRetail';
            productKey = 'J2VPX-NMM9V-TPYKJ-P7VT2-3YJDQ';
        } else if (officeEdition === 'stand-rl') {
            productID = 'StandardRetail';
            productKey = 'PCCXN-7MKB3-F986V-V6HV4-CR4MR';
        } else if (officeEdition === 'personal-rl') {
            productID = 'PersonalRetail';
            productKey = 'CJKFJ-WNWBK-29CW7-P9786-C9X7Y';
        }
    }

    if (projectEdition === "project-online-desktop-client") {
        productIDPR = 'ProjectProRetail';
        productKeyPR = '';
    } else if (projectEdition === "pro-2024-vl") {
        productIDPR = 'ProjectPro2024Volume';
        productKeyPR = 'FQQ23-N4YCY-73HQ3-FM9WC-76HF4';
    } else if (projectEdition === "stand-2024-vl") {
        productIDPR = 'ProjectStd2024Volume';
        productKeyPR = 'PD3TT-NTHQQ-VC7CY-MFXK3-G87F8';
    } else if (projectEdition === "pro-2021-vl") {
        productIDPR = 'ProjectPro2021Volume';
        productKeyPR = 'FTNWT-C6WBT-8HMGF-K9PRX-QV9H8';
    } else if (projectEdition === "stand-2021-vl") {
        productIDPR = 'ProjectStd2021Volume';
        productKeyPR = 'J2JDC-NJCYY-9RGQ4-YXWMH-T3D4T';
    } else if (projectEdition === "pro-2019-vl") {
        productIDPR = 'ProjectPro2019Volume';
        productKeyPR = 'B4NPR-3FKK7-T2MBV-FRQ4W-PKD2B';
    } else if (projectEdition === "stand-2019-vl") {
        productIDPR = 'ProjectStd2019Volume';
        productKeyPR = 'C4F7P-NCP8C-6CQPT-MQHV9-JXD2M';
    } else if (projectEdition === "pro-2016-vl") {
        productIDPR = 'ProjectProXVolume';
        productKeyPR = 'WGT24-HCNMF-FQ7XH-6M8K7-DRTW9';
    } else if (projectEdition === "stand-2016-vl") {
        productIDPR = 'ProjectStdXVolume';
        productKeyPR = 'D8NRQ-JTYM3-7J2DX-646CT-6836M';
    }

    if (visioEdition === "visio-plan-2") {
        productIDVS = 'VisioProRetail';
        productKeyVS = '';
    } else if (visioEdition === "ltsc-pro-2024-vl") {
        productIDVS = 'VisioPro2024Volume';
        productKeyVS = 'B7TN8-FJ8V3-7QYCP-HQPMV-YY89G';
    } else if (visioEdition === "ltsc-stand-2024-vl") {
        productIDVS = 'VisioStd2024Volume';
        productKeyVS = 'JMMVY-XFNQC-KK4HK-9H7R3-WQQTV';
    } else if (visioEdition === "ltsc-pro-2021-vl") {
        productIDVS = 'VisioPro2021Volume';
        productKeyVS = 'KNH8D-FGHT4-T8RK3-CTDYJ-K2HT4';
    } else if (visioEdition === "ltsc-stand-2021-vl") {
        productIDVS = 'VisioStd2021Volume';
        productKeyVS = 'MJVNY-BYWPY-CWV6J-2RKRT-4M8QG';
    } else if (visioEdition === "ltsc-pro-2019-vl") {
        productIDVS = 'VisioPro2019Volume';
        productKeyVS = '9BGNQ-K37YR-RQHF2-38RQ3-7VCBB';
    } else if (visioEdition === "ltsc-stand-2019-vl") {
        productIDVS = 'VisioStd2019Volume';
        productKeyVS = '7TQNQ-K3YQQ-3PFH7-CCPPM-X4VQ2';
    } else if (visioEdition === "pro-2016-vl") {
        productIDVS = 'VisioProXVolume';
        productKeyVS = '69WXN-MBYV6-22PQG-3WGHK-RM6XC';
    } else if (visioEdition === "stand-2016-vl") {
        productIDVS = 'VisioStdXVolume';
        productKeyVS = 'NY48V-PPYYH-3F4PX-XJRKJ-W4423';
    }

    let xmlContent = `<Configuration>\n`;
    xmlContent += `  <Info Description="Created with https://github.com/MaximeriX/SimpleOfficeInstaller" />\n`
    xmlContent += `  <Add OfficeClientEdition="${officeClientEdition}" Channel="${updateChannel}">\n`;
    if (officeVersion === 'office-365') {
        xmlContent += `    <Product ID="${productID}">\n`;
    } else {
        xmlContent += `    <Product ID="${productID}" PIDKEY="${productKey}">\n`;
    }
    xmlContent += `      <Language ID="${primaryLanguage}" Fallback="en-us" />\n`;

    const additionalLanguages = Array.from(document.querySelectorAll('#additional-languages input[type="checkbox"]:checked'))
    .map(checkbox => checkbox.value);

    additionalLanguages.forEach(lang => {
        xmlContent += `      <Language ID="${lang}" />\n`;
    });

    const apps = ['Access', 'Bing', 'Excel', 'Groove', 'Lync', 'OneDrive', 'OneNote', 'PowerPoint', 'Publisher', 'Word'];
    apps.forEach(app => {
        const isChecked = document.getElementById(app.toLowerCase() + 'Checkbox').checked;
        if (!isChecked) {
            xmlContent += `      <ExcludeApp ID="${app}" />\n`;
        }
    });

    const outlookTypeValue = document.getElementById('outlook-type').value;
    if (outlookTypeValue === 'outlookClassic') {
        xmlContent += `      <ExcludeApp ID="OutlookForWindows" />\n`;
    }
    if (outlookTypeValue === 'outlookNew') {
        xmlContent += `      <ExcludeApp ID="Outlook" />\n`;
    }
    if (outlookTypeValue === '') {
        xmlContent += `      <ExcludeApp ID="Outlook" />\n`;
        xmlContent += `      <ExcludeApp ID="OutlookForWindows" />\n`;
    }

    const teamsTypeValue = document.getElementById('teams-type').value;
    if (teamsTypeValue === 'teamsAddin') {
        xmlContent += `      <ExcludeApp ID="Teams" />\n`;
    }
    if (teamsTypeValue === '') {
        xmlContent += `      <ExcludeApp ID="Teams" />\n`;
    }
    xmlContent += `    </Product>\n`;

    if (isProjectSelected) {
        if (projectEdition === 'project-online-desktop-client') {
            xmlContent += `    <Product ID="${productIDPR}">\n`;
        } else {
            xmlContent += `    <Product ID="${productIDPR}" PIDKEY="${productKeyPR}">\n`;
        }
        const additionalLanguages = Array.from(document.querySelectorAll('#additional-languages input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
        xmlContent += `      <Language ID="${primaryLanguage}" Fallback="en-us" />\n`;
    
        additionalLanguages.forEach(lang => {
            xmlContent += `      <Language ID="${lang}" />\n`;
        });

        const apps = ['Access', 'Bing', 'Excel', 'Groove', 'Lync', 'OneDrive', 'OneNote', 'PowerPoint', 'Publisher', 'Word'];
        apps.forEach(app => {
            const isChecked = document.getElementById(app.toLowerCase() + 'Checkbox').checked;
            if (!isChecked) {
                xmlContent += `      <ExcludeApp ID="${app}" />\n`;
            }
        });

        const outlookTypeValue = document.getElementById('outlook-type').value;
        if (outlookTypeValue === 'outlookClassic') {
            xmlContent += `      <ExcludeApp ID="OutlookForWindows" />\n`;
        }
        if (outlookTypeValue === 'outlookNew') {
            xmlContent += `      <ExcludeApp ID="Outlook" />\n`;
        }
    
        const teamsTypeValue = document.getElementById('teams-type').value;
        if (teamsTypeValue === 'teamsAddin') {
            xmlContent += `      <ExcludeApp ID="Teams" />\n`;
        }
        xmlContent += `    </Product>\n`;
    }

    if (isVisioSelected) {
        if (visioEdition === 'visio-plan-2') {
            xmlContent += `    <Product ID="${productIDVS}">\n`;
        } else {
            xmlContent += `    <Product ID="${productIDVS}" PIDKEY="${productKeyVS}">\n`;
        }
        const additionalLanguages = Array.from(document.querySelectorAll('#additional-languages input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
        xmlContent += `      <Language ID="${primaryLanguage}" Fallback="en-us" />\n`;
    
        additionalLanguages.forEach(lang => {
            xmlContent += `      <Language ID="${lang}" />\n`;
        });

        const apps = ['Access', 'Bing', 'Excel', 'Groove', 'Lync', 'OneDrive', 'OneNote', 'PowerPoint', 'Publisher', 'Word'];
        apps.forEach(app => {
            const isChecked = document.getElementById(app.toLowerCase() + 'Checkbox').checked;
            if (!isChecked) {
                xmlContent += `      <ExcludeApp ID="${app}" />\n`;
            }
        });

        const outlookTypeValue = document.getElementById('outlook-type').value;
        if (outlookTypeValue === 'outlookClassic') {
            xmlContent += `      <ExcludeApp ID="OutlookForWindows" />\n`;
        }
        if (outlookTypeValue === 'outlookNew') {
            xmlContent += `      <ExcludeApp ID="Outlook" />\n`;
        }
    
        const teamsTypeValue = document.getElementById('teams-type').value;
        if (teamsTypeValue === 'teamsAddin') {
            xmlContent += `      <ExcludeApp ID="Teams" />\n`;
        }
        xmlContent += `    </Product>\n`;
    }
    if (additionalProducts === 'office-365-access-runtime') {
        xmlContent += `    <Product ID="AccessRuntimeRetail">\n`;
        xmlContent += `      <Language ID="${primaryLanguage}" Fallback="en-us" />\n`;
        additionalLanguages.forEach(lang => {
            xmlContent += `      <Language ID="${lang}" />\n`;
        });
        xmlContent += `    </Product>\n`;
    }
    
    if (additionalProducts === 'language-pack') {
        xmlContent += `    <Product ID="LanguagePack">\n`;
        xmlContent += `      <Language ID="${primaryLanguage}" Fallback="en-us" />\n`;
        additionalLanguages.forEach(lang => {
            xmlContent += `      <Language ID="${lang}" />\n`;
        });
        xmlContent += `    </Product>\n`;
    }
    
    if (additionalProducts === 'skype-for-business-basic-2019') {
        xmlContent += `    <Product ID="SkypeforBusinessEntry2019Retail">\n`;
        xmlContent += `      <Language ID="${primaryLanguage}" Fallback="en-us" />\n`;
        additionalLanguages.forEach(lang => {
            xmlContent += `      <Language ID="${lang}" />\n`;
        });
        xmlContent += `    </Product>\n`;
    }

    xmlContent += `  </Add>\n`;
    xmlContent += `    <Property Name="SharedComputerLicensing" Value="0" />\n`;
    xmlContent += `    <Property Name="FORCEAPPSHUTDOWN" Value="FALSE" />\n`;
    xmlContent += `    <Property Name="DeviceBasedLicensing" Value="0" />\n`;
    xmlContent += `    <Property Name="SCLCacheOverride" Value="0" />\n`;
    xmlContent += `    <Property Name="AUTOACTIVATE" Value="1" />\n`;
    xmlContent += `    <Updates Enabled="TRUE" />\n`;
    xmlContent += `    <AppSettings>\n`;
    xmlContent += `      <User Key="software\\microsoft\\office\\16.0\\excel\\options" Name="defaultformat" Value="51" Type="REG_DWORD" App="excel16" Id="L_SaveExcelfilesas" />\n`;
    xmlContent += `      <User Key="software\\microsoft\\office\\16.0\\powerpoint\\options" Name="defaultformat" Value="27" Type="REG_DWORD" App="ppt16" Id="L_SavePowerPointfilesas" />\n`;
    xmlContent += `      <User Key="software\\microsoft\\office\\16.0\\word\\options" Name="defaultformat" Value="" Type="REG_SZ" App="word16" Id="L_SaveWordfilesas" />\n`;
    xmlContent += `    </AppSettings>\n`;
    xmlContent += `    <Display Level="Full" AcceptEULA="TRUE" />\n`;
    xmlContent += `</Configuration>\n`;

    return xmlContent;
}

document.querySelector('.export').addEventListener('click', async () => {
    const exportButton = document.querySelector('.export');

    exportButton.style.backgroundColor = "#00508d";
    exportButton.classList.add("disabled"); 

    if (validateForm()) {
        const xmlContent = generateXMLConfig();

        const result = await window.electron.dialog.showSaveDialog({
            title: translations.exportFile,
            defaultPath: 'Configuration.xml',
            filters: [
                { name: 'XML Files', extensions: ['xml'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });

        if (!result.canceled && result.filePath) {
            window.electron.fs.writeFile(result.filePath, xmlContent, (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    alert(translations.exportError);
                }
            });
            exportButton.style.backgroundColor = "";
            exportButton.style.color = "";
            exportButton.classList.remove("disabled");
        } else {
            exportButton.style.backgroundColor = "";
            exportButton.style.color = "";
            exportButton.classList.remove("disabled");
        }
    } else {
        exportButton.style.backgroundColor = "";
        exportButton.style.color = "";
        exportButton.classList.remove("disabled");
    }
});

document.querySelector('.import').addEventListener('click', async () => {
    const startButton = document.querySelector('.start-button');
    const importButton = document.querySelector('.import');

    importButton.style.backgroundColor = "#00508d";
    importButton.classList.add("disabled"); 

    const result = await window.electron.dialog.showOpenDialog({
        title: translations.importFile,
        filters: [
            { name: 'XML Files', extensions: ['xml'] }
        ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
        startButton.style.backgroundColor = "#00508d";
        startButton.style.color = "#ffffff";
        startButton.classList.add("disabled");       

        const xmlFilePath = result.filePaths[0];

        const tempDir = window.electron.path.join(window.electron.os.tmpdir(), 'OfficeSetupFiles');
        const destinationPath = window.electron.path.join(tempDir, 'config.xml');

        window.electron.fs.mkdir(tempDir);

        window.electron.fs.copyFile(xmlFilePath, destinationPath, (err) => {
            if (err) {
                console.error('Error copying file:', err);
                alert(translations.importError);
            } else {
                console.log('File copied successfully to:', destinationPath);
            }
        });
        const odtSetupFilePath = window.electron.path.join(tempDir, 'officedeploymenttool.exe');

        window.electron.fs.mkdir(tempDir);

        const urlODT = 'https://download.microsoft.com/download/6c1eeb25-cf8b-41d9-8d0d-cc1dbc032140/officedeploymenttool_18526-20146.exe';

        startButton.textContent = `${translations.startButtonOffice}`;

        window.electron.downloadOdtSetup(odtSetupFilePath, urlODT);

        setTimeout(() => {
            startButton.textContent = `${translations.startButton}`;
            startButton.style.backgroundColor = "";
            startButton.style.color = "";
            startButton.classList.remove("disabled");
            importButton.style.backgroundColor = "";
            importButton.style.color = "";
            importButton.classList.remove("disabled");
        }, 15000);
    } else {
        startButton.textContent = `${translations.startButton}`;
        startButton.style.backgroundColor = "";
        startButton.style.color = "";
        startButton.classList.remove("disabled");
        importButton.style.backgroundColor = "";
        importButton.style.color = "";
        importButton.classList.remove("disabled");
    }
});

function filterAdditionalLanguages() {
    const primaryLanguageSelect = document.getElementById('primary-language');
    const selectedPrimaryLanguage = primaryLanguageSelect.value;
    const additionalLanguageItems = document.querySelectorAll('#additional-languages .language-item');

    additionalLanguageItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox.value === selectedPrimaryLanguage) {
            item.checked = false;
            item.style.display = 'none';
        } else {
            item.style.display = '';
        }
    });
}

document.getElementById('edition').addEventListener('change', function() {
    this.style.border = "";
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const accessCheckbox = document.getElementById('accessCheckbox');
    const bingCheckbox = document.getElementById('bingCheckbox');
    const lyncCheckbox = document.getElementById('lyncCheckbox');
    const grooveCheckbox = document.getElementById('grooveCheckbox');
    const onenoteCheckbox = document.getElementById('onenoteCheckbox');
    const powerpointCheckbox = document.getElementById('powerpointCheckbox');
    const publisherCheckbox = document.getElementById('publisherCheckbox');
    const teamsCheckbox = document.getElementById('teamsCheckbox');
    const apps = document.getElementById('apps');

    checkboxes.forEach(checkbox => {
        const ProjectSelected = document.getElementById('projectCheckbox').checked;
        const VisioSelected = document.getElementById('visioCheckbox').checked;
        const OutlookSelected = document.getElementById('outlookCheckbox').checked;
        const TeamsSelected = document.getElementById('teamsCheckbox').checked;
        checkbox.disabled = !this.value;
        checkbox.checked = false;
        const projectEdition = document.getElementById('projectCheckbox');
        const visioEdition = document.getElementById('visioCheckbox');
        const outlookType = document.getElementById('outlookCheckbox');
        const teamsType = document.getElementById('teamsCheckbox');

        document.getElementById('project-edition').disabled = true;
        document.getElementById('visio-edition').disabled = true;
        document.getElementById('outlook-type').disabled = true;
        document.getElementById('teams-type').disabled = true;

        if (ProjectSelected) {
            projectEdition.disabled = true;
            projectEdition.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        } else {
            projectEdition.disabled = false;
        }

        if (VisioSelected) {
            visioEdition.disabled = true;
            visioEdition.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        } else {
            visioEdition.disabled = false;
        }

        if (OutlookSelected) {
            outlookType.disabled = true;
            outlookType.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        } else {
            outlookType.disabled = false;
        }

        if (TeamsSelected) {
            teamsType.disabled = true;
            teamsType.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        } else {
            teamsType.disabled = false;
        }
    });

    const selectedOfficeVersion = document.getElementById('version').value;
    const selectedEdition = document.getElementById('edition').value;

    accessCheckbox.checked = false;
    accessCheckbox.disabled = false;
    bingCheckbox.checked = false;
    bingCheckbox.disabled = true;
    lyncCheckbox.checked = false;
    lyncCheckbox.disabled = false;
    grooveCheckbox.checked = false
    grooveCheckbox.disabled = false
    publisherCheckbox.checked = false;
    publisherCheckbox.disabled = false;
    teamsCheckbox.disabled = false;
    teamsCheckbox.checked = false;
    onenoteCheckbox.disabled = false;
    onenoteCheckbox.checked = false;
    powerpointCheckbox.disabled = false;
    powerpointCheckbox.checked = false;

    if (selectedOfficeVersion === 'office-365') {
        grooveCheckbox.disabled = false;
        bingCheckbox.disabled = false;
    } else if (selectedOfficeVersion === 'office-2024') {
        grooveCheckbox.disabled = true;
        publisherCheckbox.disabled = true;
        if (selectedEdition === 'ltsc-stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        }
    } else if (selectedOfficeVersion === 'office-2021') {
        grooveCheckbox.disabled = true;
        if (selectedEdition === 'pro-rl') {
            lyncCheckbox.disabled = true;
        } else if (selectedEdition === 'ltsc-stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        } else if (selectedEdition === 'stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        } else if (selectedEdition === 'personal-rl') {
            accessCheckbox.disabled = true;
            grooveCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
            onenoteCheckbox.disabled = true;
            powerpointCheckbox.disabled = true;
            publisherCheckbox.disabled = true;
        }
    } else if (selectedOfficeVersion === 'office-2019') {
        grooveCheckbox.disabled = false;
        if (selectedEdition === 'pro-rl') {
            lyncCheckbox.disabled = true;
            grooveCheckbox.disabled = true;
        } else if (selectedEdition === 'stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        } else if (selectedEdition === 'personal-rl') {
            accessCheckbox.disabled = true;
            grooveCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
            onenoteCheckbox.disabled = true;
            powerpointCheckbox.disabled = true;
            publisherCheckbox.disabled = true;
        }
    } else if (selectedOfficeVersion === 'office-2016') {
        grooveCheckbox.disabled = false;
        if (selectedEdition === 'pro-rl') {
            lyncCheckbox.disabled = true;
            grooveCheckbox.disabled = true;
        } else if (selectedEdition === 'stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        } else if (selectedEdition === 'personal-rl') {
            accessCheckbox.disabled = true;
            grooveCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
            onenoteCheckbox.disabled = true;
            powerpointCheckbox.disabled = true;
            publisherCheckbox.disabled = true;
        }
    }
});

function updateEditions() {
    const versionSelect = document.getElementById('version');
    const editionSelect = document.getElementById('edition');
    const additionalProductsSelect = document.getElementById('additional-products');
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');

    editionSelect.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
    additionalProductsSelect.innerHTML = `<option value="" selected>${translations.none}</option>`;

    const selectedVersion = versionSelect.value;
    let editions = [];
    let additionalProducts = [];
    if (selectedVersion === 'office-365') {
        editions = [
            { value: 'enterprise', text: `${translations.enterprise}` },
            { value: 'enterprise-no-teams', text: `${translations.enterpriseNoTeams}` },
            { value: 'business', text: `${translations.business}` },
            { value: 'business-no-teams', text: `${translations.businessNoTeams}` },
        ];
        additionalProducts = [
            { value: 'language-pack', text: `${translations.languagePack}` },
            { value: 'office-365-access-runtime', text: `${translations.officeRuntime}` }
        ];
    } else if (selectedVersion === 'office-2024') {
        editions = [
            { value: 'ltsc-pro-plus-vl', text: `${translations.ltscProPlusVl}` },
            { value: 'pro-plus-vl', text: `${translations.proPlusVl}` },
            { value: 'ltsc-stand-vl', text: `${translations.ltscStandVl}` },
        ];
    } else if (selectedVersion === 'office-2021') {
        editions = [
            { value: 'ltsc-pro-plus-vl', text: `${translations.ltscProPlusVl}` },
            { value: 'pro-plus-vl', text: `${translations.proPlusVl}` },
            { value: 'pro-rl', text: `${translations.proRl}` },
            { value: 'personal-rl', text: `${translations.personalRl}` },
            { value: 'ltsc-stand-vl', text: `${translations.ltscStandVl}` },
            { value: 'stand-vl', text: `${translations.standVl}` }
        ];
        additionalProducts = [
            { value: 'language-pack', text: `${translations.languagePack}` },
            { value: 'office-365-access-runtime', text: `${translations.officeRuntime}` }
        ];
    } else if (selectedVersion === 'office-2019') {
        editions = [
            { value: 'pro-plus-vl', text: `${translations.proPlusVl}` },
            { value: 'pro-rl', text: `${translations.proRl}` },
            { value: 'personal-rl', text: `${translations.personalRl}` },
            { value: 'stand-vl', text: `${translations.standVl}` }
        ];
        additionalProducts = [
            { value: 'language-pack', text: `${translations.languagePack}` },
            { value: 'office-365-access-runtime', text: `${translations.officeRuntime}` },
            { value: 'skype-for-business-basic-2019', text: `${translations.skypeForBusinessBasic2019}` }
        ];
    } else if (selectedVersion === 'office-2016') {
        editions = [
            { value: 'pro-plus-vl', text: `${translations.proPlusRl}` },
            { value: 'pro-rl', text: `${translations.proRl}` },
            { value: 'personal-rl', text: `${translations.personalRl}` },
            { value: 'stand-vl', text: `${translations.standRl}` }
        ];
    }

    editions.forEach(edition => {
        const option = document.createElement('option');
        option.value = edition.value;
        option.textContent = edition.text;
        editionSelect.appendChild(option);
    });

    additionalProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.value;
        option.textContent = product.text;
        additionalProductsSelect.appendChild(option);
    });

    editionSelect.disabled = !selectedVersion;
    additionalProductsSelect.disabled = !selectedVersion;

    if (!selectedVersion) {
        checkboxes.forEach(checkbox => {
            const ProjectSelected = document.getElementById('projectCheckbox').checked;
            const VisioSelected = document.getElementById('visioCheckbox').checked;
            const OutlookSelected = document.getElementById('outlookCheckbox').checked;
            const TeamsSelected = document.getElementById('teamsCheckbox').checked;
            checkbox.disabled = !this.value;
            checkbox.checked = false;
            const projectEdition = document.getElementById('projectCheckbox');
            const visioEdition = document.getElementById('visioCheckbox');
            const outlookType = document.getElementById('outlookCheckbox');
            const teamsType = document.getElementById('teamsCheckbox');
    
            document.getElementById('project-edition').disabled = true;
            document.getElementById('visio-edition').disabled = true;
            document.getElementById('outlook-type').disabled = true;
            document.getElementById('teams-type').disabled = true;
            document.getElementById('project-edition').innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
            document.getElementById('visio-edition').innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
            document.getElementById('outlook-type').innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
            document.getElementById('teams-type').innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
    
            if (ProjectSelected) {
                projectEdition.disabled = true;
                projectEdition.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
            } else {
                projectEdition.disabled = false;
            }
    
            if (VisioSelected) {
                visioEdition.disabled = true;
                visioEdition.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
            } else {
                visioEdition.disabled = false;
            }

            if (OutlookSelected) {
                outlookType.disabled = true;
                outlookType.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
            } else {
                outlookType.disabled = false;
            }

            if (TeamsSelected) {
                teamsType.disabled = true;
                teamsType.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
            } else {
                teamsType.disabled = false;
            }
        });
    }

    checkboxes.forEach(checkbox => {
        checkbox.disabled = true;
    });
}

document.getElementById('version').addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    this.style.border = "";
    checkboxes.forEach(checkbox => {
        const ProjectSelected = document.getElementById('projectCheckbox').checked;
        const VisioSelected = document.getElementById('visioCheckbox').checked;
        const OutlookSelected = document.getElementById('outlookCheckbox').checked;
        const TeamsSelected = document.getElementById('teamsCheckbox').checked;
        checkbox.disabled = !this.value;
        checkbox.checked = false;
        const projectEdition = document.getElementById('projectCheckbox');
        const visioEdition = document.getElementById('visioCheckbox');
        const outlookType = document.getElementById('outlookCheckbox');
        const teamsType = document.getElementById('teamsCheckbox');

        document.getElementById('teams-type').innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        document.getElementById('visio-edition').innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        document.getElementById('outlook-type').innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        document.getElementById('teams-type').innerHTML = `<option value="" disabled selected>${translations.select}</option>`;

        if (ProjectSelected) {
            projectEdition.disabled = true;
            projectEdition.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        } else {
            projectEdition.disabled = false;
        }

        if (VisioSelected) {
            visioEdition.disabled = true;
            visioEdition.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        } else {
            visioEdition.disabled = false;
        }

        if (OutlookSelected) {
            outlookType.disabled = true;
            outlookType.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        } else {
            outlookType.disabled = false;
        }

        if (TeamsSelected) {
            teamsType.disabled = true;
            teamsType.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
        } else {
            teamsType.disabled = false;
        }
    });
    updateEditions();
});

document.getElementById('primary-language').addEventListener('change', function() {
    this.style.border = "";
    filterAdditionalLanguages();
});

document.getElementById('project-edition').addEventListener('change', function() {
    this.style.border = "";
});

document.getElementById('visio-edition').addEventListener('change', function() {
    this.style.border = "";
});

document.getElementById('outlook-type').addEventListener('change', function() {
    this.style.border = "";
});

document.getElementById('teams-type').addEventListener('change', function() {
    this.style.border = "";
});

function enableAdditionalLanguages() {
    document.getElementById('additional-languages').classList.remove('disabled');
    document.getElementById('AdditionalLangCursor').style.cursor = 'auto';
}

function toggleSubOptions(checkbox, subOptionsId) {
    const subOptions = document.getElementById(subOptionsId);
    if (checkbox.checked) {
        subOptions.style.display = 'block';
    }
    const editionSelect = document.getElementById(subOptionsId === 'project-options' ? 'project-edition' : 'visio-edition');
    editionSelect.disabled = !checkbox.checked;
}

document.getElementById('projectCheckbox').addEventListener('change', function() {
    if (!this.checked) {
        document.getElementById('project-edition').value = "";
        document.getElementById('project-edition').style.border = "";
    }
});

document.getElementById('visioCheckbox').addEventListener('change', function() {
    if (!this.checked) {
        document.getElementById('visio-edition').value = "";
        document.getElementById('visio-edition').style.border = "";
    }
});

document.getElementById('outlookCheckbox').addEventListener('change', function() {
    if (!this.checked) {
        document.getElementById('outlook-type').value = "";
        document.getElementById('outlook-type').style.border = "";
    }
    const outlookType = document.getElementById('outlook-type');
    if (this.checked) {
        outlookType.disabled = false;
    } else {
        outlookType.value = "";
        outlookType.disabled = true;
    }
});

document.getElementById('teamsCheckbox').addEventListener('change', function() {
    if (!this.checked) {
        document.getElementById('teams-type').value = "";
        document.getElementById('teams-type').style.border = "";
    }
    const teamsType = document.getElementById('teams-type');
    if (this.checked) {
        teamsType.disabled = false;
    } else {
        teamsType.value = "";
        teamsType.disabled = true;
    }
});

function updateProjectEditions() {
    const versionSelect = document.getElementById('version');
    const projectEdition = document.getElementById('project-edition');
    const version = versionSelect.value;

    let options = [];
    if (version === 'office-365') {
        options = [
            { value: 'project-online-desktop-client', text: `${translations.projectOnlineDesktopClient}` },
            { value: 'pro-2024-vl', text: `${translations.projectPro2024Vl}` },
            { value: 'stand-2024-vl', text: `${translations.projectStand2024Vl}` },
            { value: 'pro-2021-vl', text: `${translations.projectPro2021Vl}` },
            { value: 'stand-2021-vl', text: `${translations.projectStand2021Vl}` },
            { value: 'pro-2019-vl', text: `${translations.projectPro2019Vl}` },
            { value: 'stand-2019-vl', text: `${translations.projectStand2019Vl}` },
            { value: 'pro-2016-vl', text: `${translations.projectPro2016Vl}` },
            { value: 'stand-2016-vl', text: `${translations.projectStand2016Vl}` }
        ];
    } else if (version === 'office-2024') {
        options = [
            { value: 'pro-2024-vl', text: `${translations.projectPro2024Vl}` },
            { value: 'stand-2024-vl', text: `${translations.projectStand2024Vl}` }
        ];
    } else if (version === 'office-2021') {
        options = [
            { value: 'pro-2021-vl', text: `${translations.projectPro2021Vl}` },
            { value: 'stand-2021-vl', text: `${translations.projectStand2021Vl}` },
            { value: 'pro-2019-vl', text: `${translations.projectPro2019Vl}` },
            { value: 'stand-2019-vl', text: `${translations.projectStand2019Vl}` },
            { value: 'pro-2016-vl', text: `${translations.projectPro2016Vl}` },
            { value: 'stand-2016-vl', text: `${translations.projectStand2016Vl}` }
        ];
    } else if (version === 'office-2019') {
        options = [
            { value: 'pro-2019-vl', text: `${translations.projectPro2019Vl}` },
            { value: 'stand-2019-vl', text: `${translations.projectStand2019Vl}` },
            { value: 'pro-2016-vl', text: `${translations.projectPro2016Vl}` },
            { value: 'stand-2016-vl', text: `${translations.projectStand2016Vl}` }
        ];
    } else if (version === 'office-2016') {
        options = [
            { value: 'pro-2016-vl', text: `${translations.projectPro2016Vl}` },
            { value: 'stand-2016-vl', text: `${translations.projectStand2016Vl}` }
        ];
    }

    projectEdition.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;
    
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        projectEdition.appendChild(opt);
    });
}

function updateVisioEditions() {
    const versionSelect = document.getElementById('version');
    const visioEdition = document.getElementById('visio-edition');
    const version = versionSelect.value;

    let options = [];
    if (version === 'office-365') {
        options = [
            { value: 'visio-plan-2', text: `${translations.visioPlan2}` },
            { value: 'ltsc-pro-2024-vl', text: `${translations.visioLtscPro2024Vl}` },
            { value: 'ltsc-stand-2024-vl', text: `${translations.visioLtscStand2024Vl}` },
            { value: 'ltsc-pro-2021-vl', text: `${translations.visioLtscPro2021Vl}` },
            { value: 'ltsc-stand-2021-vl', text: `${translations.visioLtscStand2021Vl}` },
            { value: 'ltsc-pro-2019-vl', text: `${translations.visioLtscPro2019Vl}` },
            { value: 'ltsc-stand-2019-vl', text: `${translations.visioLtscStand2019Vl}` },
            { value: 'pro-2016-vl', text: `${translations.visioPro2016Vl}` },
            { value: 'stand-2016-vl', text: `${translations.visioStand2016Vl}` }
        ];        
    } else if (version === 'office-2024') {
        options = [
            { value: 'ltsc-pro-2024-vl', text: `${translations.visioLtscPro2024Vl}` },
            { value: 'ltsc-stand-2024-vl', text: `${translations.visioLtscStand2024Vl}` }
        ];
    } else if (version === 'office-2021') {
        options = [
            { value: 'ltsc-pro-2021-vl', text: `${translations.visioLtscPro2021Vl}` },
            { value: 'ltsc-stand-2021-vl', text: `${translations.visioLtscStand2021Vl}` },
            { value: 'ltsc-pro-2019-vl', text: `${translations.visioLtscPro2019Vl}` },
            { value: 'ltsc-stand-2019-vl', text: `${translations.visioLtscStand2019Vl}` },
            { value: 'pro-2016-vl', text: `${translations.visioPro2016Vl}` },
            { value: 'stand-2016-vl', text: `${translations.visioStand2016Vl}` }
        ];
    } else if (version === 'office-2019') {
        options = [
            { value: 'ltsc-pro-2019-vl', text: `${translations.visioLtscPro2019Vl}` },
            { value: 'ltsc-stand-2019-vl', text: `${translations.visioLtscStand2019Vl}` },
            { value: 'pro-2016-vl', text: `${translations.visioPro2016Vl}` },
            { value: 'stand-2016-vl', text: `${translations.visioStand2016Vl}` }
        ];
    } else if (version === 'office-2016') {
        options = [
            { value: 'pro-2016-vl', text: `${translations.visioPro2016Vl}` },
            { value: 'stand-2016-vl', text: `${translations.visioStand2016Vl}` }
        ];
    }

    visioEdition.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        visioEdition.appendChild(opt);
    });
}

function updateOutlookTypes() {
    const versionSelect = document.getElementById('version');
    const outlookType = document.getElementById('outlook-type');
    const version = versionSelect.value;

    let options = [];
    if (version === 'office-365') {
        options = [
            { value: 'outlookClassic', text: `${translations.outlookClassic}` },
            { value: 'outlookNew', text: `${translations.outlookNew}` },
            { value: 'outlookBoth', text: `${translations.outlookBoth}` }
        ];        
    } else {
        options = [
            { value: 'outlookClassic', text: `${translations.outlookClassic}` },
            { value: 'outlookNewI', text: `${translations.outlookNew}` },
            { value: 'outlookBothI', text: `${translations.outlookBoth}` }
        ];
    }

    outlookType.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        outlookType.appendChild(opt);
    });
}

function updateTeamsTypes() {
    const versionSelect = document.getElementById('version');
    const teamsType = document.getElementById('teams-type');
    const version = versionSelect.value;

    let options = [];
    if (version === 'office-365') {
        options = [
            { value: 'teamsAddin', text: `${translations.teamsAddin}` },
            { value: 'teamsBuiltin', text: `${translations.teamsBuiltin}` },
            { value: 'teamsBoth', text: `${translations.teamsBoth}` }
        ];        
    } else {
        options = [
            { value: 'teamsAddin', text: `${translations.teamsAddin}` }
        ];
    }

    teamsType.innerHTML = `<option value="" disabled selected>${translations.select}</option>`;

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        teamsType.appendChild(opt);
    });
}

function validateForm() {
    const versionSelect = document.getElementById('version');
    const editionSelect = document.getElementById('edition');
    const primaryLanguageSelect = document.getElementById('primary-language');
    const checkboxgroup = document.getElementById('apps');
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const selectedCheckboxes = Array.from(checkboxes).filter(checkbox => checkbox.checked);

    let isValid = true;

    if (!versionSelect.value) {
        versionSelect.style.border = "1.5px solid red";
        isValid = false;
    } else {
        versionSelect.style.border = "";
    }

    if (!editionSelect.value) {
        editionSelect.style.border = "1.5px solid red";
        isValid = false;
    } else {
        editionSelect.style.border = "";
    }

    if (!primaryLanguageSelect.value) {
        primaryLanguageSelect.style.border = "1.5px solid red";
        isValid = false;
    } else {
        primaryLanguageSelect.style.border = "";
    }

    if (selectedCheckboxes.length === 0) {
        checkboxgroup.style.border = "1.5px solid red";
        isValid = false;
    } else {
        checkboxgroup.style.border = "";
    }

    const projectCheckbox = document.querySelector('input[type="checkbox"][onchange="toggleSubOptions(this, \'project-options\')"]');
    const projectEdition = document.getElementById('project-edition');
    if (projectCheckbox.checked && !projectEdition.value) {
        projectEdition.style.border = "1.5px solid red";
        isValid = false;
    } else {
        projectEdition.style.border = "";
    }

    const visioCheckbox = document.querySelector('input[type="checkbox"][onchange="toggleSubOptions(this, \'visio-options\')"]');
    const visioEdition = document.getElementById('visio-edition');
    if (visioCheckbox.checked && !visioEdition.value) {
        visioEdition.style.border = "1.5px solid red";
        isValid = false;
    } else {
        visioEdition.style.border = "";
    }

    const outlookCheckbox = document.querySelector('input[type="checkbox"]#outlookCheckbox');
    const outlookType = document.getElementById('outlook-type');
    if (outlookCheckbox.checked && !outlookType.value) {
        outlookType.style.border = "1.5px solid red";
        isValid = false;
    } else {
        outlookType.style.border = "";
    }

    const teamsCheckbox = document.querySelector('input[type="checkbox"]#teamsCheckbox');
    const teamsType = document.getElementById('teams-type');
    if (teamsCheckbox.checked && !teamsType.value) {
        teamsType.style.border = "1.5px solid red";
        isValid = false;
    } else {
        teamsType.style.border = "";
    }

    if (isValid) {
        versionSelect.style.border = "";
        editionSelect.style.border = "";
        primaryLanguageSelect.style.border = "";
        checkboxgroup.style.border = "";
        projectEdition.style.border = "";
        visioEdition.style.border = "";
        outlookType.style.border = "";
        teamsType.style.border = "";
        checkboxgroup.style.border = "";
        checkboxgroup.style.borderRadius = "";
    }
    return isValid;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('version').addEventListener('change', updateEditions);
    document.getElementById('primary-language').addEventListener('change', enableAdditionalLanguages);
    loadTranslations();
    loadSupportedLanguages();
    const versionSelect = document.getElementById('version');
    versionSelect.addEventListener('change', () => {
        updateProjectEditions();
        updateVisioEditions();
        updateOutlookTypes();
        updateTeamsTypes();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const checkboxGroup = document.getElementById('apps');
    const checkboxes = document.querySelectorAll('#apps input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                checkboxGroup.style.border = "";
                checkboxGroup.style.borderRadius = "";
            }
        });
    });
});