const AppCheckboxes = document.querySelectorAll('.app-grid input[type="checkbox"]');

function setStartButtonLabel(message) {
  const startButton = document.querySelector('.start-button');
  const label = startButton ? startButton.querySelector('.start-button-label') : null;
  const text = message || translations.startButton || 'Launch Office Installer';

  if (label) {
    label.textContent = text;
    return;
  }

  if (startButton) {
    startButton.textContent = text;
  }
}

function setBusy(isBusy, message) {
  const startButton = document.querySelector('.start-button');
  const importButton = document.querySelector('.import-button');
  const exportButton = document.querySelector('.export-button');

  [startButton, importButton, exportButton].forEach((button) => {
    if (!button) {
      return;
    }
    button.classList.toggle('disabled', isBusy);
    button.disabled = isBusy;
  });

  if (startButton) {
    startButton.setAttribute('aria-busy', isBusy ? 'true' : 'false');
    setStartButtonLabel(isBusy ? (message || translations.busyPleaseWait || 'Please wait...') : null);
  }
}

function getAppCheckbox(appName) {
  const key = String(appName).toLowerCase();
  return document.querySelector(`.app-checkbox[data-app="${key}"]`) || {
    checked: false,
    disabled: true,
    style: {},
    addEventListener() {}
  };
}

function showError(message) {
  alert(message || translations.installError || 'Installer failed to start or completed with an error.');
}

function populateSelectOptions(select, placeholderText, options, disablePlaceholder = true) {
  select.value = '';
  select.innerHTML = `<option value="" ${disablePlaceholder ? 'disabled ' : ''}selected>${placeholderText}</option>`;
  options.forEach((option) => {
    const element = document.createElement('option');
    element.value = option.value;
    element.textContent = option.text;
    select.appendChild(element);
  });
}

function getCheckedAdditionalLanguages() {
  return Array.from(document.querySelectorAll('.additional-languages-panel input[type="checkbox"]:checked'))
    .map((checkbox) => checkbox.value);
}

function appendProductLanguages(xmlParts, primaryLanguage, additionalLanguages) {
  xmlParts.push(`    <Language ID="${primaryLanguage}" Fallback="en-us" />\n`);
  additionalLanguages.forEach((language) => {
    xmlParts.push(`    <Language ID="${language}" />\n`);
  });
}

function appendOfficeExclusions(xmlParts) {
  ['Access', 'Excel', 'Groove', 'Lync', 'OneDrive', 'OneNote'].forEach((app) => {
    if (!getAppCheckbox(app).checked) {
      xmlParts.push(`    <ExcludeApp ID="${app}" />\n`);
    }
  });

  const outlookType = document.getElementById('outlook-type').value;
  if (outlookType === 'classicI') {
    xmlParts.push('    <ExcludeApp ID="OutlookForWindows" />\n');
  }
  if (outlookType === 'outlookNewI') {
    xmlParts.push('    <ExcludeApp ID="Outlook" />\n');
  }
  if (!outlookType) {
    xmlParts.push('    <ExcludeApp ID="Outlook" />\n');
    xmlParts.push('    <ExcludeApp ID="OutlookForWindows" />\n');
  }

  ['PowerPoint', 'Publisher'].forEach((app) => {
    if (!getAppCheckbox(app).checked) {
      xmlParts.push(`    <ExcludeApp ID="${app}" />\n`);
    }
  });

  if (!document.getElementById('teams-type').value || document.getElementById('teams-type').value === 'teamsAddin') {
    xmlParts.push('    <ExcludeApp ID="Teams" />\n');
  }

  if (!getAppCheckbox('Word').checked) {
    xmlParts.push('    <ExcludeApp ID="Word" />\n');
  }
}

function appendOfficeProduct(xmlParts, productId, productKey, primaryLanguage, additionalLanguages) {
  xmlParts.push(productKey
    ? `  <Product ID="${productId}" PIDKEY="${productKey}">\n`
    : `  <Product ID="${productId}">\n`);
  appendProductLanguages(xmlParts, primaryLanguage, additionalLanguages);
  appendOfficeExclusions(xmlParts);
  xmlParts.push('  </Product>\n');
}

function appendAdditionalProduct(xmlParts, productId, primaryLanguage, additionalLanguages) {
  xmlParts.push(`  <Product ID="${productId}">\n`);
  appendProductLanguages(xmlParts, primaryLanguage, additionalLanguages);
  xmlParts.push('  </Product>\n');
}

