/**
 * Build script for Netlify deployment.
 * Copies only the required Oracle JET files from node_modules into vendor/.
 */
const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn('  SKIP (not found):', src);
    return;
  }
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

const jetLibs = 'node_modules/@oracle/oraclejet/dist/js/libs';
const preactAmd = 'node_modules/@oracle/oraclejet-preact/amd';
const vendorJet = 'vendor/oraclejet';
const vendorPreact = 'vendor/oraclejet-preact';

// Clean previous build
if (fs.existsSync('vendor')) {
  fs.rmSync('vendor', { recursive: true, force: true });
}

console.log('Copying Oracle JET libs to vendor/ ...');

const dirs = [
  ['oj/min',                                   'oj/min'],
  ['oj/ojL10n.js',                             'oj/ojL10n.js'],
  ['oj/resources',                             'oj/resources'],
  ['jquery/jqueryui-amd-1.13.2.min',          'jquery/jqueryui-amd-1.13.2.min'],
  ['dnd-polyfill/dnd-polyfill-1.0.2.min.js',  'dnd-polyfill/dnd-polyfill-1.0.2.min.js'],
  ['touchr/touchr.js',                         'touchr/touchr.js'],
  ['require-css/css.min.js',                   'require-css/css.min.js'],
  ['require-css/css-builder.js',               'require-css/css-builder.js'],
  ['require-css/normalize.js',                 'require-css/normalize.js'],
];

for (const [src, dest] of dirs) {
  const srcPath = path.join(jetLibs, src);
  const destPath = path.join(vendorJet, dest);
  console.log('  ' + src);
  copyRecursive(srcPath, destPath);
}

console.log('Copying @oracle/oraclejet-preact/amd ...');
copyRecursive(preactAmd, vendorPreact);

console.log('Done! vendor/ is ready for deployment.');
