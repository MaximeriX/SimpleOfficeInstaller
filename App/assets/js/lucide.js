(function (globalFactory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = globalFactory();
  } else {
    const lucide = globalFactory();
    if (typeof globalThis !== 'undefined') {
      globalThis.lucide = lucide;
    } else if (typeof window !== 'undefined') {
      window.lucide = lucide;
    } else if (typeof self !== 'undefined') {
      self.lucide = lucide;
    }
  }
})(function () {
  'use strict';

  const DefaultAttributes = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  };

  const IconNodes = {
    ChevronDown: [['path', { d: 'm6 9 6 6 6-6' }]],
    Download: [
      ['path', { d: 'M12 15V3' }],
      ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }],
      ['path', { d: 'm7 10 5 5 5-5' }]
    ],
    Grid3x3: [
      ['rect', { x: '2', y: '4', width: '20', height: '16', rx: '2' }],
      ['path', { d: 'M10 4v4' }],
      ['path', { d: 'M2 8h20' }],
      ['path', { d: 'M6 4v4' }]
    ],
    Info: [
      ['circle', { cx: '12', cy: '12', r: '10' }],
      ['path', { d: 'M12 16v-4' }],
      ['path', { d: 'M12 8h.01' }]
    ],
    Languages: [
      ['path', { d: 'm5 8 6 6' }],
      ['path', { d: 'm4 14 6-6 2-3' }],
      ['path', { d: 'M2 5h12' }],
      ['path', { d: 'M7 2h1' }],
      ['path', { d: 'm22 22-5-10-5 10' }],
      ['path', { d: 'M14 18h6' }]
    ],
    Minus: [['path', { d: 'M5 12h14' }]],
    Moon: [['path', { d: 'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401' }]],
    PackagePlus: [
      ['path', { d: 'M12 22V12' }],
      ['path', { d: 'M16 17h6' }],
      ['path', { d: 'M19 14v6' }],
      ['path', { d: 'M21 10.535V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.675-.955' }],
      ['path', { d: 'M3.29 7 12 12l8.71-5' }],
      ['path', { d: 'm7.5 4.27 8.997 5.148' }]
    ],
    Pencil: [
      ['path', { d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z' }],
      ['path', { d: 'm15 5 4 4' }]
    ],
    Search: [
      ['path', { d: 'm21 21-4.34-4.34' }],
      ['circle', { cx: '11', cy: '11', r: '8' }]
    ],
    Sun: [
      ['circle', { cx: '12', cy: '12', r: '4' }],
      ['path', { d: 'M12 2v2' }],
      ['path', { d: 'M12 20v2' }],
      ['path', { d: 'm4.93 4.93 1.41 1.41' }],
      ['path', { d: 'm17.66 17.66 1.41 1.41' }],
      ['path', { d: 'M2 12h2' }],
      ['path', { d: 'M20 12h2' }],
      ['path', { d: 'm6.34 17.66-1.41 1.41' }],
      ['path', { d: 'm19.07 4.93-1.41 1.41' }]
    ],
    Upload: [
      ['path', { d: 'M12 3v12' }],
      ['path', { d: 'm17 8-5-5-5 5' }],
      ['path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }]
    ],
    X: [
      ['path', { d: 'M18 6 6 18' }],
      ['path', { d: 'm6 6 12 12' }]
    ]
  };

  function createNode([tag, attrs, children]) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach((key) => {
      node.setAttribute(key, String(attrs[key]));
    });
    (children || []).forEach((child) => {
      node.appendChild(createNode(child));
    });
    return node;
  }

  function toPascalCase(value) {
    const camel = String(value || '').replace(/^([A-Z])|[\s-_]+(\w)/g, (match, first, next) => (
      next ? next.toUpperCase() : first.toLowerCase()
    ));
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  function getAttributes(element) {
    return Array.from(element.attributes).reduce((attrs, attribute) => {
      attrs[attribute.name] = attribute.value;
      return attrs;
    }, {});
  }

  function hasAccessibleAttributes(attrs) {
    return Object.keys(attrs).some((key) => key.startsWith('aria-') || key === 'role' || key === 'title');
  }

  function replaceIcon(element, options) {
    const iconName = element.getAttribute(options.nameAttr);
    if (iconName == null) {
      return;
    }

    const definition = options.icons[toPascalCase(iconName)];
    if (!definition) {
      console.warn(`${element.outerHTML} icon name was not found.`);
      return;
    }

    const originalAttrs = getAttributes(element);
    const accessibleAttrs = hasAccessibleAttributes(originalAttrs) ? {} : { 'aria-hidden': 'true' };
    const attrs = {
      ...DefaultAttributes,
      'data-lucide': iconName,
      ...accessibleAttrs,
      ...options.attrs,
      ...originalAttrs
    };

    const svg = createNode(['svg', attrs, definition]);
    element.parentNode && element.parentNode.replaceChild(svg, element);
  }

  function createIcons(options = {}) {
    const root = options.root || (typeof document !== 'undefined' ? document : null);
    if (!root || typeof root.querySelectorAll !== 'function') {
      return;
    }

    const settings = {
      nameAttr: options.nameAttr || 'data-lucide',
      attrs: options.attrs || {},
      icons: options.icons || IconNodes
    };

    root.querySelectorAll(`[${settings.nameAttr}]`).forEach((element) => {
      replaceIcon(element, settings);
    });
  }

  return {
    createIcons,
    icons: IconNodes,
    ChevronDown: IconNodes.ChevronDown,
    Download: IconNodes.Download,
    Grid3x3: IconNodes.Grid3x3,
    Info: IconNodes.Info,
    Languages: IconNodes.Languages,
    Minus: IconNodes.Minus,
    Moon: IconNodes.Moon,
    PackagePlus: IconNodes.PackagePlus,
    Pencil: IconNodes.Pencil,
    Search: IconNodes.Search,
    Sun: IconNodes.Sun,
    Upload: IconNodes.Upload,
    X: IconNodes.X
  };
});
