const { app, BrowserWindow, dialog, ipcMain, shell, nativeTheme } = require('electron');
const fs = require('fs');
const http = require('http');
const https = require('https');
const os = require('os');
const path = require('path');
const { exec, execFile } = require('child_process');
const { fileURLToPath } = require('url');

const AppVersion = require('./package.json').version;
const UpdateUrl = 'https://raw.githubusercontent.com/MaximeriX/SimpleOfficeInstaller/refs/heads/main/update.json';
const OdtUrl = 'https://download.microsoft.com/download/6c1eeb25-cf8b-41d9-8d0d-cc1dbc032140/officedeploymenttool_20026-20112.exe';
const TeamsUrl = 'https://statics.teams.cdn.office.net/production-windows-x86/lkg/MSTeamsSetup.exe';
const OutlookNewUrl = 'https://res.cdn.office.net/nativehost/5mttl/installer/v2/indirect/Setup.exe';

let mainWindow;
let translations = {};
let operationCounter = 0;
let progressBaseBounds = null;
let progressBaseMinimumSize = null;
let progressBaseResizable = true;
let localeMetaCache = null;
let initialLocaleCache = '';
const ActiveOperations = new Map();

function appPath(...parts) {
  return path.join(__dirname, ...parts);
}

function getLocaleMeta() {
  if (localeMetaCache) {
    return localeMetaCache;
  }

  const fallback = {
    order: ['en_us'],
    aliases: {
      en_us: ['en', 'en_us']
    }
  };

  try {
    const raw = fs.readFileSync(appPath('assets', 'locales', 'list.json'), 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const order = Object.keys(parsed);
      if (order.length) {
        localeMetaCache = { order, aliases: parsed };
        return localeMetaCache;
      }
    }

    localeMetaCache = fallback;
    return localeMetaCache;
  } catch (error) {
    console.error('Error loading locale metadata:', error.message);
    localeMetaCache = fallback;
    return localeMetaCache;
  }
}

function normalizeLocale(locale) {
  return String(locale || '').toLowerCase().replace('-', '_');
}

function getSystemLanguage() {
  const meta = getLocaleMeta();
  const supported = new Set(meta.order);
  const defaultLocale = meta.order[0] || 'en_us';

  const appLocale = normalizeLocale(app.getLocale());
  if (supported.has(appLocale)) {
    return appLocale;
  }

  for (const [locale, aliases] of Object.entries(meta.aliases || {})) {
    if ((aliases || []).map(normalizeLocale).includes(appLocale)) {
      return locale;
    }
  }

  const appLanguage = appLocale.split('_')[0];
  const matchingLocale = meta.order.find((locale) => normalizeLocale(locale).split('_')[0] === appLanguage);
  if (matchingLocale) {
    return matchingLocale;
  }

  return defaultLocale;
}

function getInitialLocale() {
  if (!initialLocaleCache) {
    initialLocaleCache = getSystemLanguage();
  }

  return initialLocaleCache;
}

function loadTranslations(locale = getInitialLocale()) {
  try {
    const parsed = JSON.parse(fs.readFileSync(appPath('assets', 'locales', `${locale}.json`), 'utf8'));
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
    })(parsed, '');

    translations = { ...parsed, ...flat };
  } catch (error) {
    console.error('Error loading language file:', error.message);
    translations = {};
  }
}

function getBootstrapPayload() {
  const meta = getLocaleMeta();
  const locale = getInitialLocale();

  if (!Object.keys(translations).length) {
    loadTranslations(locale);
  }

  return {
    app: {
      name: 'Simple Office Installer',
      version: AppVersion
    },
    locale: {
      locale,
      locales: meta.order,
      defaultLocale: meta.order[0] || 'en_us'
    },
    translations
  };
}

function escapePowerShellSingleQuoted(value) {
  return String(value).replace(/'/g, "''");
}

function resolvePowerShellPath() {
  const systemRoot = process.env.SystemRoot || process.env.windir || 'C:\\Windows';
  const candidates = [
    path.join(systemRoot, 'System32', 'WindowsPowerShell\\v1.0', 'powershell.exe'),
    path.join(systemRoot, 'SysWOW64', 'WindowsPowerShell\\v1.0', 'powershell.exe'),
  ];
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {}
  }
  return null;
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    icon: appPath('icon.ico'),
    width: 530,
    height: 665,
    minWidth: 530,
    minHeight: 665,
    autoHideMenuBar: true,
    frame: false,
    resizable: true,
    fullscreenable: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0c0c0e' : '#f6f7f9',
    webPreferences: {
      preload: appPath('assets', 'js', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      devTools: !app.isPackaged
    }
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow.webContents.getURL();
    if (url !== currentUrl) {
      event.preventDefault();
    }
  });

  mainWindow.loadFile(appPath('index.html'));
}

function tempOfficeDir() {
  const dir = path.join(app.getPath('temp'), 'OfficeSetupFiles');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writeFileAtomic(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, data, 'utf8');
}