function registerSelectChange(selectId, onChange) {
  document.getElementById(selectId).addEventListener('change', function() {
    this.style.border = '';
    if (onChange) {
      onChange.call(this);
    }
  });
}

function resetSubOptionSelects() {
  ['project-edition', 'visio-edition', 'outlook-type', 'teams-type'].forEach((selectId) => {
    const select = document.getElementById(selectId);
    populateSelectOptions(select, translations.select, []);
    select.disabled = true;
  });
}

function collectInstallerSelections() {
  const outlookType = document.getElementById('outlook-type').value;
  const teamsType = document.getElementById('teams-type').value;
  const installsTeamsWithOffice = ['teamsBuiltin', 'teamsBoth'].includes(teamsType);

  return {
    outlookType,
    teamsType,
    installOffice: [
      'access',
      'excel',
      'groove',
      'lync',
      'onedrive',
      'onenote',
      'outlook',
      'powerpoint',
      'publisher',
      'project',
      'visio',
      'word'
    ].some((appName) => getAppCheckbox(appName).checked) || installsTeamsWithOffice
  };
}

document.querySelector('.start-button').addEventListener('click', async () => {
  const startButton = document.querySelector('.start-button');
  if (startButton.disabled) {
    return;
  }

  if (!validateForm()) {
    setStartButtonLabel(translations.startButton);
    return;
  }

  const xmlContent = generateXMLConfig();
  const selections = collectInstallerSelections();
  let result;

  setBusy(true, translations.busyPleaseWait);
  try {
    result = await window.soi.installer.start({ xml: xmlContent, selections });
  } catch (error) {
    result = { ok: false, error: error.message };
  } finally {
    setBusy(false);
  }

  if (!result.ok && !result.dialogShown && !result.silent) {
    showError(result.error);
  }
  if (result.ok) {
    alert(translations.installSuccess || 'Office Installer started Successfully!\nThanks for using the app.');
  }
});

