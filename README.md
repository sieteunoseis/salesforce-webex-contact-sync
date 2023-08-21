# Salesforce to Webex Contact Sync

This is a Node.js app that uses Salesforce and Webex Oauth to sync contacts from Salesforce to Webex.  It is intended to be used as a reference for developers who want to build a similar integration.

## Overview

This project creates a locally running Node.js web server which lets you sign using a Webex Integration OAuth redirect URL flow. It then sets up a cron job to continually refresh the access token. In example, the project refreshes the token ever 24 hours.


## Setup

### Prerequisites & Dependencies: 

- Node 16
- Webex User Account
- Webex OAuth Integration - Guide provided below
   - Additional information available here: https://developer.webex.com/docs/integrations


### Installation Steps:

1. Clone this repository and change directory:

   ```
   git clone https://github.com/wxsd-sales/nodejs-integration-refresher.git && cd nodejs-integration-refresher
   ```

2. Rename the example environment file from `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
3. Configure the environment file with the Webex OAuth Integration ``CLIENT_ID``, ``CLIENT_SECRET`` and ``SCOPES`` details and save. 
   *Additional guide on where to get these values is below*

   ```env
   CLIENT_ID=<CLIENT_ID>
   CLIENT_SECRET=<CLIENT_SECRET>
   REDIRECT_URL=http://localhost:3000/oauth
   AUTHORIZATION_URL=https://webexapis.com/v1/authorize
   TOKEN_URL=https://webexapis.com/v1/access_token
   SCOPES=spark:all spark-admin:devices_read
   PORT=3000
   ```
4. Install project:
   ```
   npm install
   ```
5. Start the server:
   ```
   npm start
   ```

6. Navigate using your browser to the link below to begin the OAuth flow which will give this project a refresh and access token based off your Webex Account:
   ```
   http://localhost:3000/oauth
   ```

#### Setup Webex OAuth Integration:

1. Navigate to this page to create a new Webex Integration using your Webex Account:
   [https://developer.webex.com/my-apps](https://developer.webex.com/my-apps)
   
2. Click on ``Create a New App``
3. Click on ``Integration``
4. Fill out your intergration details, enter any name and decription and select any icon:
   - For Redirect URI(s), enter: http://localhost:3000/oauth
      (or the url where you intend to deploy this code.  The app expects the url to end in ``/oauth``)
   - For scopes, select only ``spark:all``
      (or the scopes you intend to use for your integration)
      If you do not select ``spark:all``, ``spark:people_read`` is required for this demo.
5. Scroll to the bottom and click Add Integration.
6. Take a note of the Client ID and Client Secret for the environment file configuration above


## Demo

*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).

## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer
  
Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex use cases, but are not Official Cisco Webex Branded demos.


## Questions
Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=nodejs-integration-refresher) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
