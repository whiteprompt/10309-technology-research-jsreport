const {google} = require('googleapis');
const {GOOGLE_SHEET_ID, GOOGLE_SHEET_RANGE} = process.env;

let googleAuth;
let sheetsAPI;

const initGoogleApis = (
  async () => {
    googleAuth = await new google.auth.GoogleAuth({
        scopes: [
          'https://www.googleapis.com/auth/drive'
        ]
      }
    ).getClient();
    sheetsAPI = google.sheets({version: 'v4', auth: googleAuth}).spreadsheets;
  }
)();

module.exports = {
  async handler () {
    let body;
    try {
      await initGoogleApis;
      const request = await sheetsAPI.values.get({
        spreadsheetId: GOOGLE_SHEET_ID,
        range: GOOGLE_SHEET_RANGE,
        majorDimension: 'COLUMNS'
      });
      const entries = request.data.values.slice(2).map((tech) => {
        const techName = tech.shift();
        const result = tech.reduce(
          (a, c) => c.length ? a.set(c, (a.get(c) || 0) + 1) : a,
          new Map()
        );
        const unsortedLevels = Object.fromEntries(result);
        const sortedLevels = Object.keys(unsortedLevels).sort().reduce((accumulator, currentValue) => {
          accumulator[currentValue] = unsortedLevels[currentValue];
          return accumulator;
        }, {});
        return [techName, sortedLevels];
      });

      body = {
        ok: true,
        data: {
          defaultTechnology: 'React',
          technologyLevels: Object.fromEntries(entries),
          technologies: entries.map(
            entry => (
              {
                id: entry[0].replace(' ', '_'),
                name: entry[0],
                levels: [
                  entry[1]['Level 0'] || 0,
                  entry[1]['Level 1'] || 0,
                  entry[1]['Level 2'] || 0,
                  entry[1]['Level 3'] || 0,
                  entry[1]['Level 4'] || 0
                ]
              }
            )
          )
        }
      }
    } catch (e) {
      body = {
        ok: false,
        error: e.message
      };
    }

    return body;
  }
};