function assertDownloadedExecutable(filePath, label) {
  let stats;
  try {
    stats = fs.statSync(filePath);
  } catch {
    throw new Error(`${label} was not found at ${filePath}.`);
  }

  if (!stats.isFile()) {
    throw new Error(`${label} was not saved as a file.`);
  }

  if (stats.size < 1024 * 100) {
    throw new Error(`${label} download is too small to be a valid installer.`);
  }

  const fd = fs.openSync(filePath, 'r');
  try {
    const header = Buffer.alloc(2);
    fs.readSync(fd, header, 0, header.length, 0);
    if (header.toString('ascii') !== 'MZ') {
      throw new Error(`${label} download is not a valid Windows executable.`);
    }
  } finally {
    fs.closeSync(fd);
  }
}

class CancellationError extends Error {
  constructor(message = 'Operation canceled') {
    super(message);
    this.name = 'CancellationError';
  }
}

function isCancellationError(error) {
  return error && error.name === 'CancellationError';
}

function isElevationCanceledError(error) {
  const text = [error && error.message, error && error.stderr, error && error.stdout]
    .filter(Boolean)
    .join('\n');

  return /canceled by the user/i.test(text);
}

function getOperationPercent(operation, stageProgress) {
  const normalizedStage = Math.max(0, Math.min(1, Number.isFinite(stageProgress) ? stageProgress : 0));

  if (operation && Number.isFinite(operation.taskCount) && operation.taskCount > 0) {
    const taskIndex = Math.max(0, Math.min(operation.taskCount - 1, operation.taskIndex || 0));
    return Math.round((((taskIndex + normalizedStage) / operation.taskCount) * 100) * 100) / 100;
  }

  return Math.round(normalizedStage * 10000) / 100;
}

function getProgressTarget(operation) {
  if (operation && operation.webContents && !operation.webContents.isDestroyed()) {
    return operation.webContents;
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    return mainWindow.webContents;
  }

  return null;
}

function getProgressWindow(operation) {
  const target = getProgressTarget(operation);
  return target ? BrowserWindow.fromWebContents(target) : mainWindow;
}

function createDialogShownError(message) {
  const error = new Error(message);
  error.dialogShown = true;
  return error;
}

function createSilentOutcomeError(message) {
  const error = new Error(message || 'Silent outcome');
  error.silent = true;
  return error;
}

async function showErrorDialog({ operation, title, message, detail }) {
  const win = getProgressWindow(operation);
  await dialog.showMessageBox(win || undefined, {
    type: 'error',
    title,
    message,
    detail
  });
}

async function throwAdminRightsError(operation, message) {
  await showErrorDialog({
    operation,
    title: translations.accessTitle || 'Administrator Access Needed',
    message: '',
    detail: message
  });
  throw createDialogShownError(message);
}

function setProgressWindowMode(operation, isActive, forceRestore = false) {
  const win = getProgressWindow(operation);
  if (!win || win.isDestroyed()) {
    return;
  }

  if (isActive && operation && operation.type === 'update') {
    if (!progressBaseBounds) {
      progressBaseBounds = win.getBounds();
      progressBaseMinimumSize = win.getMinimumSize();
      progressBaseResizable = win.isResizable();
    }

    const compactHeight = 160;
    win.setMinimumSize(progressBaseBounds.width, compactHeight);
    win.setResizable(false);
    win.setBounds({
      x: progressBaseBounds.x,
      y: progressBaseBounds.y + Math.round((progressBaseBounds.height - compactHeight) / 2),
      width: progressBaseBounds.width,
      height: compactHeight
    });
    return;
  }

  if (!isActive && progressBaseBounds && (forceRestore || ActiveOperations.size === 0)) {
    const baseBounds = progressBaseBounds;
    const baseMinimumSize = progressBaseMinimumSize;
    const baseResizable = progressBaseResizable;
    progressBaseBounds = null;
    progressBaseMinimumSize = null;
    progressBaseResizable = true;
    win.setBounds(baseBounds);
    if (baseMinimumSize) {
      win.setMinimumSize(baseMinimumSize[0], baseMinimumSize[1]);
    }
    win.setResizable(baseResizable);
  }
}

function emitProgress(operation, payload) {
  const target = getProgressTarget(operation);
  if (!target) {
    return;
  }

  target.send('progress:update', {
    operationId: operation && operation.id,
    type: operation && operation.type,
    title: operation && operation.title,
    version: operation && operation.version,
    totalDownloads: operation ? operation.totalDownloads : 0,
    downloadsDone: operation ? operation.downloadsDone : 0,
    downloadsLeft: operation ? Math.max(operation.totalDownloads - operation.downloadsDone, 0) : 0,
    canCancel: Boolean(operation && !operation.finished),
    ...payload
  });
}

function emitOperationProgress(operation, detail, stageProgress, extra = {}) {
  const payload = {
    state: 'progress',
    detail,
    ...extra
  };

  if (Number.isFinite(stageProgress)) {
    payload.percent = getOperationPercent(operation, stageProgress);
  }

  emitProgress(operation, payload);
}