function generateXMLConfig() {
  const primaryLanguage = document.getElementById('primary-language').value;
  const officeVersion = document.getElementById('version').value;
  const officeEdition = document.getElementById('edition').value;
  const additionalProducts = document.getElementById('additional-products').value;
  const isProjectSelected = getAppCheckbox('project').checked;
  const isVisioSelected = getAppCheckbox('visio').checked;
  const projectEdition = document.getElementById('project-edition').value;
  const visioEdition = document.getElementById('visio-edition').value;
  const additionalLanguages = getCheckedAdditionalLanguages();
  const xmlParts = ['<Configuration>\n'];

  let updateChannel;
  let productID;
  let productKey;
  let productIDVS;
  let productKeyVS;
  let productIDPR;
  let productKeyPR;

  const officeClientEdition = (
    window.navigator.userAgent.indexOf('WOW64') !== -1 ||
    window.navigator.userAgent.indexOf('Win64') !== -1 ||
    window.navigator.userAgent.indexOf('x64') !== -1
  ) ? '64' : '32';

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
    } else if (officeEdition === 'small-business') {
      productID = 'O365SmallBusPremRetail';
    } else if (officeEdition === 'home') {
      productID = 'O365HomePremRetail';
    } else if (officeEdition === 'education') {
      productID = 'O365EduCloudRetail';
    }
  } else if (officeVersion === 'office-2024') {
    updateChannel = 'PerpetualVL2024';
    if (officeEdition === 'ltsc-pro-plus-vl') {
      productID = 'ProPlus2024Volume';
      productKey = 'XJ2XN-FW8RK-P4HMP-DKDBV-GCVGB';
    } else if (officeEdition === 'pro-plus-rl') {
      updateChannel = 'Broad';
      productID = 'ProPlus2024Retail';
      productKey = 'HD4NY-QVXPH-VPXH8-YY4WV-R9GQV';
    } else if (officeEdition === 'ltsc-stand-vl') {
      productID = 'Standard2024Volume';
      productKey = 'V28N4-JG22K-W66P8-VTMGK-H6HGR';
    } else if (officeEdition === 'home-rl') {
      updateChannel = 'Broad';
      productID = 'Home2024Retail';
      productKey = 'NHM39-W2C2G-6FXWB-KT7MM-QJ7KX';
    }   
  } else if (officeVersion === 'office-2021') {
    updateChannel = 'PerpetualVL2021';
    if (officeEdition === 'ltsc-pro-plus-vl') {
      productID = 'ProPlus2021Volume';
      productKey = 'FXYTK-NJJ8C-GB6DW-3DYQT-6F7TH';
    } else if (officeEdition === 'pro-plus-rl') {
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
    } else if (officeEdition === 'stand-rl') {
      updateChannel = 'Broad';
      productID = 'Standard2021Retail';
      productKey = 'RXK2W-N42KP-FT9W3-Q7DG8-TRBHK';
    } else if (officeEdition === 'personal-rl') {
      updateChannel = 'Broad';
      productID = 'Personal2021Retail';
      productKey = 'WN2B7-QJPXV-93VY2-6WTH3-BHC6H';
    } else if (officeEdition === 'home-student-rl') {
      updateChannel = 'Broad';
      productID = 'HomeStudent2021Retail';
      productKey = 'PB2D6-G4NJR-4CD7B-DF7RH-9BXFH';
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
    } else if (officeEdition === 'home-student-rl') {
      updateChannel = 'Broad';
      productID = 'HomeStudent2019Retail';
      productKey = 'NTMYR-DM4C3-MHK32-7QBRC-RVXB8';
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
    } else if (officeEdition === 'home-student-rl') {
      updateChannel = 'Broad';
      productID = 'HomeStudentRetail';
      productKey = 'RGNMP-V32H3-QBWXM-BF7XR-DJ3QD';
    }
  }

  if (projectEdition === 'project-online-desktop-client') {
    productIDPR = 'ProjectProRetail';
    productKeyPR = '';
  } else if (projectEdition === 'pro-2024-vl') {
    productIDPR = 'ProjectPro2024Volume';
    productKeyPR = 'FQQ23-N4YCY-73HQ3-FM9WC-76HF4';
  } else if (projectEdition === 'stand-2024-vl') {
    productIDPR = 'ProjectStd2024Volume';
    productKeyPR = 'PD3TT-NTHQQ-VC7CY-MFXK3-G87F8';
  } else if (projectEdition === 'pro-2021-vl') {
    productIDPR = 'ProjectPro2021Volume';
    productKeyPR = 'FTNWT-C6WBT-8HMGF-K9PRX-QV9H8';
  } else if (projectEdition === 'stand-2021-vl') {
    productIDPR = 'ProjectStd2021Volume';
    productKeyPR = 'J2JDC-NJCYY-9RGQ4-YXWMH-T3D4T';
  } else if (projectEdition === 'pro-2019-vl') {
    productIDPR = 'ProjectPro2019Volume';
    productKeyPR = 'B4NPR-3FKK7-T2MBV-FRQ4W-PKD2B';
  } else if (projectEdition === 'stand-2019-vl') {
    productIDPR = 'ProjectStd2019Volume';
    productKeyPR = 'C4F7P-NCP8C-6CQPT-MQHV9-JXD2M';
  } else if (projectEdition === 'pro-2016-vl') {
    productIDPR = 'ProjectProXVolume';
    productKeyPR = 'WGT24-HCNMF-FQ7XH-6M8K7-DRTW9';
  } else if (projectEdition === 'stand-2016-vl') {
    productIDPR = 'ProjectStdXVolume';
    productKeyPR = 'D8NRQ-JTYM3-7J2DX-646CT-6836M';
  }

  if (visioEdition === 'visio-plan-2') {
    productIDVS = 'VisioProRetail';
    productKeyVS = '';
  } else if (visioEdition === 'ltsc-pro-2024-vl') {
    productIDVS = 'VisioPro2024Volume';
    productKeyVS = 'B7TN8-FJ8V3-7QYCP-HQPMV-YY89G';
  } else if (visioEdition === 'ltsc-stand-2024-vl') {
    productIDVS = 'VisioStd2024Volume';
    productKeyVS = 'JMMVY-XFNQC-KK4HK-9H7R3-WQQTV';
  } else if (visioEdition === 'ltsc-pro-2021-vl') {
    productIDVS = 'VisioPro2021Volume';
    productKeyVS = 'KNH8D-FGHT4-T8RK3-CTDYJ-K2HT4';
  } else if (visioEdition === 'ltsc-stand-2021-vl') {
    productIDVS = 'VisioStd2021Volume';
    productKeyVS = 'MJVNY-BYWPY-CWV6J-2RKRT-4M8QG';
  } else if (visioEdition === 'ltsc-pro-2019-vl') {
    productIDVS = 'VisioPro2019Volume';
    productKeyVS = '9BGNQ-K37YR-RQHF2-38RQ3-7VCBB';
  } else if (visioEdition === 'ltsc-stand-2019-vl') {
    productIDVS = 'VisioStd2019Volume';
    productKeyVS = '7TQNQ-K3YQQ-3PFH7-CCPPM-X4VQ2';
  } else if (visioEdition === 'pro-2016-vl') {
    productIDVS = 'VisioProXVolume';
    productKeyVS = '69WXN-MBYV6-22PQG-3WGHK-RM6XC';
  } else if (visioEdition === 'stand-2016-vl') {
    productIDVS = 'VisioStdXVolume';
    productKeyVS = 'NY48V-PPYYH-3F4PX-XJRKJ-W4423';
  }

  xmlParts.push('  <Info Description="Generated by https://github.com/MaximeriX/SimpleOfficeInstaller" />\n');
  xmlParts.push(`  <Add OfficeClientEdition="${officeClientEdition}" Channel="${updateChannel}">\n`);
  appendOfficeProduct(xmlParts, productID, officeVersion === 'office-365' ? '' : productKey, primaryLanguage, additionalLanguages);

  if (isProjectSelected) {
    appendOfficeProduct(xmlParts, productIDPR, projectEdition === 'project-online-desktop-client' ? '' : productKeyPR, primaryLanguage, additionalLanguages);
  }

  if (isVisioSelected) {
    appendOfficeProduct(xmlParts, productIDVS, visioEdition === 'visio-plan-2' ? '' : productKeyVS, primaryLanguage, additionalLanguages);
  }

  if (additionalProducts === 'office-365-access-runtime') {
    appendAdditionalProduct(xmlParts, 'AccessRuntimeRetail', primaryLanguage, additionalLanguages);
  }

  if (additionalProducts === 'language-pack') {
    appendAdditionalProduct(xmlParts, 'LanguagePack', primaryLanguage, additionalLanguages);
  }

  if (additionalProducts === 'skype-for-business-basic-2019') {
    appendAdditionalProduct(xmlParts, 'SkypeforBusinessEntry2019Retail', primaryLanguage, additionalLanguages);
  }

  xmlParts.push('  </Add>\n');
  xmlParts.push('  <Property Name="SharedComputerLicensing" Value="0" />\n');
  xmlParts.push('  <Property Name="FORCEAPPSHUTDOWN" Value="FALSE" />\n');
  xmlParts.push('  <Property Name="DeviceBasedLicensing" Value="0" />\n');
  xmlParts.push('  <Property Name="SCLCacheOverride" Value="0" />\n');
  if (officeVersion !== 'office-365') {
    xmlParts.push('  <Property Name="AUTOACTIVATE" Value="1" />\n');
  }
  xmlParts.push('  <Updates Enabled="TRUE" />\n');
  xmlParts.push('  <AppSettings>\n');
  xmlParts.push('    <User Key="software\\microsoft\\office\\16.0\\excel\\options" Name="defaultformat" Value="51" Type="REG_DWORD" App="excel16" Id="L_SaveExcelfilesas" />\n');
  xmlParts.push('    <User Key="software\\microsoft\\office\\16.0\\powerpoint\\options" Name="defaultformat" Value="27" Type="REG_DWORD" App="ppt16" Id="L_SavePowerPointfilesas" />\n');
  xmlParts.push('    <User Key="software\\microsoft\\office\\16.0\\word\\options" Name="defaultformat" Value="" Type="REG_SZ" App="word16" Id="L_SaveWordfilesas" />\n');
  xmlParts.push('  </AppSettings>\n');
  xmlParts.push('  <Display Level="Full" AcceptEULA="TRUE" />\n');
  xmlParts.push('</Configuration>\n');

  return xmlParts.join('');
}

