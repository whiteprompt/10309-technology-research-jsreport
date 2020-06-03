const fs = require('fs');
const superagent = require('superagent');
const endpoint = 'http://localhost:3000/dev/api/report';

(async () => {
  superagent
    .post(endpoint)
    .send({
      "template": {
        "content": "Hello world {{name}}",
        "recipe": "html",
        "engine": "handlebars"
      },
      "data": {
        "name": "Fabricio"
      }
    })
    .end((err, res) => {
      if (err) {
        console.log('Error! ==========================');
        console.log(err);
        fs.writeFileSync('report.html', Buffer.from(err.rawResponse, 'base64'))
        return err;
      } else {
        fs.writeFileSync('report.pdf', res.toString('base64'))
      }
    })
})();
