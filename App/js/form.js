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
    if (validateForm()) {
        const lang = document.getElementById('additional-languages').value;
        const primaryLanguage = document.getElementById('primary-language').value;
        const officeVersion = document.getElementById('version').value;
        const officeEdition = document.getElementById('edition').value;
        const additionalProducts = document.getElementById('additional-products').value;
        const isProjectSelected = document.getElementById('projectCheckbox').checked;
        const isVisioSelected = document.getElementById('visioCheckbox').checked;
        const projectEdition = document.getElementById('project-edition').value;
        const visioEdition = document.getElementById('visio-edition').value;    
        const isTeamsSelected = document.getElementById('teamsCheckbox').checked;
        const appsSelected = ['accessCheckbox', 'excelCheckbox', 'onedriveCheckbox', 'onenoteCheckbox', 'outlookCheckbox', 'powerpointCheckbox', 'publisherCheckbox', 'projectCheckbox', 'visioCheckbox', 'wordCheckbox'];
        const isAnyAppSelected = appsSelected.some(appId => document.getElementById(appId).checked);    
        const tempDir = window.electron.path.join(window.electron.os.tmpdir(), 'OfficeSetupFiles');
        const configFilePath = window.electron.path.join(tempDir, 'config.xml');
        
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
            } else if (officeEdition === 'pro-vl') {
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
            }
        } else if (officeVersion === 'office-2019') {
            updateChannel = 'PerpetualVL2019';
            if (officeEdition === 'pro-plus-vl') {
                productID = 'ProPlus2019Volume';
                productKey = 'XJ2XN-FW8RK-P4HMP-DKDBV-GCVGB';
            } else if (officeEdition === 'pro-vl') {
                updateChannel = 'Broad';
                productID = 'Professional2019Retail';
                productKey = '7PND3-J7G8B-9M7V3-8VXHR-QGQYY';
            } else if (officeEdition === 'stand-vl') {
                productID = 'Standard2019Volume';
                productKey = '6NWWJ-YQWMR-QKGCB-6TMB3-9D9HK';
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
        xmlContent += `  <Add OfficeClientEdition="${officeClientEdition}" Channel="${updateChannel}">\n`;
        if (officeVersion === 'office-365') {
            xmlContent += `    <Product ID="${productID}">\n`;
        } else {
            xmlContent += `    <Product ID="${productID}" PIDKEY="${productKey}">\n`;
        }
        xmlContent += `      <Language ID="${primaryLanguage}" />\n`;

        const additionalLanguages = Array.from(document.querySelectorAll('#additional-languages input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    
        additionalLanguages.forEach(lang => {
            xmlContent += `      <Language ID="${lang}" />\n`;
        });

        const apps = ['Access', 'Excel', 'Groove', 'Lync', 'OneDrive', 'OneNote', 'Outlook', 'PowerPoint', 'Publisher', 'Word'];
        apps.forEach(app => {
            const isChecked = document.getElementById(app.toLowerCase() + 'Checkbox').checked;
            if (!isChecked) {
                xmlContent += `      <ExcludeApp ID="${app}" />\n`;
            }
        });
        xmlContent += `    </Product>\n`;

        if (isProjectSelected) {
            if (projectEdition === 'project-online-desktop-client') {
                xmlContent += `    <Product ID="${productIDPR}">\n`;
            } else {
                xmlContent += `    <Product ID="${productIDPR}" PIDKEY="${productKeyPR}">\n`;
            }
            const additionalLanguages = Array.from(document.querySelectorAll('#additional-languages input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);
            xmlContent += `      <Language ID="${primaryLanguage}" />\n`;
        
            additionalLanguages.forEach(lang => {
                xmlContent += `      <Language ID="${lang}" />\n`;
            });

            const apps = ['Access', 'Excel', 'Groove', 'Lync', 'OneDrive', 'OneNote', 'Outlook', 'PowerPoint', 'Publisher', 'Word'];
            apps.forEach(app => {
                const isChecked = document.getElementById(app.toLowerCase() + 'Checkbox').checked;
                if (!isChecked) {
                    xmlContent += `      <ExcludeApp ID="${app}" />\n`;
                }
            });
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
            xmlContent += `      <Language ID="${primaryLanguage}" />\n`;
        
            additionalLanguages.forEach(lang => {
                xmlContent += `      <Language ID="${lang}" />\n`;
            });

            const apps = ['Access', 'Excel', 'Groove', 'OneDrive', 'OneNote', 'Outlook', 'PowerPoint', 'Publisher', 'Lync', 'Word'];
            apps.forEach(app => {
                const isChecked = document.getElementById(app.toLowerCase() + 'Checkbox').checked;
                if (!isChecked) {
                    xmlContent += `      <ExcludeApp ID="${app}" />\n`;
                }
            });
            xmlContent += `    </Product>\n`;
        }
        if (additionalProducts === 'office-365-access-runtime') {
            xmlContent += `    <Product ID="AccessRuntimeRetail">\n`;
            xmlContent += `      <Language ID="${primaryLanguage}" />\n`;
            additionalLanguages.forEach(lang => {
                xmlContent += `      <Language ID="${lang}" />\n`;
            });
            xmlContent += `    </Product>\n`;
        }
        
        if (additionalProducts === 'language-pack') {
            xmlContent += `    <Product ID="LanguagePack">\n`;
            xmlContent += `      <Language ID="${primaryLanguage}" />\n`;
            additionalLanguages.forEach(lang => {
                xmlContent += `      <Language ID="${lang}" />\n`;
            });
            xmlContent += `    </Product>\n`;
        }
        
        if (additionalProducts === 'skype-for-business-basic-2019') {
            xmlContent += `    <Product ID="SkypeforBusinessEntry2019Retail">\n`;
            xmlContent += `      <Language ID="${primaryLanguage}" />\n`;
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

        window.electron.fs.mkdir(tempDir);
        window.electron.fs.writeFile(configFilePath, xmlContent);
        console.log('Configuration file generated successfully at: ' + configFilePath);

        startButton.style.backgroundColor = "#00508d";
        startButton.style.color = "#ffffff";
        startButton.classList.add("disabled");

        if (isTeamsSelected) {
            const tempDir = window.electron.path.join(window.electron.os.tmpdir(), 'OfficeSetupFiles');
            const teamsSetupFilePath = window.electron.path.join(tempDir, 'MSTeamsSetup.exe');

            startButton.textContent = "Teams Installer has started...";

            window.electron.fs.mkdir(tempDir);

            const url = 'https://statics.teams.cdn.office.net/evergreen-assets/DesktopClient/MSTeamsSetup.exe';
            window.electron.downloadTeamsSetup(teamsSetupFilePath, url);
        } else {
            startButton.textContent = "Office Installer has started...";
        }
        if (isAnyAppSelected) {
            const tempDir = window.electron.path.join(window.electron.os.tmpdir(), 'OfficeSetupFiles');
            const odtSetupFilePath = window.electron.path.join(tempDir, 'officedeploymenttool.exe');

            window.electron.fs.mkdir(tempDir);

            startButton.textContent = "Office Installer has started...";

            const urlODT = 'https://download.microsoft.com/download/2/7/A/27AF1BE6-DD20-4CB4-B154-EBAB8A7D4A7E/officedeploymenttool_18129-20158.exe';

            window.electron.downloadOdtSetup(odtSetupFilePath, urlODT);
        }

        setTimeout(() => {
            startButton.textContent = "Launch Office Installer";
            startButton.style.backgroundColor = "";
            startButton.style.color = "";
            startButton.classList.remove("disabled");
        }, 15000);
    } else {
            startButton.textContent = "Launch Office Installer";
            startButton.style.backgroundColor = "";
            startButton.style.color = "";
            startButton.classList.remove("disabled");
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
    const lyncCheckbox = document.getElementById('lyncCheckbox');
    const grooveCheckbox = document.getElementById('grooveCheckbox');
    const publisherCheckbox = document.getElementById('publisherCheckbox');
    const teamsCheckbox = document.getElementById('teamsCheckbox');
    const apps = document.getElementById('apps');

    checkboxes.forEach(checkbox => {
        const ProjectSelected = document.getElementById('projectCheckbox').checked;
        const VisioSelected = document.getElementById('visioCheckbox').checked;
        checkbox.disabled = !this.value;
        checkbox.checked = false;
        const projectEdition = document.getElementById('projectCheckbox');
        const visioEdition = document.getElementById('visioCheckbox');

        document.getElementById('project-edition').disabled = true;
        document.getElementById('project-edition').value = '';
        document.getElementById('visio-edition').disabled = true;
        document.getElementById('visio-edition').value = '';

        if (VisioSelected) {
            projectEdition.disabled = true;
            projectEdition.innerHTML = '<option value="" disabled selected>-- Select --</option>';
        } else {
            projectEdition.disabled = false;
        }

        if (ProjectSelected) {
            visioEdition.disabled = true;
            visioEdition.innerHTML = '<option value="" disabled selected>-- Select --</option>';
        } else {
            visioEdition.disabled = false;
        }
    });

    const selectedOfficeVersion = document.getElementById('version').value;
    const selectedEdition = document.getElementById('edition').value;
    const offteams = document.getElementById('officeteams');
    const offteamscheck = document.getElementById('offteamscheck');
    const teams = document.getElementById('teams');

    accessCheckbox.checked = false;
    accessCheckbox.disabled = false;
    lyncCheckbox.checked = false;
    lyncCheckbox.disabled = false;
    grooveCheckbox.checked = false
    grooveCheckbox.disabled = false
    publisherCheckbox.checked = false;
    publisherCheckbox.disabled = false;
    teamsCheckbox.disabled = false;
    teamsCheckbox.checked = false;
    offteamscheck.checked = false;
    offteamscheck.disabled = true;
    offteams.style.display = 'none';
    teams.style.display = '';

    if (selectedOfficeVersion === 'office-365') {
        grooveCheckbox.disabled = false;
        teamsCheckbox.disabled = true;
        offteams.style.display = '';
        if (selectedEdition === 'enterprise') {
            teams.style.display = 'none';
            offteamscheck.checked = true;
        } else if (selectedEdition === 'enterprise-no-teams') {
            teams.style.display = 'none';
            offteamscheck.checked = false;
        } else if (selectedEdition === 'business') {
            teams.style.display = 'none';
            offteamscheck.checked = true;
        } else if (selectedEdition === 'business-no-teams') {
            teams.style.display = 'none';
            offteamscheck.checked = false;
        }
    } else if (selectedOfficeVersion === 'office-2024') {
        grooveCheckbox.disabled = true;
        publisherCheckbox.disabled = true;
        if (selectedEdition === 'ltsc-stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        }
    } else if (selectedOfficeVersion === 'office-2021') {
        grooveCheckbox.disabled = true;
        if (selectedEdition === 'pro-vl') {
            lyncCheckbox.disabled = true;
        } else if (selectedEdition === 'ltsc-stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        } else if (selectedEdition === 'stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        }
    } else if (selectedOfficeVersion === 'office-2019') {
        grooveCheckbox.disabled = false;
        if (selectedEdition === 'pro-vl') {
            lyncCheckbox.disabled = true;
            grooveCheckbox.disabled = true;
        } else if (selectedEdition === 'stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        }
    } else if (selectedOfficeVersion === 'office-2016') {
        grooveCheckbox.disabled = false;
        if (selectedEdition === 'pro-vl') {
            lyncCheckbox.disabled = true;
            grooveCheckbox.disabled = true;
        } else if (selectedEdition === 'stand-vl') {
            accessCheckbox.disabled = true;
            lyncCheckbox.disabled = true;
        }
    }
});

function updateEditions() {
    const versionSelect = document.getElementById('version');
    const editionSelect = document.getElementById('edition');
    const additionalProductsSelect = document.getElementById('additional-products');
    const teamsCheckbox = document.getElementById('teamsCheckbox');
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    const offteamscheck = document.getElementById('offteamscheck');

    editionSelect.innerHTML = '<option value="" disabled selected>-- Select --</option>';
    additionalProductsSelect.innerHTML = '<option value="" selected>None</option>';

    const selectedVersion = versionSelect.value;
    let editions = [];
    let additionalProducts = [];
    if (selectedVersion === 'office-365') {
        teamsCheckbox.checked = false;
        teamsCheckbox.disabled = true;
        offteamscheck.checked = false;
        offteamscheck.disabled = true;
        editions = [
            { value: 'enterprise', text: 'Enterprise' },
            { value: 'enterprise-no-teams', text: 'Enterprise (no Teams)' },
            { value: 'business', text: 'Business' },
            { value: 'business-no-teams', text: 'Business (no Teams)' }
        ];
        additionalProducts = [
            { value: 'language-pack', text: 'Language Pack' },
            { value: 'office-365-access-runtime', text: 'Office 365 Access Runtime' }
        ];
    } else if (selectedVersion === 'office-2024') {
        editions = [
            { value: 'ltsc-pro-plus-vl', text: 'LTSC Professional Plus - VL' },
            { value: 'pro-plus-vl', text: 'Professional Plus - VL' },
            { value: 'ltsc-stand-vl', text: 'LTSC Standard - VL' }
        ];
        teamsCheckbox.disabled = false;
    } else if (selectedVersion === 'office-2021') {
        editions = [
            { value: 'ltsc-pro-plus-vl', text: 'LTSC Professional Plus - VL' },
            { value: 'pro-plus-vl', text: 'Professional Plus - VL' },
            { value: 'pro-vl', text: 'Professional - VL' },
            { value: 'ltsc-stand-vl', text: 'LTSC Standard - VL' },
            { value: 'stand-vl', text: 'Standard - VL' }
        ];
        teamsCheckbox.disabled = false;
        additionalProducts = [
            { value: 'language-pack', text: 'Language Pack' },
            { value: 'office-365-access-runtime', text: 'Office 365 Access Runtime' }
        ];
    } else if (selectedVersion === 'office-2019') {
        editions = [
            { value: 'pro-plus-vl', text: 'Professional Plus - VL' },
            { value: 'pro-vl', text: 'Professional - VL' },
            { value: 'stand-vl', text: 'Standard - VL' }
        ];
        teamsCheckbox.disabled = false;
        additionalProducts = [
            { value: 'language-pack', text: 'Language Pack' },
            { value: 'office-365-access-runtime', text: 'Office 365 Access Runtime' },
            { value: 'skype-for-business-basic-2019', text: 'Skype for Business Basic 2019' }
        ];
    } else if (selectedVersion === 'office-2016') {
        editions = [
            { value: 'pro-plus-rl', text: 'Professional Plus - RL' },
            { value: 'pro-rl', text: 'Professional - RL' },
            { value: 'stand-rl', text: 'Standard - RL' }
        ];
        teamsCheckbox.disabled = false;
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
            checkbox.disabled = !this.value;
            checkbox.checked = false;
            const projectEdition = document.getElementById('projectCheckbox');
            const visioEdition = document.getElementById('visioCheckbox');
    
            document.getElementById('project-edition').disabled = true;
            document.getElementById('visio-edition').disabled = true;
            document.getElementById('project-edition').innerHTML = '<option value="" disabled selected>-- Select --</option>';
            document.getElementById('visio-edition').innerHTML = '<option value="" disabled selected>-- Select --</option>';
    
            if (ProjectSelected) {
                projectEdition.disabled = true;
                projectEdition.innerHTML = '<option value="" disabled selected>-- Select --</option>';
            } else {
                projectEdition.disabled = false;
            }
    
            if (VisioSelected) {
                visioEdition.disabled = true;
                visioEdition.innerHTML = '<option value="" disabled selected>-- Select --</option>';
            } else {
                visioEdition.disabled = false;
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
        checkbox.disabled = !this.value;
        checkbox.checked = false;
        const projectEdition = document.getElementById('projectCheckbox');
        const visioEdition = document.getElementById('visioCheckbox');

        document.getElementById('project-edition').disabled = true;
        document.getElementById('visio-edition').disabled = true;
        document.getElementById('project-edition').innerHTML = '<option value="" disabled selected>-- Select --</option>';
        document.getElementById('visio-edition').innerHTML = '<option value="" disabled selected>-- Select --</option>';

        if (VisioSelected) {
            projectEdition.disabled = true;
            projectEdition.innerHTML = '<option value="" disabled selected>-- Select --</option>';
        } else {
            projectEdition.disabled = false;
        }

        if (ProjectSelected) {
            visioEdition.disabled = true;
            visioEdition.innerHTML = '<option value="" disabled selected>-- Select --</option>';
        } else {
            visioEdition.disabled = false;
        }
    });
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

function enableAdditionalLanguages() {
    const additionalLanguages = document.getElementById('additional-languages');
    additionalLanguages.classList.remove('disabled');
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
    }
});

document.getElementById('visioCheckbox').addEventListener('change', function() {
    if (!this.checked) {
        document.getElementById('visio-edition').value = "";
    }
});

function updateProjectEditions() {
    const versionSelect = document.getElementById('version');
    const projectEdition = document.getElementById('project-edition');
    const version = versionSelect.value;

    let options = [];
    if (version === 'office-365') {
        options = [
            { value: 'project-online-desktop-client', text: 'Project Online Desktop Client' },
            { value: 'pro-2024-vl', text: 'Professional 2024 - Activated, VL' },
            { value: 'stand-2024-vl', text: 'Standard 2024 - Activated, VL' },
            { value: 'pro-2021-vl', text: 'Professional 2021 - Activated, VL' },
            { value: 'stand-2021-vl', text: 'Standard 2021 - Activated, VL' },
            { value: 'pro-2019-vl', text: 'Professional 2019 - Activated, VL' },
            { value: 'stand-2019-vl', text: 'Standard 2019 - Activated, VL' },
            { value: 'pro-2016-vl', text: 'Professional 2016 - Activated, VL' },
            { value: 'stand-2016-vl', text: 'Standard 2016 - Activated, VL' }
        ];
    } else if (version === 'office-2024') {
        options = [
            { value: 'pro-2024-vl', text: 'Professional 2024 - Activated, VL' },
            { value: 'stand-2024-vl', text: 'Standard 2024 - Activated, VL' }
        ];
    } else if (version === 'office-2021') {
        options = [
            { value: 'pro-2021-vl', text: 'Professional 2021 - Activated, VL' },
            { value: 'stand-2021-vl', text: 'Standard 2021 - Activated, VL' },
            { value: 'pro-2019-vl', text: 'Professional 2019 - Activated, VL' },
            { value: 'stand-2019-vl', text: 'Standard 2019 - Activated, VL' },
            { value: 'pro-2016-vl', text: 'Professional 2016 - Activated, VL' },
            { value: 'stand-2016-vl', text: 'Standard 2016 - Activated, VL' }
        ];
    } else if (version === 'office-2019') {
        options = [
            { value: 'pro-2019-vl', text: 'Professional 2019 - Activated, VL' },
            { value: 'stand-2019-vl', text: 'Standard 2019 - Activated, VL' },
            { value: 'pro-2016-vl', text: 'Professional 2016 - Activated, VL' },
            { value: 'stand-2016-vl', text: 'Standard 2016 - Activated, VL' }
        ];
    } else if (version === 'office-2016') {
        options = [
            { value: 'pro-2016-vl', text: 'Professional 2016 - Activated, VL' },
            { value: 'stand-2016-vl', text: 'Standard 2016 - Activated, VL' }
        ];
    }

    projectEdition.innerHTML = '<option value="" disabled selected>-- Select --</option>';
    
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
            { value: 'visio-plan-2', text: 'Visio Plan 2' },
            { value: 'ltsc-pro-2024-vl', text: 'LTSC Professional 2024 - Activated, VL' },
            { value: 'ltsc-stand-2024-vl', text: 'LTSC Standard 2024 - Activated, VL' },
            { value: 'ltsc-pro-2021-vl', text: 'LTSC Professional 2021 - Activated, VL' },
            { value: 'ltsc-stand-2021-vl', text: 'LTSC Standard 2021 - Activated, VL' },
            { value: 'ltsc-pro-2019-vl', text: 'LTSC Professional 2019 - Activated, VL' },
            { value: 'ltsc-stand-2019-vl', text: 'LTSC Standard 2019 - Activated, VL' },
            { value: 'pro-2016-vl', text: 'Professional 2016 - Activated, VL' },
            { value: 'stand-2016-vl', text: 'Standard 2016 - Activated, VL' }
        ];        
    } else if (version === 'office-2024') {
        options = [
            { value: 'ltsc-pro-2024-vl', text: 'LTSC Professional 2024 - Activated, VL' },
            { value: 'ltsc-stand-2024-vl', text: 'LTSC Standard 2024 - Activated, VL' }
        ];
    } else if (version === 'office-2021') {
        options = [
            { value: 'ltsc-pro-2021-vl', text: 'LTSC Professional 2021 - Activated, VL' },
            { value: 'ltsc-stand-2021-vl', text: 'LTSC Standard 2021 - Activated, VL' },
            { value: 'ltsc-pro-2019-vl', text: 'LTSC Professional 2019 - Activated, VL' },
            { value: 'ltsc-stand-2019-vl', text: 'LTSC Standard 2019 - Activated, VL' },
            { value: 'pro-2016-vl', text: 'Professional 2016 - Activated, VL' },
            { value: 'stand-2016-vl', text: 'Standard 2016 - Activated, VL' }
        ];
    } else if (version === 'office-2019') {
        options = [
            { value: 'ltsc-pro-2019-vl', text: 'LTSC Professional 2019 - Activated, VL' },
            { value: 'ltsc-stand-2019-vl', text: 'LTSC Standard 2019 - Activated, VL' },
            { value: 'pro-2016-vl', text: 'Professional 2016 - Activated, VL' },
            { value: 'stand-2016-vl', text: 'Standard 2016 - Activated, VL' }
        ];
    } else if (version === 'office-2016') {
        options = [
            { value: 'pro-2016-vl', text: 'Professional 2016 - Activated, VL' },
            { value: 'stand-2016-vl', text: 'Standard 2016 - Activated, VL' }
        ];
    }

    visioEdition.innerHTML = '<option value="" disabled selected>-- Select --</option>';

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.text;
        visioEdition.appendChild(opt);
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

    if (isValid) {
        versionSelect.style.border = "";
        editionSelect.style.border = "";
        primaryLanguageSelect.style.border = "";
        checkboxgroup.style.border = "";
        projectEdition.style.border = "";
        visioEdition.style.border = "";
        checkboxgroup.style.border = "";
        checkboxgroup.style.borderRadius = "";
    }

    return isValid;
}

document.addEventListener('DOMContentLoaded', () => {
    const versionSelect = document.getElementById('version');
    versionSelect.addEventListener('change', () => {
        updateProjectEditions();
        updateVisioEditions();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    updateEditions();
    document.getElementById('version').addEventListener('change', updateEditions);
    document.getElementById('primary-language').addEventListener('change', enableAdditionalLanguages);
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