document.querySelector('.export-button').addEventListener('click', async () => {
  if (validateForm()) {
    const xmlContent = generateXMLConfig();
    let result;

    setBusy(true, translations.busyPleaseWait);
    try {
      result = await window.soi.config.exportXml(xmlContent);
    } catch (error) {
      result = { ok: false, error: error.message };
    } finally {
      setBusy(false);
    }

    if (!result.ok && !result.canceled && !result.dialogShown) {
      showError(result.error || translations.exportError);
    }
  }
});

document.querySelector('.import-button').addEventListener('click', async () => {
  let result;

  setBusy(true, translations.busyPleaseWait);
  try {
    result = await window.soi.installer.importXmlAndStart();
  } catch (error) {
    result = { ok: false, error: error.message };
  } finally {
    setBusy(false);
  }

  if (!result.ok && !result.canceled && !result.dialogShown) {
    showError(result.error || translations.importError);
  }
});

registerSelectChange('edition', function() {
  const checkboxes = AppCheckboxes;
  const accessInput = getAppCheckbox('access');
  const lyncInput = getAppCheckbox('lync');
  const grooveInput = getAppCheckbox('groove');
  const onenoteInput = getAppCheckbox('onenote');
  const powerpointInput = getAppCheckbox('powerpoint');
  const publisherInput = getAppCheckbox('publisher');
  const teamsInput = getAppCheckbox('teams');

  resetSubOptionSelects();
  checkboxes.forEach(checkbox => {
    checkbox.disabled = !this.value;
    checkbox.checked = false;
  });

  const selectedOfficeVersion = document.getElementById('version').value;
  const selectedEdition = document.getElementById('edition').value;

  accessInput.checked = false;
  accessInput.disabled = false;
  lyncInput.checked = false;
  lyncInput.disabled = false;
  grooveInput.checked = false
  grooveInput.disabled = false
  publisherInput.checked = false;
  publisherInput.disabled = false;
  teamsInput.disabled = false;
  teamsInput.checked = false;
  onenoteInput.disabled = false;
  onenoteInput.checked = false;
  powerpointInput.disabled = false;
  powerpointInput.checked = false;

  if (selectedOfficeVersion === 'office-365') {
    grooveInput.disabled = false;
    if (selectedEdition === 'home') {
      grooveInput.disabled = true;
      lyncInput.disabled = true;
    } else if (selectedEdition === 'education') {
      accessInput.disabled = true;
      grooveInput.disabled = true;
      lyncInput.disabled = true;
      publisherInput.disabled = true;
    }
  } else if (selectedOfficeVersion === 'office-2024') {
    grooveInput.disabled = true;
    publisherInput.disabled = true;
    if (selectedEdition === 'ltsc-stand-vl') {
      accessInput.disabled = true;
      lyncInput.disabled = true;
    } else if (selectedEdition === 'home-rl') {
      accessInput.disabled = true;
      lyncInput.disabled = true;
    }
  } else if (selectedOfficeVersion === 'office-2021') {
    grooveInput.disabled = true;
    if (selectedEdition === 'pro-rl') {
      lyncInput.disabled = true;
    } else if (selectedEdition === 'ltsc-stand-vl') {
      accessInput.disabled = true;
      lyncInput.disabled = true;
    } else if (selectedEdition === 'stand-rl') {
      accessInput.disabled = true;
      lyncInput.disabled = true;
    } else if (selectedEdition === 'personal-rl') {
      accessInput.disabled = true;
      grooveInput.disabled = true;
      lyncInput.disabled = true;
      onenoteInput.disabled = true;
      powerpointInput.disabled = true;
      publisherInput.disabled = true;
    } else if (selectedEdition === 'home-student-rl') {
      accessInput.disabled = true;
      lyncInput.disabled = true;
    }
  } else if (selectedOfficeVersion === 'office-2019') {
    grooveInput.disabled = false;
    if (selectedEdition === 'pro-rl') {
      lyncInput.disabled = true;
      grooveInput.disabled = true;
    } else if (selectedEdition === 'stand-rl') {
      accessInput.disabled = true;
      lyncInput.disabled = true;
    } else if (selectedEdition === 'personal-rl') {
      accessInput.disabled = true;
      grooveInput.disabled = true;
      lyncInput.disabled = true;
      onenoteInput.disabled = true;
      powerpointInput.disabled = true;
      publisherInput.disabled = true;
    } else if (selectedEdition === 'home-student-rl') {
      accessInput.disabled = true;
      lyncInput.disabled = true;
    }
  } else if (selectedOfficeVersion === 'office-2016') {
    grooveInput.disabled = false;
    if (selectedEdition === 'pro-rl') {
      lyncInput.disabled = true;
      grooveInput.disabled = true;
    } else if (selectedEdition === 'stand-vl') {
      accessInput.disabled = true;
      lyncInput.disabled = true;
    } else if (selectedEdition === 'personal-rl') {
      accessInput.disabled = true;
      grooveInput.disabled = true;
      lyncInput.disabled = true;
      onenoteInput.disabled = true;
      powerpointInput.disabled = true;
      publisherInput.disabled = true;
    } else if (selectedEdition === 'home-student-rl') {
      accessInput.disabled = true;
      lyncInput.disabled = true;
    }
  }
});

