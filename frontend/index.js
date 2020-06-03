import React, { useState } from "react";
import ReactDOM from "react-dom";
import bent from 'bent';
import { parseHash } from './utils';
import 'regenerator-runtime/runtime'


import jsreport from 'jsreport-browser-client-dist';
jsreport.serverUrl = `${process.env.BACKEND_URL}/dev`


const parse = (recipe = 'html') => {
  const request = {
    "template": {
      "content" : document.getElementById('template').getAttribute('value'),
      "recipe": recipe,
      "engine": "handlebars"
    },
    "data": JSON.parse(document.getElementById('data').value)
  };

  if (recipe === 'chrome-image') {
    request.template.chromeImage = {
      type: 'png',
      fullPage: true
    };
  }

  jsreport.renderAsync(request).then(res => {
    const response = JSON.parse(res.toString());
    document.getElementById('response').value = response.report;

    switch (recipe) {
      case 'chrome-pdf':
      case 'chrome-image':
        const mimeType = `${recipe === 'chrome-pdf' ? 'application/pdf' : 'image/png'}`;
        const linkSource = `data:${mimeType};base64,${response.report}`;
        const downloadLink = document.createElement('a');
        const fileName = recipe === 'chrome-pdf' ? 'report.pdf' : 'report.png';

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink)
        downloadLink.click();
        document.body.removeChild(downloadLink)
        break;
      case 'html':
      default:
        const iframe = document.getElementById('preview');
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(response.report);
        iframe.contentWindow.document.close();
        break;
    }

  })
}

const App = () => {
  const hash = parseHash();
  if (!hash.id_token) {
    window.location.replace(process.env.LOGIN_URL)
  }

  const [token, setToken] = useState(hash.id_token);
  const [data, setData] = useState({});

  const getData = async () => {
    const get = bent('GET', 200);
    const result = await get(`${process.env.BACKEND_URL}/dev/api/data`, null, {Authorization: `Bearer ${token}`});
    const unsortedData = (await result.json()).data;
    setData(unsortedData)
    document.getElementById('data').setAttribute('value', JSON.stringify(data));
  }

  const getTemplate = () => {
    const objectElement = document.getElementById('object');
    document.getElementById('template').setAttribute('value', objectElement.contentDocument.firstElementChild.innerHTML);
    console.log(document.getElementById('template').getAttribute('value'));

  }

  return (
    <div className="grid">
      <div className="row">
        <div className="cell-4">
          Data:
          <br/>
          <textarea name="data"
                    id="data"
                    cols="30"
                    rows="10"
                    value={JSON.stringify(data)}
                    onChange={
                      (event) => {
                        setData(JSON.parse(event.target.value))
                      }
                    }
          />
          <br/>
          <button onClick={getData}>Get Data</button>
        </div>
        <div className="cell-4">
          Template:
          <br/>
          <textarea name="template" id="template" cols="30" rows="10"/>
          <br/>
          <button onClick={getTemplate}>Get Template</button>
        </div>
        <div className="cell-4 flex-align-end flex-justify-end">
          Result:
          <object id="object" data="chart.html" type="text/html" style={{width: 1, height: 1}}/>
          <br/>
          <textarea name="response" id="response" cols="30" rows="10"/>
          <br/>
          <button onClick={() => {parse('html')}}>parse html</button>
          <button onClick={() => {parse('chrome-pdf')}}>parse pdf</button>
          <button onClick={() => {parse('chrome-image')}}>parse image</button>
        </div>
      </div>
      <div className="row">
        <div className="cell-8 offset-2">
          <hr/>
          Preview:
          <iframe id="preview" frameBorder="0" style={{width: '100%', height: '100vh'}} />
        </div>
      </div>

    </div>
  );
}

var mountNode = document.getElementById("app");
ReactDOM.render(<App />, mountNode);