function logProgress(operation, message) {
  emitProgress(operation, {
    state: 'log',
    message,
    timestamp: new Date().toLocaleTimeString()
  });
}

function assertNotCanceled(operation) {
  if (operation && operation.cancelled) {
    throw new CancellationError();
  }
}

function beginProgressOperation({ type, title, totalDownloads = 0, webContents, version = '' }) {
  if (ActiveOperations.size > 0) {
    throw new Error(translations.operationActive || 'Another installer or update operation is already running.');
  }

  const operation = {
    id: `${type}-${Date.now()}-${++operationCounter}`,
    type,
    title,
    version,
    totalDownloads,
    downloadsDone: 0,
    cancelled: false,
    finished: false,
    currentRequest: null,
    currentChild: null,
    taskCount: type === 'update' ? 1 : 0,
    taskIndex: 0,
    webContents
  };

  ActiveOperations.set(operation.id, operation);
  setProgressWindowMode(operation, true);
  emitProgress(operation, {
    state: 'start',
    detail: translations.preparing || 'Preparing...',
    percent: 0
  });
  logProgress(operation, title);
  return operation;
}

function finishProgressOperation(operation, state, detail, options = {}) {
  if (!operation || operation.finished) {
    return;
  }

  operation.finished = true;
  operation.currentRequest = null;
  operation.currentChild = null;

  if (state === 'complete') {
    operation.downloadsDone = operation.totalDownloads;
  }

  emitProgress(operation, {
    state,
    detail,
    percent: state === 'complete' ? 100 : undefined,
    canCancel: false
  });

  ActiveOperations.delete(operation.id);
  if (!options.suppressWindowRestore) {
    setProgressWindowMode(operation, false);
  }
}

function cancelProgressOperation(operationId) {
  const operation = ActiveOperations.get(operationId);
  if (!operation || operation.finished) {
    return false;
  }

  operation.cancelled = true;
  emitProgress(operation, {
    state: 'cancelling',
    detail: translations.canceling || 'Canceling...',
    canCancel: false
  });
  logProgress(operation, translations.canceling || 'Canceling...');

  if (operation.currentRequest) {
    operation.currentRequest.destroy(new CancellationError());
  }

  if (operation.currentChild) {
    try {
      operation.currentChild.kill();
    } catch {}
  }

  if (operation.type === 'update') {
    setProgressWindowMode(operation, false, true);
  }

  return true;
}

function downloadFile(url, destination, options = {}) {
  return new Promise((resolve, reject) => {
    const operation = options.operation;
    const label = options.label || path.basename(destination);
    const progressRange = Array.isArray(options.progressRange) ? options.progressRange : [0, 1];
    let redirects = 0;
    let file = null;
    let settled = false;
    let receivedBytes = 0;
    let totalBytes = 0;

    fs.mkdirSync(path.dirname(destination), { recursive: true });

    function cleanup() {
      if (file) {
        file.close(() => {});
      }
      fs.rm(destination, { force: true }, () => {});
    }

    function rejectOnce(error) {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    }

    function resolveOnce(value) {
      if (settled) {
        return;
      }
      settled = true;
      resolve(value);
    }

    function requestUrl(currentUrl) {
      try {
        assertNotCanceled(operation);
      } catch (error) {
        rejectOnce(error);
        return;
      }

      const parsed = new URL(currentUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        rejectOnce(new Error(`Unsupported download protocol: ${parsed.protocol}`));
        return;
      }

      const client = parsed.protocol === 'http:' ? http : https;
      logProgress(operation, (translations.downloadingLabel || 'Downloading {{label}}...').replace('{{label}}', label));

      const request = client.get(parsed, {
        headers: {
          'User-Agent': `Simple Office Installer/${AppVersion}`
        }
      }, (response) => {
        const statusCode = response.statusCode || 0;
        if ([301, 302, 303, 307, 308].includes(statusCode)) {
          response.resume();
          const location = response.headers.location;
          if (!location) {
            rejectOnce(new Error(`Download redirect ${statusCode} did not include a target.`));
            return;
          }
          if (redirects >= 8) {
            rejectOnce(new Error('Download failed: too many redirects.'));
            return;
          }

          redirects += 1;
          const redirectUrl = new URL(location, currentUrl).toString();
          logProgress(operation, (translations.followingRedirect || 'Following redirect for {{label}}').replace('{{label}}', label));
          requestUrl(redirectUrl);
          return;
        }

        if (statusCode !== 200) {
          response.resume();
          rejectOnce(new Error(`Download failed with status ${statusCode}`));
          return;
        }

        totalBytes = Number(response.headers['content-length']) || 0;
        receivedBytes = 0;
        file = fs.createWriteStream(destination);

        response.on('data', (chunk) => {
          receivedBytes += chunk.length;
          if (totalBytes) {
            const localProgress = receivedBytes / totalBytes;
            const [rangeStart, rangeEnd] = progressRange;
            emitOperationProgress(operation, (translations.downloadingLabel || 'Downloading {{label}}...').replace('{{label}}', label), rangeStart + ((rangeEnd - rangeStart) * localProgress), {
              currentBytes: receivedBytes,
              totalBytes
            });
            return;
          }

          emitProgress(operation, {
            state: 'progress',
            detail: (translations.downloadingLabel || 'Downloading {{label}}...').replace('{{label}}', label),
            currentBytes: receivedBytes,
            totalBytes
          });
        });

        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            if (operation && operation.cancelled) {
              rejectOnce(new CancellationError());
              return;
            }
            if (operation && operation.currentRequest === request) {
              operation.currentRequest = null;
            }
            if (operation) {
              operation.downloadsDone += 1;
            }
            logProgress(operation, (translations.downloadedLabel || 'Downloaded {{label}}').replace('{{label}}', label));
            emitOperationProgress(operation, (translations.downloadedLabel || 'Downloaded {{label}}').replace('{{label}}', label), progressRange[1]);
            resolveOnce({ bytes: receivedBytes });
          });
        });

        file.on('error', rejectOnce);
        response.on('error', rejectOnce);
      });

      if (operation) {
        operation.currentRequest = request;
      }

      request.on('error', (error) => {
        if (operation && operation.currentRequest === request) {
          operation.currentRequest = null;
        }
        rejectOnce(operation && operation.cancelled ? new CancellationError() : error);
      });
    }

    requestUrl(url);
  });
}