function updateEditions() {
  const versionSelect = document.getElementById('version');
  const editionSelect = document.getElementById('edition');
  const additionalProductsSelect = document.getElementById('additional-products');

  const selectedVersion = versionSelect.value;
  let editions = [];
  let additionalProducts = [];
  if (selectedVersion === 'office-365') {
    editions = [
      { value: 'enterprise', text: `${translations.enterprise}` },
      { value: 'enterprise-no-teams', text: `${translations.enterpriseNoTeams}` },
      { value: 'business', text: `${translations.business}` },
      { value: 'business-no-teams', text: `${translations.businessNoTeams}` },
      { value: 'small-business', text: `${translations.smallBusiness}` },
      { value: 'home', text: `${translations.homePrem}` },
      { value: 'education', text: `${translations.educationPrem}` },
    ];
    additionalProducts = [
      { value: 'language-pack', text: `${translations.languagePack}` },
      { value: 'office-365-access-runtime', text: `${translations.officeRuntime}` }
    ];
  } else if (selectedVersion === 'office-2024') {
    editions = [
      { value: 'ltsc-pro-plus-vl', text: `${translations.ltscProPlusVl}` },
      { value: 'pro-plus-rl', text: `${translations.proPlusRl}` },
      { value: 'ltsc-stand-vl', text: `${translations.ltscStandVl}` },
      { value: 'home-rl', text: `${translations.homeRl}` }
    ];
  } else if (selectedVersion === 'office-2021') {
    editions = [
      { value: 'ltsc-pro-plus-vl', text: `${translations.ltscProPlusVl}` },
      { value: 'pro-plus-rl', text: `${translations.proPlusRl}` },
      { value: 'pro-rl', text: `${translations.proRl}` },
      { value: 'ltsc-stand-vl', text: `${translations.ltscStandVl}` },
      { value: 'stand-rl', text: `${translations.standRl}` },
      { value: 'home-student-rl', text: `${translations.homeStudentRl}` },
      { value: 'personal-rl', text: `${translations.personalRl}` },
    ];
    additionalProducts = [
      { value: 'language-pack', text: `${translations.languagePack}` },
      { value: 'office-365-access-runtime', text: `${translations.officeRuntime}` }
    ];
  } else if (selectedVersion === 'office-2019') {
    editions = [
      { value: 'pro-plus-vl', text: `${translations.proPlusVl}` },
      { value: 'pro-rl', text: `${translations.proRl}` },
      { value: 'stand-vl', text: `${translations.standVl}` },
      { value: 'home-student-rl', text: `${translations.homeStudentRl}` },
      { value: 'personal-rl', text: `${translations.personalRl}` },
    ];
    additionalProducts = [
      { value: 'language-pack', text: `${translations.languagePack}` },
      { value: 'office-365-access-runtime', text: `${translations.officeRuntime}` },
      { value: 'skype-for-business-basic-2019', text: `${translations.skypeForBusinessBasic2019}` }
    ];
  } else if (selectedVersion === 'office-2016') {
    editions = [
      { value: 'pro-plus-rl', text: `${translations.proPlusRl}` },
      { value: 'pro-rl', text: `${translations.proRl}` },
      { value: 'stand-rl', text: `${translations.standRl}` },
      { value: 'home-student-rl', text: `${translations.homeStudentRl}` },
      { value: 'personal-rl', text: `${translations.personalRl}` }
    ];
  }

  populateSelectOptions(editionSelect, translations.select, editions);
  populateSelectOptions(additionalProductsSelect, translations.none, additionalProducts, false);

  editionSelect.disabled = !selectedVersion;
  additionalProductsSelect.disabled = !selectedVersion;

  if (!selectedVersion) {
    resetSubOptionSelects();
    AppCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  }

  AppCheckboxes.forEach(checkbox => {
    checkbox.disabled = true;
  });
}

