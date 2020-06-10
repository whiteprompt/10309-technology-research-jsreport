import React, { useState } from "react";
import ReactDOM from "react-dom";
import bent from 'bent';
import { parseHash } from './utils';
import 'regenerator-runtime/runtime'

import jsreport from 'jsreport-browser-client-dist';

jsreport.serverUrl = `${process.env.BACKEND_URL}/dev`


const App = () => {
  const hash = parseHash();
  if (!hash.id_token) {
    window.location.replace(process.env.LOGIN_URL)
  }

  const [token, setToken] = useState(hash.id_token);
  const [data, setData] = useState({});
  const [template, setTemplate] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);

  const getData = async () => {
    if (processing) {
      return;
    }

    try {
      setProcessing(true);
      const get = bent('GET', 200);
      const result = await get(`${process.env.BACKEND_URL}/dev/api/data`, null, {Authorization: `Bearer ${token}`});
      const unsortedData = (await result.json()).data;
      setData(unsortedData);
      document.getElementById('data').setAttribute('value', JSON.stringify(data));
      setCurrentStep(2);
    } catch (e) {
      console.log(e);
    } finally {
      setProcessing(false);
    }
  }

  const getTemplate = () => {
    if (processing) {
      return;
    }

    try {
      setProcessing(true);
      const objectElement = document.getElementById('object');
      setTemplate(objectElement.contentDocument.firstElementChild.innerHTML)
      document.getElementById('template').innerText = objectElement.contentDocument.firstElementChild.innerHTML;
      setCurrentStep(3);
    } catch (e) {
      console.log(e);
    } finally {
      setProcessing(false);
    }
  }

  const generateReport = (recipe = 'html') => {
    if (processing) {
      return;
    }
    try {
      setProcessing(true);
      console.log(processing);
      const requestParams = {
        'template': {
          'content': template,
          'recipe': recipe,
          'engine': 'handlebars'
        },
        'data': data
      };

      if (recipe === 'chrome-image') {
        requestParams.template.chromeImage = {
          type: 'png',
          fullPage: true
        };
      }

      jsreport.headers['Authorization'] = `Bearer ${token}`

      jsreport.renderAsync(requestParams).then(res => {
        const response = JSON.parse(res.toString());
        document.getElementById('response').value = response.report;

        switch (recipe) {
          case 'chrome-pdf':
          case 'chrome-image':
            const isPDF = recipe === 'chrome-pdf';
            const linkSource = `data:${isPDF ? 'application/pdf' : 'image/png'};base64,${response.report}`;
            const downloadLink = document.createElement('a');
            const fileName = isPDF ? 'report.pdf' : 'report.png';

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
        setProcessing(false);
      })
    } catch (e) {
      console.log(e);
    } finally {
      console.log(processing);
    }

  }

  return (
    <div className={`grid current-step-${currentStep} ${token ? '' : 'd-none'}`}>
      <div className="row">
        <div className="cell-12">
          <h1 className="float-left">Serverless JSReport Demo</h1>
          <img id="logo"
               className="float-right"
               src="https://whiteprompt.com/img/logo.svg"
               alt="White Prompt"
               width="250px"/>
        </div>
        <div className="cell-12">
          <hr className="clear float-none"/>
        </div>
      </div>
      <div id="breadcrumb" className="row">
        <div className="step-1 step cell-4">Step 1:
          <span className={currentStep === 1 ? 'd-none' : 'd-inline pl-2'}>Get Sample Data</span>
          <button className="ml-2" onClick={getData}>Get Sample Data</button>
        </div>
        <div className="step-2 step cell-4">Step 2:
          <span className={currentStep === 2 ? 'd-none' : 'd-inline pl-2'}>Get Report Template</span>
          <button className="ml-2" onClick={getTemplate}>Get Report Template</button>
        </div>
        <div className="step-3 step cell-4">Final Step: Generate Reports
        </div>
      </div>
      <div className="row">
        <div className="step-1 step cell-4">
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
        </div>
        <div className="step-2 step cell-4">
          <textarea name="template" id="template" cols="30" rows="10"/>
        </div>
        <div className="step-3 step cell-4 flex-align-end flex-justify-end">
          <button className="mb-1"
                  onClick={() => {generateReport('html')}}>
            Generate HTML Report
          </button>
          <br/>
          <button className="mb-1"
                  onClick={() => {generateReport('chrome-pdf')}}>
            Generate PDF Report
          </button>
          <br/>
          <button className="mb-1"
                  onClick={() => {generateReport('chrome-image')}}>
            Generate PNG Report
          </button>
          <textarea name="response" id="response" cols="30" rows="10"/>
        </div>
      </div>
      <div className="row mt-10 pt-10">
        <div className="cell-8 offset-2">
          <iframe id="preview" frameBorder="0"
                  style={{width: '100%', height: '100vh'}}/>
        </div>
      </div>
      <object id="object" data="chart.html" type="text/html"/>
      <div id="loader" className={processing ? 'd-block' : 'd-none'}>
        processing, please wait...
      </div>
    </div>
  );
}

var mountNode = document.getElementById('app');
ReactDOM.render(<App/>, mountNode);