function runExecutable(filePath, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const { operation, ...execOptions } = options;

    try {
      assertNotCanceled(operation);
    } catch (error) {
      reject(error);
      return;
    }

    const child = execFile(filePath, args, execOptions, (error, stdout, stderr) => {
      if (operation && operation.currentChild === child) {
        operation.currentChild = null;
      }

      if (operation && operation.cancelled) {
        reject(new CancellationError());
        return;
      }

      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });

    if (operation) {
      operation.currentChild = child;
    }

    child.on('error', reject);
  });
}

function runExecutableViaStartProcess(filePath, args = [], options = {}) {
  if (os.platform() !== 'win32') {
    return runExecutable(filePath, args, options);
  }

  const psPath = resolvePowerShellPath();
  if (psPath) {
    const argumentList = args.map((arg) => `"${String(arg).replace(/"/g, '\\"')}"`).join(' ');
    const workingDirectory = options.cwd || path.dirname(filePath);
    const commandParts = [
      "$ErrorActionPreference = 'Stop';",
      'try {',
      `  $process = Start-Process -FilePath '${escapePowerShellSingleQuoted(filePath)}'`,
      argumentList ? `    -ArgumentList '${escapePowerShellSingleQuoted(argumentList)}'` : '',
      `    -WorkingDirectory '${escapePowerShellSingleQuoted(workingDirectory)}'`,
      '    -WindowStyle Hidden -Wait -PassThru -ErrorAction Stop;',
      "  if ($null -eq $process) { throw 'Start-Process did not return a process.'; }",
      '  $process.Refresh();',
      '  exit $process.ExitCode;',
      '} catch {',
      '  $message = $_.Exception.Message;',
      "  if ($message -match 'canceled by the user') {",
      "    [Console]::Error.WriteLine('Process launch was canceled by the user.');",
      '    exit 1223;',
      '  }',
      '  [Console]::Error.WriteLine($message);',
      '  exit 1;',
      '}'
    ];

    return runExecutable(psPath, [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      commandParts.filter(Boolean).join(' ')
    ], { operation: options.operation });
  }

  const argumentList = args.map((arg) => `"${String(arg).replace(/"/g, '\\"')}"`).join(' ');
  const workingDirectory = options.cwd || path.dirname(filePath);
  return runExecutable('cmd.exe', [
    '/c',
    `start /MIN /WAIT "" "${filePath}" ${argumentList}`
  ], { cwd: workingDirectory, operation: options.operation });
}

async function runExecutableWithStartProcessFallback(filePath, args = [], options = {}) {
  try {
    return await runExecutable(filePath, args, options);
  } catch (error) {
    if (error && (error.code === 'EACCES' || /EACCES|access is denied/i.test(error.message || ''))) {
      logProgress(options.operation, translations.retryingLaunch || 'Retrying launch...');
      return runExecutableViaStartProcess(filePath, args, options);
    }

    throw error;
  }
}