registerSelectChange('version', function() {
  resetSubOptionSelects();
  AppCheckboxes.forEach(checkbox => {
    checkbox.disabled = !this.value;
    checkbox.checked = false;
  });
  updateEditions();
});

registerSelectChange('primary-language', function() {
  document.querySelector('.additional-languages-panel')?.classList.remove('disabled');

  document.querySelectorAll('.additional-languages-panel .language-list label').forEach((item) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (checkbox.value === this.value) {
      checkbox.checked = false;
      item.dataset.primaryHidden = 'true';
    } else {
      delete item.dataset.primaryHidden;
    }
  });

  window.dispatchEvent(new CustomEvent('soi:language-filter-updated'));
});

registerSelectChange('project-edition');
registerSelectChange('visio-edition');
registerSelectChange('outlook-type');
registerSelectChange('teams-type');

function toggleSubOptions(checkbox, subOptionsId) {
  const subOptions = document.getElementById(subOptionsId);
  if (subOptions) {
    subOptions.style.display = '';
  }
  const editionSelect = document.getElementById(subOptionsId === 'project-options' ? 'project-edition' : 'visio-edition');
  editionSelect.disabled = !checkbox.checked;
}

getAppCheckbox('project').addEventListener('change', function() {
  updateProjectEditions();
  if (!this.checked) {
    document.getElementById('project-edition').value = '';
    document.getElementById('project-edition').style.border = '';
  }
  toggleSubOptions(this, 'project-options');
  window.dispatchEvent(new CustomEvent('soi:selects-updated'));
});

