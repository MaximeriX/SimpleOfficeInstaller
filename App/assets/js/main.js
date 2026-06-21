(function () {
  const Dropdowns = new Map();
  let isDarkTheme = document.documentElement.classList.contains('dark');
  let dropdownRefreshFrame = 0;
  let tooltipElement = null;
  let activeTooltipTarget = null;
  let progressResetTimer = 0;
  let suppressUpdateProgress = false;
  let isInitializing = true;
  const ProgressPercentByType = {
    installer: 0,
    update: 0
  };

  const OfficeIconExtensions = {
    default: {
      access: 'svg',
      excel: 'svg',
      groove: 'png',
      lync: 'svg',
      onedrive: 'svg',
      onenote: 'svg',
      outlook: 'svg',
      powerpoint: 'svg',
      project: 'svg',
      publisher: 'svg',
      teams: 'svg',
      visio: 'svg',
      word: 'svg'
    },
    '2019': {
      access: 'svg',
      excel: 'svg',
      lync: 'svg',
      onenote: 'svg',
      outlook: 'svg',
      powerpoint: 'svg',
      project: 'svg',
      publisher: 'svg',
      visio: 'svg',
      word: 'svg'
    },
    '365': {
      access: 'svg',
      excel: 'svg',
      onedrive: 'svg',
      onenote: 'svg',
      outlook: 'svg',
      powerpoint: 'svg',
      teams: 'svg',
      word: 'svg'
    }
  };

  let officeIconElements = null;
  let officeIconPaths = {};

  function buildOfficeIconCache() {
    officeIconElements = Array.from(document.querySelectorAll('img[data-office-icon]'));
    const folderOrder = ['365', '2019', 'default'];
    officeIconPaths = {};
    officeIconElements.forEach((img) => {
      const icon = img.dataset.officeIcon;
      if (!officeIconPaths[icon]) {
        officeIconPaths[icon] = {};
        for (const folder of folderOrder) {
          const ext = OfficeIconExtensions[folder] && OfficeIconExtensions[folder][icon];
          if (ext) {
            officeIconPaths[icon][folder] = `assets/icons/office/${folder}/${icon}.${ext}`;
          }
        }
      }
    });
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function query(selector) {
    return document.querySelector(selector);
  }

  function updateOfficeIcons() {
    const version = byId('version')?.value;
    const is365 = version === 'office-365';
    const folders = is365 ? ['365', '2019', 'default'] : ['2019', 'default'];

    if (!officeIconElements) {
      buildOfficeIconCache();
    }

    officeIconElements.forEach((image) => {
      const icon = image.dataset.officeIcon;
      const iconPaths = officeIconPaths[icon];
      if (!iconPaths) return;
      const folder = folders.find((name) => iconPaths[name]) || 'default';
      const nextSrc = iconPaths[folder] || iconPaths.default;
      if (nextSrc && !image.getAttribute('src')?.endsWith(nextSrc)) {
        image.src = nextSrc;
      }
    });
  }

  function refreshLucideIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function applyTheme(options = {}) {
    const { refreshIcons = true } = options;
    document.documentElement.classList.toggle('dark', isDarkTheme);
    document.documentElement.classList.toggle('light', !isDarkTheme);
    window.soi?.window?.setBackgroundColor(isDarkTheme ? '#0c0c0e' : '#f6f7f9').catch(() => {});

    const icon = query('.theme-icon');
    if (!icon) {
      return;
    }

    icon.setAttribute('data-lucide', isDarkTheme ? 'moon' : 'sun');
    if (refreshIcons) {
      refreshLucideIcons();
    }
  }

  function getSelectedOption(select) {
    return select.options[select.selectedIndex] || select.options[0] || null;
  }

  function closeDropdown(dropdown) {
    dropdown.wrapper.classList.remove('open');
    dropdown.button.setAttribute('aria-expanded', 'false');
  }

  function positionDropdown(dropdown) {
    const margin = 8;
    const rect = dropdown.wrapper.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const openUp = spaceBelow < 185 && spaceAbove > spaceBelow;

    dropdown.wrapper.classList.toggle('drop-up', openUp);
  }

  function setDropdownOpen(dropdown, isOpen) {
    if (isOpen) {
      Dropdowns.forEach((otherDropdown) => {
        if (otherDropdown !== dropdown) {
          closeDropdown(otherDropdown);
        }
      });
      positionDropdown(dropdown);
      if (dropdown.searchable) {
        requestAnimationFrame(() => dropdown.searchInput?.focus());
      }
    }

    dropdown.wrapper.classList.toggle('open', isOpen);
    dropdown.button.setAttribute('aria-expanded', String(isOpen));
  }

  function toggleDropdown(dropdown) {
    setDropdownOpen(dropdown, !dropdown.wrapper.classList.contains('open'));
  }

  function selectDropdownOption(dropdown, optionOrValue) {
    const option = typeof optionOrValue === 'string'
      ? Array.from(dropdown.select.options).find((item) => item.value === optionOrValue) || null
      : optionOrValue;

    if (!option || option.disabled || option.hidden) {
      return;
    }

    dropdown.select.value = option.value;
    dropdown.select.dispatchEvent(new Event('change', { bubbles: true }));
    closeDropdown(dropdown);
    refreshDropdown(dropdown);
  }

  function applyDropdownSearch(dropdown) {
    if (!dropdown.searchable) {
      return;
    }

    const query = (dropdown.searchInput ? dropdown.searchInput.value : dropdown.searchQuery || '').trim().toLowerCase();
    dropdown.list.querySelectorAll('.select-option').forEach((item) => {
      item.hidden = Boolean(query && !(item.dataset.search || '').includes(query));
    });
  }

  function buildDropdownOptions(dropdown) {
    const { select, list } = dropdown;
    list.textContent = '';
    dropdown.searchInput = null;

    if (dropdown.searchable) {
      const search = document.createElement('div');
      search.className = 'select-search';

      const icon = document.createElement('svg');
      icon.setAttribute('data-lucide', 'search');
      icon.setAttribute('aria-hidden', 'true');

      const input = document.createElement('input');
      input.type = 'search';
      input.placeholder = (window.translations && window.translations.searchPrimary) || 'Search primary language';
      input.setAttribute('aria-label', (window.translations && window.translations.searchPrimary) || 'Search primary language');
      input.value = dropdown.searchQuery || '';

      input.addEventListener('input', () => {
        dropdown.searchQuery = input.value;
        applyDropdownSearch(dropdown);
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeDropdown(dropdown);
        }
        event.stopPropagation();
      });

      search.append(icon, input);
      list.appendChild(search);
      dropdown.searchInput = input;

      if (!isInitializing) {
        refreshLucideIcons();
      }
    }

    Array.from(select.options).forEach((option) => {
      if (option.hidden || (option.disabled && option.value === '')) {
        return;
      }

      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'select-option';
      item.disabled = option.disabled;
      item.dataset.value = option.value;
      item.dataset.search = `${option.textContent} ${option.value}`.toLowerCase();
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(option.selected));
      item.classList.toggle('selected', option.selected);

      if (select.classList.contains('language-select')) {
        const flag = document.createElement('img');
        flag.src = `assets/icons/flags/${option.value}.svg`;
        flag.alt = '';
        const label = document.createElement('span');
        label.textContent = option.textContent;
        item.append(flag, label);
      } else {
        item.textContent = option.textContent;
      }

      item.addEventListener('click', () => {
        selectDropdownOption(dropdown, item.dataset.value);
      });

      list.appendChild(item);
    });

    applyDropdownSearch(dropdown);
  }

  function refreshDropdown(dropdown) {
    const { wrapper, select, button, value } = dropdown;
    const selectedOption = getSelectedOption(select);
    const signature = Array.from(select.options)
      .map((option) => [
        option.value,
        option.textContent,
        option.disabled,
        option.hidden,
        option.selected
      ].join('\u0001'))
      .join('\u0002');

    if (signature !== dropdown.signature) {
      dropdown.signature = signature;
      buildDropdownOptions(dropdown);
    }

    value.textContent = selectedOption ? selectedOption.textContent : '';
    button.disabled = select.disabled;
    wrapper.classList.toggle('disabled', select.disabled);
    wrapper.classList.toggle('invalid', select.style.border.includes('red'));

    if (wrapper.classList.contains('open')) {
      positionDropdown(dropdown);
    }
  }

  function refreshDropdowns() {
    Dropdowns.forEach(refreshDropdown);
  }

  function scheduleDropdownRefresh() {
    if (dropdownRefreshFrame) {
      cancelAnimationFrame(dropdownRefreshFrame);
    }

    dropdownRefreshFrame = requestAnimationFrame(() => {
      dropdownRefreshFrame = 0;
      refreshDropdowns();
    });
  }

  function handleDropdownKeydown(event, dropdown) {
    if (event.key === 'Escape') {
      closeDropdown(dropdown);
      return;
    }

    if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      return;
    }

    event.preventDefault();

    if (event.key === 'Enter' || event.key === ' ') {
      toggleDropdown(dropdown);
      return;
    }

    const options = Array.from(dropdown.select.options).filter((option) => !option.disabled && !option.hidden);
    if (!options.length) {
      return;
    }

    const selectedOption = getSelectedOption(dropdown.select);
    const currentIndex = Math.max(0, options.indexOf(selectedOption));
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    const nextOption = options[(currentIndex + offset + options.length) % options.length];
    selectDropdownOption(dropdown, nextOption);
  }

  function enhanceSelect(select) {
    if (select.dataset.selectReady === 'true') {
      return;
    }

    const wrapper = select.closest('.select');
    const button = wrapper && wrapper.querySelector('.select-button');
    const value = wrapper && wrapper.querySelector('.select-value');
    const list = wrapper && wrapper.querySelector('.select-menu');

    if (!wrapper || !button || !value || !list) {
      return;
    }

    const dropdown = {
      wrapper,
      select,
      button,
      value,
      list,
      searchable: select.id === 'primary-language',
      searchInput: null,
      searchQuery: '',
      signature: ''
    };

    Dropdowns.set(select, dropdown);
    select.dataset.selectReady = 'true';
    select.setAttribute('aria-hidden', 'true');

    button.addEventListener('click', () => {
      if (!select.disabled) {
        toggleDropdown(dropdown);
      }
    });

    button.addEventListener('keydown', (event) => {
      handleDropdownKeydown(event, dropdown);
    });

    select.addEventListener('change', () => {
      refreshDropdown(dropdown);
    });

    new MutationObserver(() => {
      refreshDropdown(dropdown);
    }).observe(select, {
      attributes: true,
      attributeFilter: ['disabled', 'style'],
      childList: true,
      subtree: true
    });

    refreshDropdown(dropdown);
  }

  function enhanceSelects() {
    document.querySelectorAll('.select > select').forEach(enhanceSelect);
    refreshDropdowns();
  }

  function updateAdditionalLanguageSearchIndex() {
    document.querySelectorAll('#primary-language option, .language-select option').forEach((option) => {
      option.dataset.search = `${option.textContent} ${option.value}`.toLowerCase();
    });

    document.querySelectorAll('.additional-languages-panel .language-list label').forEach((label) => {
      const checkbox = label.querySelector('.language-checkbox');
      if (!checkbox) {
        return;
      }

      label.dataset.search = `${label.textContent} ${checkbox.value}`.toLowerCase();
    });
  }

  function applyAdditionalLanguageSearch() {
    const input = query('.additional-language-search');
    const searchQuery = input ? input.value.trim().toLowerCase() : '';
    const clearButton = querySelectorClearButton();

    if (clearButton) {
      clearButton.hidden = !searchQuery;
      clearButton.disabled = !searchQuery;
    }

    document.querySelectorAll('.additional-languages-panel .language-list label').forEach((label) => {
      const searchText = label.dataset.search || label.textContent.toLowerCase();
      label.hidden = label.dataset.primaryHidden === 'true' || Boolean(searchQuery && !searchText.includes(searchQuery));
    });
  }

  function syncAdditionalLanguageInteractivity() {
    const panel = query('.additional-languages-panel');
    if (!panel) {
      return;
    }

    const isDisabled = panel.classList.contains('disabled');
    const searchInput = query('.additional-language-search');
    const activeElement = document.activeElement;

    panel.toggleAttribute('inert', isDisabled);
    panel.setAttribute('aria-disabled', String(isDisabled));

    if (searchInput) {
      searchInput.disabled = isDisabled;
      searchInput.tabIndex = isDisabled ? -1 : 0;
    }

    panel.querySelectorAll('.language-checkbox').forEach((checkbox) => {
      checkbox.disabled = isDisabled;
      checkbox.tabIndex = isDisabled ? -1 : 0;
    });

    if (isDisabled && activeElement instanceof HTMLElement && panel.contains(activeElement)) {
      activeElement.blur();
    }
  }

  function querySelectorClearButton() {
    return query('.additional-language-search-clear');
  }

  function wireAdditionalLanguageSearch() {
    const input = query('.additional-language-search');
    const panel = query('.additional-languages-panel');
    const fieldLabel = document.querySelector('.field.additional-languages > label');
    const clearButton = querySelectorClearButton();

    if (!input || !panel) {
      return;
    }

    input.addEventListener('input', applyAdditionalLanguageSearch);
    input.addEventListener('mousedown', (_event) => {
      if (!panel.classList.contains('disabled')) {
        input.focus();
      }
    });
    fieldLabel?.addEventListener('click', () => {
      if (!panel.classList.contains('disabled')) {
        input.focus();
      }
    });
    clearButton?.addEventListener('click', () => {
      input.value = '';
      input.focus();
      applyAdditionalLanguageSearch();
    });
    new MutationObserver(syncAdditionalLanguageInteractivity).observe(panel, {
      attributes: true,
      attributeFilter: ['class']
    });
    window.addEventListener('soi:language-filter-updated', applyAdditionalLanguageSearch);
    syncAdditionalLanguageInteractivity();
    applyAdditionalLanguageSearch();
  }

  function wireCheckboxKeyboardSupport() {
    document.addEventListener('keydown', (event) => {
      const checkbox = event.target instanceof HTMLInputElement && event.target.matches('.checkbox')
        ? event.target
        : null;

      if (!checkbox || checkbox.disabled || event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      checkbox.click();
    });
  }

  function wireExternalLinks() {
    if (!window.soi || !window.soi.links) {
      return;
    }

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="https://"]');
      if (!link) {
        return;
      }

      event.preventDefault();
      window.soi.links.open(link.href).catch((error) => {
        console.error('Failed to open link:', error);
      });
    });
  }

  function getTooltipElement() {
    if (!tooltipElement) {
      tooltipElement = document.querySelector('.tooltip');
    }

    return tooltipElement;
  }

  function positionTooltip(target) {
    const tooltip = getTooltipElement();
    if (!tooltip) {
      return;
    }

    const gap = 8;
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const centeredLeft = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
    const left = Math.min(window.innerWidth - tooltipRect.width - gap, Math.max(gap, centeredLeft));
    const top = target.dataset.tooltipPosition === 'top'
      ? Math.max(gap, targetRect.top - tooltipRect.height - gap)
      : Math.min(
          window.innerHeight - tooltipRect.height - gap,
          targetRect.bottom + gap
        );

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function showTooltip(target) {
    const text = target.dataset.tooltip;
    const tooltip = getTooltipElement();
    if (!text || !tooltip) {
      return;
    }

    tooltip.classList.remove('visible');
    tooltip.classList.toggle('tooltip-top', target.dataset.tooltipPosition === 'top');
    tooltip.textContent = text;
    positionTooltip(target);
    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    const tooltip = getTooltipElement();
    if (tooltip) {
      tooltip.classList.remove('visible');
      tooltip.classList.remove('tooltip-top');
    }
  }

  function closestTooltipTarget(target) {
    return target instanceof Element ? target.closest('[data-tooltip]') : null;
  }

  function wireTooltips() {
    document.addEventListener('pointerover', (event) => {
      const target = closestTooltipTarget(event.target);
      if (!target || target === activeTooltipTarget) {
        return;
      }

      activeTooltipTarget = target;
      showTooltip(target);
    });

    document.addEventListener('pointermove', () => {
      if (activeTooltipTarget && activeTooltipTarget.dataset.tooltipStatic !== 'true') {
        positionTooltip(activeTooltipTarget);
      }
    });

    document.addEventListener('pointerout', (event) => {
      const target = closestTooltipTarget(event.target);
      if (!target || target !== activeTooltipTarget) {
        return;
      }

      if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) {
        return;
      }

      activeTooltipTarget = null;
      hideTooltip();
    });
  }

  function clearProgressResetTimer() {
    if (progressResetTimer) {
      window.clearTimeout(progressResetTimer);
      progressResetTimer = 0;
    }
  }

  function clampPercent(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.max(0, Math.min(100, parsed));
  }

  function setStartButtonProgress(isActive, detail, percent) {
    const actions = document.querySelector('.actions');
    const startButton = document.querySelector('.start-button');
    const label = startButton ? startButton.querySelector('.start-button-label') : null;

    if (!actions || !startButton || !label) {
      return;
    }

    if (!isActive) {
      actions.classList.remove('is-installer-progress');
      startButton.classList.remove('is-progress');
      startButton.style.removeProperty('--progress-percent');
      label.textContent = (window.translations && window.translations.startButton) || 'Launch Office Installer';
      return;
    }

    actions.classList.add('is-installer-progress');
    startButton.classList.add('is-progress');
    startButton.style.setProperty('--progress-percent', `${clampPercent(percent)}%`);
    label.textContent = detail || (window.translations && window.translations.busyPleaseWait) || 'Please wait...';
  }

  function setUpdateProgress(isActive, payload = {}) {
    const panel = document.querySelector('.progress-panel');
    const title = panel ? panel.querySelector('.progress-title') : null;
    const fill = panel ? panel.querySelector('.progress-fill') : null;
    const bar = panel ? panel.querySelector('.progress-bar') : null;
    const cancel = panel ? panel.querySelector('.progress-cancel') : null;

    if (!panel || !title || !fill || !bar || !cancel) {
      return;
    }

    if (!isActive) {
      document.body.classList.remove('update-progress-active');
      panel.hidden = true;
      fill.style.width = '0%';
      bar.setAttribute('aria-valuenow', '0');
      cancel.disabled = false;
      cancel.dataset.operationId = '';
      cancel.textContent = (window.translations && window.translations.btnCancel) || 'Cancel';
      title.textContent = (window.translations && window.translations.progressTitle) || 'Downloading update...';
      return;
    }

    const percent = clampPercent(payload.percent);
    const versionMatch = /(\d+(?:\.\d+){1,3})/.exec(payload.version || payload.title || '');
    const version = versionMatch ? versionMatch[1] : '';
    const detailText = payload.detail || payload.message || '';
    let titleText = version
      ? ((window.translations && window.translations.progressTitleVersion) || 'Downloading v{{version}} version...').replace('{{version}}', version)
      : (window.translations && window.translations.progressTitle) || 'Downloading update...';

    if (payload.state === 'cancelling') {
      titleText = (window.translations && window.translations.canceling) || 'Canceling...';
    } else if (detailText && !/^Downloading\s/i.test(detailText)) {
      titleText = detailText;
    }

    document.body.classList.add('update-progress-active');
    panel.hidden = false;
    title.textContent = titleText;
    fill.style.width = `${percent}%`;
    bar.setAttribute('aria-valuenow', String(Math.round(percent)));
    cancel.dataset.operationId = payload.operationId || '';
    cancel.disabled = !payload.canCancel;
    cancel.textContent = payload.state === 'cancelling'
      ? (window.translations && window.translations.canceling) || 'Canceling...'
      : (window.translations && window.translations.btnCancel) || 'Cancel';
  }

  function resetProgressUi() {
    clearProgressResetTimer();
    ProgressPercentByType.installer = 0;
    ProgressPercentByType.update = 0;
    setStartButtonProgress(false);
    setUpdateProgress(false);
  }

  function scheduleProgressUiReset(delay) {
    clearProgressResetTimer();
    progressResetTimer = window.setTimeout(() => {
      progressResetTimer = 0;
      resetProgressUi();
    }, delay);
  }

  function wireProgressUi() {
    if (!window.soi || !window.soi.progress) {
      return;
    }

    const cancelButton = document.querySelector('.progress-cancel');
    cancelButton?.addEventListener('click', async () => {
      const operationId = cancelButton.dataset.operationId;
      if (!operationId || cancelButton.disabled) {
        return;
      }

      suppressUpdateProgress = true;
      cancelButton.disabled = true;
      cancelButton.textContent = (window.translations && window.translations.canceling) || 'Canceling...';

      try {
        await window.soi.progress.cancel(operationId);
      } catch (error) {
        suppressUpdateProgress = false;
        console.error('Failed to cancel progress operation:', error);
      }
    });

    window.soi.progress.onUpdate((payload) => {
      clearProgressResetTimer();

      if (!payload || !payload.type) {
        resetProgressUi();
        return;
      }

      const isTerminal = ['complete', 'error', 'canceled'].includes(payload.state);
      const detail = payload.detail || payload.message || payload.title || (window.translations && window.translations.preparing) || 'Preparing...';
      if (Number.isFinite(payload.percent)) {
        ProgressPercentByType[payload.type] = payload.percent;
      }
      const percent = ProgressPercentByType[payload.type] || 0;

      if (payload.type === 'update') {
        if (suppressUpdateProgress && payload.state === 'progress') {
          return;
        }

        if (payload.state === 'cancelling' && suppressUpdateProgress) {
          setUpdateProgress(false);
          return;
        }

        if (suppressUpdateProgress && payload.state === 'canceled') {
          suppressUpdateProgress = false;
          setUpdateProgress(false);
          return;
        }

        if (payload.state === 'complete' || payload.state === 'error') {
          suppressUpdateProgress = false;
        }

        setStartButtonProgress(false);
        setUpdateProgress(true, {
          ...payload,
          detail,
          percent
        });
        if (isTerminal) {
          scheduleProgressUiReset(payload.state === 'canceled' ? 0 : 700);
        }
        return;
      }

      if (isTerminal && payload.state !== 'complete') {
        setStartButtonProgress(false);
        scheduleProgressUiReset(0);
        return;
      }

      setUpdateProgress(false);
      setStartButtonProgress(true, detail, percent);
      if (isTerminal) {
        scheduleProgressUiReset(500);
      }
    });
  }

  async function applyAppInfo() {
    if (!window.soi || !window.soi.app) {
      return;
    }

    try {
      const info = await window.soi.app.getInfo();
      document.querySelectorAll('[data-app-version]').forEach((element) => {
        element.textContent = `v${info.version}`;
        element.href = `https://github.com/MaximeriX/SimpleOfficeInstaller/releases/tag/v${info.version}`;
      });
    } catch (error) {
      console.error('Failed to load app metadata:', error);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    query('.theme-toggle')?.addEventListener('click', () => {
      isDarkTheme = !isDarkTheme;
      applyTheme();
    });
    applyTheme({ refreshIcons: false });
    updateAdditionalLanguageSearchIndex();
    wireAdditionalLanguageSearch();
    (function initSearchLabels() {
      const trans = window.translations || {};
      const additionalSearch = query('.additional-language-search');
      if (additionalSearch) {
        additionalSearch.placeholder = trans.searchAdditional || 'Search additional languages';
        additionalSearch.setAttribute('aria-label', trans.searchAdditional || 'Search additional languages');
      }
    })();
    updateOfficeIcons();
    byId('version')?.addEventListener('change', updateOfficeIcons);
    wireExternalLinks();
    wireTooltips();
    wireProgressUi();
    wireCheckboxKeyboardSupport();
    enhanceSelects();
    refreshLucideIcons();
    isInitializing = false;
    applyAppInfo();

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.select')) {
        Dropdowns.forEach(closeDropdown);
      }
      scheduleDropdownRefresh();
    });

    document.addEventListener('change', scheduleDropdownRefresh);
    window.addEventListener('soi:selects-updated', () => {
      updateAdditionalLanguageSearchIndex();
      scheduleDropdownRefresh();
    });
    window.addEventListener('soi:translations-updated', () => {
      const trans = window.translations || {};
      const primarySearch = document.querySelector('#primary-language + .select-button ~ .select-menu input[type="search"]');
      if (primarySearch) {
        primarySearch.placeholder = trans.searchPrimary || 'Search primary language';
        primarySearch.setAttribute('aria-label', trans.searchPrimary || 'Search primary language');
      }
      const additionalSearch = query('.additional-language-search');
      if (additionalSearch) {
        additionalSearch.placeholder = trans.searchAdditional || 'Search additional languages';
        additionalSearch.setAttribute('aria-label', trans.searchAdditional || 'Search additional languages');
      }
      updateAdditionalLanguageSearchIndex();
      applyAdditionalLanguageSearch();
      scheduleDropdownRefresh();
    });
    window.addEventListener('resize', scheduleDropdownRefresh);
  });
})();
