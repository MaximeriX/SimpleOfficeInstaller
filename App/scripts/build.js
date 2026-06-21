const fs = require('fs');
const path = require('path');
const { minify: minifyJs } = require('terser');
const CleanCSS = require('clean-css');
const { minify: minifyHtml } = require('html-minifier-terser');
const { optimize: optimizeSvg } = require('svgo');

const root = path.join(__dirname, '..');
const src = root;
const out = path.join(root, 'build');

const ExcludedPaths = ['node_modules', 'build', 'scripts', '.git', 'eslint.config.js', 'package.json', 'package-lock.json'];

async function processFile(srcPath, outPath) {
  const ext = path.extname(srcPath);

  if (ext === '.js') {
    const code = fs.readFileSync(srcPath, 'utf8');
    const result = await minifyJs(code, { module: false });
    fs.writeFileSync(outPath, result.code);
    return;
  }

  if (ext === '.css') {
    const code = fs.readFileSync(srcPath, 'utf8');
    const result = new CleanCSS().minify(code);
    fs.writeFileSync(outPath, result.styles);
    return;
  }

  if (ext === '.html') {
    const code = fs.readFileSync(srcPath, 'utf8');
    const result = await minifyHtml(code, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true,
    });
    fs.writeFileSync(outPath, result);
    return;
  }

  if (ext === '.svg') {
    const code = fs.readFileSync(srcPath, 'utf8');
    const result = optimizeSvg(code, { multipass: true });
    fs.writeFileSync(outPath, result.data);
    return;
  }

  fs.copyFileSync(srcPath, outPath);
}

async function walk(srcDir) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (ExcludedPaths.includes(entry.name)) continue;

    const srcPath = path.join(srcDir, entry.name);
    const relPath = path.relative(src, srcPath).replace(/\\/g, '/');
    const outPath = path.join(out, relPath);

    if (entry.isDirectory()) {
      fs.mkdirSync(outPath, { recursive: true });
      await walk(srcPath);
      continue;
    }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await processFile(srcPath, outPath);
  }
}

async function run() {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  await walk(src);

  const packageJsonPath = path.join(root, 'package.json');
  const electronPackagePath = path.join(root, 'node_modules', 'electron', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const electronVersion = JSON.parse(fs.readFileSync(electronPackagePath, 'utf8')).version;
  packageJson.main = 'index.js';
  if (packageJson.devDependencies && packageJson.devDependencies.electron) {
    packageJson.devDependencies.electron = electronVersion;
  }
  packageJson.build = {
    ...packageJson.build,
    electronVersion,
    files: ['**/*']
  };
  fs.writeFileSync(path.join(out, 'package.json'), JSON.stringify(packageJson, null, 2));
  fs.copyFileSync(path.join(root, 'package-lock.json'), path.join(out, 'package-lock.json'));
}

run();
