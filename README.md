# Salesforce to Webex Contact Sync

This is a Node.js app that uses Salesforce and Webex Oauth to sync contacts from Salesforce to Webex.  It is intended to be used as a reference for developers who want to build a similar integration.

## Overview

This project creates a locally running Node.js web server which lets you sign using a Webex Integration OAuth redirect URL flow. It then sets up a cron job to continually refresh the access token. In example, the project refreshes the token ever 24 hours.

Project then uses the access token to sync contacts from Salesforce to Webex.


## Setup

### Prerequisites & Dependencies: 

- Node 16
- Webex User Account
- Webex OAuth Integration - Guide provided below
   - Additional information available here: https://developer.webex.com/docs/integrations


### Installation Steps:

1. Clone this repository and change directory:

   ```
   git clone https://github.com/sieteunoseis/salesforce-webex-contact-sync.git && cd salesforce-webex-contact-sync
   ```

2. Rename the example environment file from `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
3. Configure the environment file with the Webex OAuth Integration.
   *Additional guide on where to get these values is below*

   ```env
   SALESFORCE_CLIENT_ID=<CLIENT_ID>
   SALESFORCE_CLIENT_SECRET=<CLIENT_SECRET>
   SALESFORCE_USERNAME=<USERNAME>
   SALESFORCE_PASSWORD=<PASSWORD>
   SALESFORCE_SECURITYTOKEN=<SECURITY_TOKEN>
   WEBEX_ORG_ID=<ORG_ID>
   WEBEX_APP_CLIENT_ID=<CLIENT_ID>
   WEBEX_APP_CLIENT_SECRET=<CLIENT_SECRET>
   WEBEX_APP_REDIRECT_URL=http://localhost:3000/oauth
   WEBEX_APP_AUTHORIZATION_URL=https://webexapis.com/v1/authorize
   WEBEX_APP_TOKEN_URL=https://webexapis.com/v1/access_token
   WEBEX_APP_SCOPES=Identity:contact
   ```
4. Install project:
   ```
   npm install
   ```
5. Start the server in development mode:
   ```
   npm run dev
   ```
   or start the server in production mode:
   
   ```
   npm run test
   ```

6. Navigate using your browser to the link below to begin the OAuth flow which will give this project a refresh and access token based off your Webex Account:
   ```
   http://localhost:3000/oauth
   ```

#### Build and run using Docker:

```
npm run docker:build
npm run docker:run
```

#### Pull image from Docker.io and run with the following::

```
docker run -d -p 3000:3000 --name salesforce-webex-sync --restart=always --env-file=.env sieteunoseis/salesforce-webex-contact-sync:latest
```

#### Setup Webex OAuth Integration:

1. Navigate to this page to create a new Webex Integration using your Webex Account:
   [https://developer.webex.com/my-apps](https://developer.webex.com/my-apps)
   
2. Click on ``Create a New App``
3. Click on ``Integration``
4. Fill out your intergration details, enter any name and decription and select any icon:
   - For Redirect URI(s), enter: http://localhost:3000/oauth
      (or the url where you intend to deploy this code.  The app expects the url to end in ``/oauth``)
   - For scopes, select only ``Identity:contact``
      (or the scopes you intend to use for your integration)
5. Scroll to the bottom and click Add Integration.
6. Take a note of the Client ID and Client Secret for the environment file configuration above

## License

All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Giving Back

If you would like to support my work and the time I put in creating the code, you can click the image below to get me a coffee. I would really appreciate it (but is not required).

[Buy Me a Coffee](https://www.buymeacoffee.com/automatebldrs)
