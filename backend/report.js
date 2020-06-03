const {NODE_ENV, LOCAL_CHROMIUM_PATH} = process.env;
const isDevelopment = NODE_ENV === 'development';
const configFile = isDevelopment ? 'dev.config.json' : 'prod.config.json';

const path = require('path');
const chromium = require('chrome-aws-lambda');
const JsReport = require('jsreport');
const {promisify} = require('util');
const ncp = promisify(require('ncp'));

let jsreport;

const initJsReport = (
  async () => {
    const executablePath = isDevelopment ? LOCAL_CHROMIUM_PATH : await chromium.executablePath;

    jsreport = JsReport({
      configFile: path.join(__dirname, configFile),
      chrome: {
        launchOptions: {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: chromium.headless
        }
      }
    });
    await ncp(path.join(__dirname, 'data'), '/tmp/data');

    return jsreport.init()
  }
)();

module.exports = {
  async handler (event) {
    let body;
    try {
      await initJsReport;
      const params = event.body;
      const res = await jsreport.render(params);

      body = {
        ok: true,
        report: res.content.toString(event.body.template.recipe === 'html' ? undefined : 'base64')
      }
    } catch (e) {
      body = {
        ok: false,
        error: e
      };
    }

    return body;
  }
};