function runElevatedExecutable(filePath, args = [], options = {}) {
  if (os.platform() !== 'win32') {
    return runExecutable(filePath, args, options);
  }

  const psPath = resolvePowerShellPath();
  if (psPath) {
    const argumentList = args.map((arg) => `"${String(arg).replace(/"/g, '\\"')}"`).join(' ');
    const workingDirectory = options.cwd || path.dirname(filePath);
    const commandParts = [
      "$ErrorActionPreference = 'Stop';",
      'try {',
      `  $process = Start-Process -FilePath '${escapePowerShellSingleQuoted(filePath)}'`,
      argumentList ? `    -ArgumentList '${escapePowerShellSingleQuoted(argumentList)}'` : '',
      `    -WorkingDirectory '${escapePowerShellSingleQuoted(workingDirectory)}'`,
      '    -Verb RunAs -PassThru -ErrorAction Stop;',
      "  if ($null -eq $process) { throw 'Start-Process did not return a process.'; }",
      '  $process.WaitForExit();',
      '  $exitCode = 0;',
      '  try { $exitCode = $process.ExitCode; } catch {};',
      '  exit $exitCode;',
      '} catch {',
      '  $message = $_.Exception.Message;',
      "  if ($message -match 'canceled by the user') {",
      "    [Console]::Error.WriteLine('UAC prompt was canceled by the user.');",
      '    exit 1223;',
      '  }',
      '  [Console]::Error.WriteLine($message);',
      '  exit 1;',
      '}'
    ];

    return runExecutable(psPath, [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      commandParts.filter(Boolean).join(' ')
    ], { operation: options.operation });
  }

  const argumentList = args.map((arg) => `"${String(arg).replace(/"/g, '\\"')}"`).join(' ');
  const workingDirectory = options.cwd || path.dirname(filePath);
  return runExecutable('cmd.exe', [
    '/c',
    `start /MIN /WAIT "" "${filePath}" ${argumentList}`
  ], { cwd: workingDirectory, operation: options.operation });
}

function runElevatedExecutableAndConfirmLaunch(filePath, args = [], options = {}) {
  if (os.platform() !== 'win32') {
    return runExecutable(filePath, args, options);
  }

  const psPath = resolvePowerShellPath();
  if (psPath) {
    const argumentList = args.map((arg) => `"${String(arg).replace(/"/g, '\\"')}"`).join(' ');
    const workingDirectory = options.cwd || path.dirname(filePath);
    const confirmLaunchMs = Number.isFinite(options.confirmLaunchMs) ? Math.max(0, options.confirmLaunchMs) : 7000;
    const commandParts = [
      "$ErrorActionPreference = 'Stop';",
      'try {',
      `  $process = Start-Process -FilePath '${escapePowerShellSingleQuoted(filePath)}'`,
      argumentList ? `    -ArgumentList '${escapePowerShellSingleQuoted(argumentList)}'` : '',
      `    -WorkingDirectory '${escapePowerShellSingleQuoted(workingDirectory)}'`,
      '    -Verb RunAs -PassThru -ErrorAction Stop;',
      "  if ($null -eq $process) { throw 'Start-Process did not return a process.'; }",
      `  Start-Sleep -Milliseconds ${confirmLaunchMs};`,
      '  $process.Refresh();',
      "  if (-not $process.HasExited) { [Console]::Out.WriteLine('LAUNCH_CONFIRMED'); exit 0; }",
      '  $exitCode = 0;',
      '  try { $exitCode = $process.ExitCode; } catch {};',
      "  [Console]::Out.WriteLine('LAUNCH_NOT_CONFIRMED:' + $exitCode);",
      '  exit 0;',
      '} catch {',
      '  $message = $_.Exception.Message;',
      "  if ($message -match 'canceled by the user') {",
      "    [Console]::Error.WriteLine('UAC prompt was canceled by the user.');",
      '    exit 1223;',
      '  }',
      '  [Console]::Error.WriteLine($message);',
      '  exit 1;',
      '}'
    ];

    return runExecutable(psPath, [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      commandParts.filter(Boolean).join(' ')
    ], { operation: options.operation }).then(({ stdout, stderr }) => ({
      stdout,
      stderr,
      launchConfirmed: /LAUNCH_CONFIRMED/i.test(stdout || ''),
      launchNotConfirmed: /LAUNCH_NOT_CONFIRMED:/i.test(stdout || '')
    }));
  }

  return runElevatedExecutable(filePath, args, options).then((result) => ({
    ...result,
    launchConfirmed: true,
    launchNotConfirmed: false
  }));
}

function execCommand(command, operation) {
  return new Promise((resolve, reject) => {
    try {
      assertNotCanceled(operation);
    } catch (error) {
      reject(error);
      return;
    }

    const child = exec(command, (error, stdout, stderr) => {
      if (operation && operation.currentChild === child) {
        operation.currentChild = null;
      }

      if (operation && operation.cancelled) {
        reject(new CancellationError());
        return;
      }

      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });

    if (operation) {
      operation.currentChild = child;
    }
  });
}

