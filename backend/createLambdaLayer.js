const fs = require('fs');
const {promisify} = require('util');

const rimraf = promisify(require('rimraf'));
const ncp = promisify(require('ncp'));

async function pckg () {
  if (fs.existsSync('layer')) {
    await rimraf('layer')
  }

  console.log('create layer directory');
  fs.mkdirSync('layer');
  fs.mkdirSync('layer/jsreports');
  fs.mkdirSync('layer/jsreports/nodejs');

  console.log('moving local chromium');
  await ncp('node_modules/puppeteer/.local-chromium', '.local-chromium');
  await rimraf('node_modules/puppeteer/.local-chromium');

  console.log('copying node modules to layer');
  await ncp('node_modules/', 'layer/jsreports/nodejs/node_modules');

  console.log('restoring local chromium');
  await ncp('.local-chromium', 'node_modules/puppeteer/.local-chromium');
  await rimraf('.local-chromium');

  console.log('layer folder ready')
}

pckg().catch(console.error);
