# Automatic setup integration between Auth0, Qlik Sense and get a mashup using Qlik-Embed ready to start testing!

Configure Qlik Cloud with Auth0 as IDP and Oauth for web integration, with just a few clicks.

![images/integration.jpg](https://raw.githubusercontent.com/jacobvinzent/qlikauth0qlikembed/master/images/integration.jpg)

## Features
This extension creates following:
1. Auth0 app
2. Auth0 Idp in Qlik Cloud
3. An Oauth record on Qlik Cloud
4. A Node js Express web app using the values returned from 1-3 
   
## Requirements

1. An activated Qlik Cloud tenant, with a dev token OR Oauth client Id and Secret from myqlik.
2. An Auth0 account
3. A Qlik Sense app with at least one sheet and some visualizations

## Have following ready before you start
1. Your API client_id, client_secret and audience from auth0 (can be found under applications, APIs, click on "Auth0 Management API" and select test. Here you find the details on a test curl command). Copy all three and paste it somewhere for later use.
2. Go to applications, select "Auth0 Management API (Test Application)", click on APIs, Authorize the Auth0 Management API and click the arrow down on the record and select all scopes.
3. Login to Qlik cloud, open an app which is published to a Shared or Managed space. Copy the app id and paste it somewhere for later use.
4. Open a sheet and copy the sheet id and paste it somewhere for later use.
5. Right Qlik on an object, to get most out of the demo, don't select a KPI object. Right click on it, share and copy the id of object, paste it somewhere for later use.
6. Get a developer token for you Qlik Cloud tenant or get the Oauth Client ID and Client Secret from your myqlik page. Remember to get the Oauth credentials for the same region as the tenant where that app exists. Copy the value(s) for later use.
7. Copy your cloud tenant url and paste it somewhere for later use.

Now you are ready to run the extension, run the Setup Qlik integration from the Command Palette and paste the values in the requested order.

When you are done, log into you Qlik cloud tenant, go to the Management console and Identity providers. Validate the new created IdP.

Go to the space with app and give the user from Auth0 full access to the space.

Go back to VS code, open a terminal and run
1. npm install
2. npm run start
3. Open a browser and enter the URL: http://localhost:3000