async function runOfficeSetup(configPath, operation) {
  const dir = tempOfficeDir();
  const odtPath = path.join(dir, 'officedeploymenttool.exe');
  const setupPath = path.join(dir, 'setup.exe');

  fs.rmSync(odtPath, { force: true });
  fs.rmSync(setupPath, { force: true });
  emitOperationProgress(operation, translations.downloadingOdt || 'Downloading Office Deployment Tool', 0.02);
  await downloadFile(OdtUrl, odtPath, {
    operation,
    label: 'Office Deployment Tool',
    progressRange: [0.02, 0.58]
  });
  assertDownloadedExecutable(odtPath, 'Office Deployment Tool');
  assertNotCanceled(operation);
  logProgress(operation, translations.extractingOdtLog || 'Extracting Office Deployment Tool');
  emitOperationProgress(operation, translations.extractingOdt || 'Extracting Office Deployment Tool...', 0.72);
  try {
    await runExecutableWithStartProcessFallback(odtPath, [`/extract:${dir}`, '/passive', '/norestart', '/quiet'], { operation });
  } catch (error) {
    if (isElevationCanceledError(error)) {
      await throwAdminRightsError(operation, translations.rightsExtract || 'Extracting Office installation files requires administrator permissions.');
    }
    throw error;
  }
  fs.rm(odtPath, { force: true }, () => {});

  assertNotCanceled(operation);
  assertDownloadedExecutable(setupPath, 'Office setup');
  emitOperationProgress(operation, translations.preparingOffice || 'Preparing Microsoft Office installer...', 0.86);
  logProgress(operation, translations.startingOffice || 'Starting Microsoft Office installer');
  emitOperationProgress(operation, translations.installingOffice || 'Installing Microsoft Office...', 0.94);
  try {
    const launchResult = await runElevatedExecutableAndConfirmLaunch(setupPath, ['/configure', configPath], {
      cwd: dir,
      operation,
      confirmLaunchMs: 7000
    });
    if (launchResult && launchResult.launchNotConfirmed) {
      throw createSilentOutcomeError('Office installer launch was not confirmed.');
    }
  } catch (error) {
    if (isElevationCanceledError(error)) {
      await throwAdminRightsError(operation, translations.rightsInstall || 'Installing Microsoft Office requires administrator permissions.');
    }
    throw error;
  }
}

async function runTeamsSetup(operation) {
  const installerPath = path.join(tempOfficeDir(), 'MSTeamsSetup.exe');
  emitOperationProgress(operation, translations.downloadingTeams || 'Downloading Microsoft Teams installer', 0.02);
  await downloadFile(TeamsUrl, installerPath, {
    operation,
    label: 'Microsoft Teams installer',
    progressRange: [0.02, 0.74]
  });
  assertNotCanceled(operation);
  await execCommand('taskkill /F /IM ms-teams.exe', operation).catch(() => {});
  logProgress(operation, translations.startingTeams || 'Starting Microsoft Teams installer');
  emitOperationProgress(operation, translations.runningTeams || 'Microsoft Teams installer is running...', 0.94);
  await runElevatedExecutable(installerPath, [], { operation });
  fs.rm(installerPath, { force: true }, () => {});
}

async function runOutlookNewSetup(operation) {
  const installerPath = path.join(tempOfficeDir(), 'OutlookNewSetup.exe');
  emitOperationProgress(operation, translations.downloadingOutlook || 'Downloading Outlook for Windows installer', 0.02);
  await downloadFile(OutlookNewUrl, installerPath, {
    operation,
    label: 'Outlook for Windows installer',
    progressRange: [0.02, 0.74]
  });
  assertNotCanceled(operation);
  await execCommand('taskkill /F /IM olk.exe', operation).catch(() => {});
  logProgress(operation, translations.startingOutlook || 'Starting Outlook for Windows installer');
  emitOperationProgress(operation, translations.runningOutlook || 'Outlook for Windows installer is running...', 0.94);
  await runElevatedExecutable(installerPath, [], { operation });
  fs.rm(installerPath, { force: true }, () => {});
}

function shouldRunOutlookNew(selections) {
  return selections && ['outlookNewI', 'outlookBothI'].includes(selections.outlookType);
}

function shouldRunTeams(selections) {
  return selections && ['teamsAddin', 'teamsBoth'].includes(selections.teamsType);
}

function countInstallerDownloads(selections = {}) {
  let total = 0;
  if (shouldRunOutlookNew(selections)) {
    total += 1;
  }
  if (shouldRunTeams(selections)) {
    total += 1;
  }
  if (selections.installOffice) {
    total += 1;
  }
  return total;
}

async function startInstallFromXml(xml, selections = {}, operation) {
  if (typeof xml !== 'string' || !xml.trim().startsWith('<Configuration>')) {
    throw new Error('Invalid XML configuration');
  }

  const dir = tempOfficeDir();
  const configPath = path.join(dir, 'config.xml');
  writeFileAtomic(configPath, xml);

  const tasks = [];
  if (shouldRunOutlookNew(selections)) {
    tasks.push({ name: 'Outlook for Windows', taskKey: 'taskOutlook', run: () => runOutlookNewSetup(operation) });
  }
  if (shouldRunTeams(selections)) {
    tasks.push({ name: 'Microsoft Teams', taskKey: 'taskTeams', run: () => runTeamsSetup(operation) });
  }
  if (selections.installOffice) {
    tasks.push({ name: 'Microsoft Office', taskKey: 'taskOffice', run: () => runOfficeSetup(configPath, operation) });
  }

  if (tasks.length === 0) {
    throw new Error(translations.noActionsSelected || 'No installer actions selected');
  }

  operation.taskCount = tasks.length;

  for (const [index, task] of tasks.entries()) {
    assertNotCanceled(operation);
    operation.taskIndex = index;
    const taskName = translations[task.taskKey] || task.name;
    logProgress(operation, (translations.stepFormat || 'Step {{index}}/{{total}}: {{name}}').replace('{{index}}', index + 1).replace('{{total}}', tasks.length).replace('{{name}}', taskName));
    emitOperationProgress(operation, (translations.preparingTask || 'Preparing {{name}}...').replace('{{name}}', taskName), 0);
    try {
      await task.run();
    } catch (error) {
      if (!isCancellationError(error)) {
        const wrapped = new Error(`${taskName}: ${error.message}`);
        if (error.dialogShown) {
          wrapped.dialogShown = true;
        }
        if (error.silent) {
          wrapped.silent = true;
        }
        throw wrapped;
      }
      throw error;
    }
  }
}