getAppCheckbox('visio').addEventListener('change', function() {
  updateVisioEditions();
  if (!this.checked) {
    document.getElementById('visio-edition').value = '';
    document.getElementById('visio-edition').style.border = '';
  }
  toggleSubOptions(this, 'visio-options');
  window.dispatchEvent(new CustomEvent('soi:selects-updated'));
});

getAppCheckbox('outlook').addEventListener('change', function() {
  if (!this.checked) {
    document.getElementById('outlook-type').value = '';
    document.getElementById('outlook-type').style.border = '';
  }
  const outlookType = document.getElementById('outlook-type');
  if (this.checked) {
    outlookType.disabled = false;
  } else {
    outlookType.value = '';
    outlookType.disabled = true;
  }
});

getAppCheckbox('teams').addEventListener('change', function() {
  if (!this.checked) {
    document.getElementById('teams-type').value = '';
    document.getElementById('teams-type').style.border = '';
  }
  const teamsType = document.getElementById('teams-type');
  if (this.checked) {
    teamsType.disabled = false;
  } else {
    teamsType.value = '';
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

  populateSelectOptions(projectEdition, translations.select, options);

  window.dispatchEvent(new CustomEvent('soi:selects-updated'));
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

  populateSelectOptions(visioEdition, translations.select, options);

  window.dispatchEvent(new CustomEvent('soi:selects-updated'));
}

function updateOutlookTypes() {
  const versionSelect = document.getElementById('version');
  const editionSelect = document.getElementById('edition');
  const outlookType = document.getElementById('outlook-type');
  const version = versionSelect.value;
  const edition = editionSelect.value;

  let options = [];
  if (version === 'office-365') {
    if (edition === 'education') {
      options = [
        { value: 'outlookNewI', text: `${translations.outlookNew}` },
      ];    
    } else {
      options = [
        { value: 'classicI', text: `${translations.outlookClassic}` },
        { value: 'outlookNewI', text: `${translations.outlookNew}` },
        { value: 'outlookBothI', text: `${translations.outlookBoth}` }
      ];
    }
  } else {
    options = [
      { value: 'classicI', text: `${translations.outlookClassic}` },
      { value: 'outlookNewI', text: `${translations.outlookNew}` },
      { value: 'outlookBothI', text: `${translations.outlookBoth}` }
    ];
  }

  populateSelectOptions(outlookType, translations.select, options);
}

function updateTeamsTypes() {
  const versionSelect = document.getElementById('version');
  const editionSelect = document.getElementById('edition');
  const teamsType = document.getElementById('teams-type');
  const version = versionSelect.value;
  const edition = editionSelect.value;

  let options = [];
  if (version === 'office-365') {
    if (edition === 'education') {
      options = [
        { value: 'teamsAddin', text: `${translations.teamsAddin}` },
      ];    
    } else if (edition === 'home') {
      options = [
        { value: 'teamsAddin', text: `${translations.teamsAddin}` },
      ];    
    } else {
      options = [
        { value: 'teamsAddin', text: `${translations.teamsAddin}` },
        { value: 'teamsBuiltin', text: `${translations.teamsBuiltin}` },
        { value: 'teamsBoth', text: `${translations.teamsBoth}` }
      ];    
    }
  } else {
    options = [
      { value: 'teamsAddin', text: `${translations.teamsAddin}` }
    ];
  }

  populateSelectOptions(teamsType, translations.select, options);
}

function validateForm() {
  const versionSelect = document.getElementById('version');
  const editionSelect = document.getElementById('edition');
  const primaryLanguageSelect = document.getElementById('primary-language');
  const checkboxGroup = document.getElementById('apps');
  const selectedAppInputs = Array.from(AppCheckboxes).filter(checkbox => checkbox.checked);

  let isValid = true;

  if (!versionSelect.value) {
    versionSelect.style.border = '1.5px solid red';
    isValid = false;
  } else {
    versionSelect.style.border = '';
  }

  if (!editionSelect.value) {
    editionSelect.style.border = '1.5px solid red';
    isValid = false;
  } else {
    editionSelect.style.border = '';
  }

  if (!primaryLanguageSelect.value) {
    primaryLanguageSelect.style.border = '1.5px solid red';
    isValid = false;
  } else {
    primaryLanguageSelect.style.border = '';
  }

  if (selectedAppInputs.length === 0) {
    checkboxGroup.style.border = '1.5px solid red';
    isValid = false;
  } else {
    checkboxGroup.style.border = '';
  }

  const projectInput = getAppCheckbox('project');
  const projectEdition = document.getElementById('project-edition');
  if (projectInput.checked && !projectEdition.value) {
    projectEdition.style.border = '1.5px solid red';
    isValid = false;
  } else {
    projectEdition.style.border = '';
  }

  const visioInput = getAppCheckbox('visio');
  const visioEdition = document.getElementById('visio-edition');
  if (visioInput.checked && !visioEdition.value) {
    visioEdition.style.border = '1.5px solid red';
    isValid = false;
  } else {
    visioEdition.style.border = '';
  }

  const outlookInput = getAppCheckbox('outlook');
  const outlookType = document.getElementById('outlook-type');
  if (outlookInput.checked && !outlookType.value) {
    outlookType.style.border = '1.5px solid red';
    isValid = false;
  } else {
    outlookType.style.border = '';
  }

  const teamsInput = getAppCheckbox('teams');
  const teamsType = document.getElementById('teams-type');
  if (teamsInput.checked && !teamsType.value) {
    teamsType.style.border = '1.5px solid red';
    isValid = false;
  } else {
    teamsType.style.border = '';
  }

  if (isValid) {
    versionSelect.style.border = '';
    editionSelect.style.border = '';
    primaryLanguageSelect.style.border = '';
    checkboxGroup.style.border = '';
    projectEdition.style.border = '';
    visioEdition.style.border = '';
    outlookType.style.border = '';
    teamsType.style.border = '';
    checkboxGroup.style.border = '';
    checkboxGroup.style.borderRadius = '';
  }
  return isValid;
}

function setSelectValueIfAvailable(id, value) {
  const select = document.getElementById(id);
  if (!select || !value) {
    return;
  }

  const option = Array.from(select.options).find((item) => item.value === value && !item.hidden && !item.disabled);
  if (option) {
    select.value = option.value;
  }
}

function refreshLocalizedOptions() {
  const selected = {
    version: document.getElementById('version').value,
    edition: document.getElementById('edition').value,
    project: document.getElementById('project-edition').value,
    visio: document.getElementById('visio-edition').value,
    outlook: document.getElementById('outlook-type').value,
    teams: document.getElementById('teams-type').value,
    additionalProducts: document.getElementById('additional-products').value
  };

  populateSelectOptions(document.getElementById('version'), translations.select, [
    { value: 'office-365', text: translations.office365 },
    { value: 'office-2024', text: translations.office2024 },
    { value: 'office-2021', text: translations.office2021 },
    { value: 'office-2019', text: translations.office2019 },
    { value: 'office-2016', text: translations.office2016 }
  ]);
  setSelectValueIfAvailable('version', selected.version);
  updateEditions();
  setSelectValueIfAvailable('edition', selected.edition);
  setSelectValueIfAvailable('additional-products', selected.additionalProducts);
  updateProjectEditions();
  updateVisioEditions();
  updateOutlookTypes();
  updateTeamsTypes();
  setSelectValueIfAvailable('project-edition', selected.project);
  setSelectValueIfAvailable('visio-edition', selected.visio);
  setSelectValueIfAvailable('outlook-type', selected.outlook);
  setSelectValueIfAvailable('teams-type', selected.teams);
}

document.getElementById('version').addEventListener('change', () => {
  updateProjectEditions();
  updateVisioEditions();
  updateOutlookTypes();
  updateTeamsTypes();
});

document.getElementById('edition').addEventListener('change', () => {
  updateOutlookTypes();
  updateTeamsTypes();
});

window.soiI18n.ready.then(refreshLocalizedOptions);
window.addEventListener('soi:translations-updated', refreshLocalizedOptions);

const CheckboxGroup = document.getElementById('apps');
document.querySelectorAll('#apps input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener('change', function() {
    if (this.checked) {
      CheckboxGroup.style.border = '';
      CheckboxGroup.style.borderRadius = '';
    }
  });
});
