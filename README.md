# Technology Research Serverless JSReport

## Summary

### Backend

* GET `/api/data` which will return sample data from Google Sheets through the Google APIs
* POST `/api/report` which will run JSreport as a serverless function

Took inspiration from [this article](https://jsreport.net/learn/aws-lambda-serverless).

Both endpoints 

### Frontend

A simple frontend client for the backend, built with React and Parcel Bundler.

## Intial Setup

### Create an S3 bucket to host the front end

* create an S3 bucket and configure it for website hosting
  * name it the same as the domain you'll use for its cloudfront distribution in Route 53
  * index.html should map as default success and error page
* create a Cloufront distribution and take the S3 created above as origin
  * configure it as http redirecting to https
  * default root object should be index.html
* create a Route 53 recordset pointing to the Cloudfront distribution

More details in the process on [this article](https://www.freecodecamp.org/news/simple-site-hosting-with-amazon-s3-and-https-5e78017f482a/).

### Create a Cognito User Pool

* Create a Cognito User Pool and  
  * On that user pool create 2 app clients
    * one for local development, the callback and logout urls `http://localhost:3000`
    * the other for production , the callback and logout urls are the ones sets in the Route 53 entry created in before

### Get a Google Service Account key with access to Google Sheets

* Create a Project in [Google Cloud's Web Console](https://console.cloud.google.com/) 
* [Enable the following APIs](https://console.cloud.google.com/apis/dashboard) for the google cloud project
  * [Google Sheets](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
* Select the Google Cloud Project in the Google Cloud Dashboard
* [Create a Service Account](https://developers.google.com/identity/protocols/OAuth2ServiceAccount#creatinganaccount) (From now on called `google service account`)
  * Create a key (Look for the "CREATE KEY" button in the view page of the Service Account just created)
  * Download the Credentials as JSON file
  * Store it in your local project's folder as `backend/google.json` 
* Share the sheet with the email of the Service Account

## Install locally 

### Install dependencies and run

* `cd frontend`
  * `cp .env.example .env.local` (and edit `.env.local` with the proper values)
  * `npm install`
  * `npm start`
* `cd backend`
  * `cp .env.example .env` (and edit `.env` with the proper values)
  * `npm install`
  * unzip `backend/layer/googleapis.zip` in `backend/layer/googleapis/`
  * unzip `backend/layer/jsreports.zip` in `backend/layer/jsreports/`
  * `npm run-script dev`

## Build & Deploy

### Backend

* Deploy the serverless app with `AWS_PROFILE=architecture dotenv -e .env.production -- serverless deploy --stage dev`
  * copy the base url of your functions
  * set this url as backend url in the production `.env` of the frontend

### Front end

* `rm -rf dist/* && NODE_ENV=production parcel build index.html`
* `aws s3 sync dist/ s3://{{the url of your route 53 record}} --delete` (replace the value among brackets for the real one)
* invalidate the cloudfront distribution