async function importXmlAndStart(event) {
  const result = await dialog.showOpenDialog({
    title: translations.importFile || 'Import Configuration File',
    filters: [{ name: translations.xmlFilesLabel || 'XML Files', extensions: ['xml'] }],
    properties: ['openFile']
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { ok: false, canceled: true };
  }

  const xml = fs.readFileSync(result.filePaths[0], 'utf8');
  const selections = { installOffice: true };
  const operation = beginProgressOperation({
    type: 'installer',
    title: translations.importedTitle || 'Imported Office configuration',
    totalDownloads: countInstallerDownloads(selections),
    webContents: event.sender
  });

  try {
    await startInstallFromXml(xml, selections, operation);
    finishProgressOperation(operation, 'complete', translations.importedCompleted || 'Imported configuration completed.');
    return { ok: true };
  } catch (error) {
    const canceled = isCancellationError(error);
    const message = canceled ? (translations.canceled || 'Canceled.') : error.message;
    finishProgressOperation(operation, canceled ? 'canceled' : 'error', message);
    if (!canceled && !error.dialogShown && /administrator rights/i.test(message)) {
      await showErrorDialog({
        operation,
        title: translations.accessTitle || 'Administrator Access Needed',
        message: '',
        detail: message
      });
      return { ok: false, canceled, error: message, dialogShown: true };
    }
    return { ok: false, canceled, error: message, dialogShown: Boolean(error.dialogShown) };
  }
}

async function checkForUpdates() {
  try {
    const response = await fetch(UpdateUrl);
    if (!response.ok) {
      throw new Error(`Update check failed with status ${response.status}`);
    }

    const updateInfo = await response.json();

    if (updateInfo.appVersion !== AppVersion) {
      const message = (translations.updateMessage || 'A v{{version}} update is available!').replace('{{version}}', updateInfo.appVersion);
      const userResponse = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        cancelId: 1,
        title: translations.updateTitle || 'New Update Available',
        message
      });

      if (userResponse.response === 0) {
        await downloadUpdate(updateInfo);
      }
    }
  } catch (error) {
    console.error('Error checking for updates:', error.message);
  }
}

async function downloadUpdate(updateInfo) {
  const appVersion = updateInfo.appVersion || AppVersion;
  const updateLink = updateInfo.updateLink;

  const result = await dialog.showSaveDialog({
    title: translations.downloadUpdateTo || 'Download the update to',
    defaultPath: path.join(app.getPath('downloads'), `SimpleOfficeInstaller_${appVersion}.exe`),
    filters: [
      { name: translations.executableFilesLabel || 'Executable Files', extensions: ['exe'] },
      { name: translations.allFilesLabel || 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return;
  }

  const filePath = result.filePath;
  const operation = beginProgressOperation({
    type: 'update',
    title: (translations.downloadingLabel || 'Downloading {{label}}...').replace('{{label}}', `Simple Office Installer ${appVersion}`),
    totalDownloads: 1,
    version: appVersion,
    webContents: mainWindow ? mainWindow.webContents : null
  });

  try {
    await downloadFile(updateLink, filePath, {
      operation,
      label: `Simple Office Installer ${appVersion}`,
      progressRange: [0, 1]
    });
    assertNotCanceled(operation);
    logProgress(operation, translations.startingUpdate || 'Starting downloaded update');
    emitOperationProgress(operation, translations.startingUpdateShort || 'Starting update...', 1);
    assertNotCanceled(operation);
    if (!fs.existsSync(filePath)) {
      throw new Error('Downloaded update file was not found.');
    }

    const errorMessage = await shell.openPath(filePath);
    if (errorMessage) {
      throw new Error(`Failed to start update: ${errorMessage}`);
    }

    finishProgressOperation(operation, 'complete', translations.updateLaunched || 'Update launched.', {
      suppressWindowRestore: true
    });
    app.quit();
  } catch (error) {
    const canceled = isCancellationError(error);
    if (canceled && fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true });
    }

    const message = canceled ? (translations.updateCanceled || 'Update download canceled.') : (translations.failedMsg || 'Failed to download update.');
    finishProgressOperation(operation, canceled ? 'canceled' : 'error', message);
    if (!canceled) {
      await showErrorDialog({
        operation,
        title: translations.failedTitle || 'Update Download Failed',
        message: translations.failedMsg || 'Failed to download update.',
        detail: error.message
      });
      console.error('Error downloading the update:', error.message);
    }
  }
}

function assertTrustedSenderFrame(event) {
  const frameUrl = event.senderFrame && event.senderFrame.url;
  if (!frameUrl) {
    throw new Error('Missing sender frame');
  }

  const parsedSenderUrl = new URL(frameUrl);
  if (parsedSenderUrl.protocol !== 'file:') {
    throw new Error('Untrusted sender protocol');
  }

  const senderPath = fileURLToPath(parsedSenderUrl);
  if (!senderPath.startsWith(appPath(''))) {
    throw new Error('Untrusted sender path');
  }
}

function handleTrustedIpc(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    assertTrustedSenderFrame(event);
    return handler(event, ...args);
  });
}

function registerIpc() {
  app.on('will-quit', () => {
    ActiveOperations.forEach((operation) => {
      if (!operation.finished) {
        cancelProgressOperation(operation.id);
      }
    });
  });

  handleTrustedIpc('window:close', async () => {
    app.quit();
  });

  handleTrustedIpc('window:minimize', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.minimize();
    }
  });

  handleTrustedIpc('window:setBackgroundColor', async (event, color) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && typeof color === 'string') {
      win.setBackgroundColor(color);
    }
    return { ok: true };
  });

  handleTrustedIpc('locale:getInitial', async () => {
    return getBootstrapPayload().locale;
  });

  handleTrustedIpc('app:getInfo', async () => {
    return getBootstrapPayload().app;
  });

  handleTrustedIpc('app:bootstrap', async () => {
    return getBootstrapPayload();
  });

  handleTrustedIpc('installer:start', async (event, payload) => {
    let operation;
    try {
      const selections = payload && payload.selections ? payload.selections : {};
      operation = beginProgressOperation({
        type: 'installer',
        title: translations.installerTitle || 'Office installer',
        totalDownloads: countInstallerDownloads(selections),
        webContents: event.sender
      });
      await startInstallFromXml(payload && payload.xml, selections, operation);
      finishProgressOperation(operation, 'complete', translations.workflowCompleted || 'Installer workflow completed.');
      return { ok: true };
    } catch (error) {
      const canceled = isCancellationError(error);
      const message = canceled ? (translations.canceled || 'Canceled.') : error.message;
      if (operation) {
        finishProgressOperation(operation, canceled ? 'canceled' : 'error', message);
      }
      if (!canceled && !error.dialogShown && /administrator rights/i.test(message)) {
        await showErrorDialog({
          operation,
          title: translations.accessTitle || 'Administrator Access Needed',
          message: '',
          detail: message
        });
        return { ok: false, canceled, error: message, dialogShown: true };
      }
      if (!canceled) {
        console.error('Installer failed:', message);
      }
      return { ok: false, canceled, error: message, dialogShown: Boolean(error.dialogShown), silent: Boolean(error.silent) };
    }
  });

  handleTrustedIpc('installer:importXmlAndStart', async (event) => {
    try {
      return await importXmlAndStart(event);
    } catch (error) {
      console.error('Import/install failed:', error.message);
      return { ok: false, error: error.message };
    }
  });

  handleTrustedIpc('config:exportXml', async (_event, xml) => {
    if (typeof xml !== 'string' || !xml.trim().startsWith('<Configuration>')) {
      return { ok: false, error: 'Invalid XML configuration' };
    }

    const result = await dialog.showSaveDialog({
      title: translations.exportFile || 'Export Configuration File',
      defaultPath: 'Configuration.xml',
      filters: [
        { name: translations.xmlFilesLabel || 'XML Files', extensions: ['xml'] },
        { name: translations.allFilesLabel || 'All Files', extensions: ['*'] }
      ]
    });

    if (result.canceled || !result.filePath) {
      return { ok: false, canceled: true };
    }

    try {
      writeFileAtomic(result.filePath, xml);
      return { ok: true, filePath: result.filePath };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  });

  handleTrustedIpc('links:open', async (_event, url) => {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !new Set(['github.com', 'linktr.ee']).has(parsed.hostname)) {
      throw new Error('External link is not allowed');
    }
    await shell.openExternal(parsed.toString());
    return { ok: true };
  });

  handleTrustedIpc('progress:cancel', async (event, operationId) => {
    const operation = ActiveOperations.get(operationId);
    if (!operation) {
      return { ok: false };
    }
    if (operation.webContents && operation.webContents !== event.sender) {
      throw new Error('Progress operation belongs to another window.');
    }

    return { ok: cancelProgressOperation(operationId) };
  });
}

app.whenReady().then(async () => {
  registerIpc();
  loadTranslations();
  createMainWindow();
  setTimeout(() => {
    checkForUpdates();
  }, 1000);
});

app.on('window-all-closed', () => {
  app.quit();
});
