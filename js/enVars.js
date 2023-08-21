const { cleanEnv, str, url } = require("envalid");

const env = cleanEnv(process.env, {
  SALESFORCE_CLIENT_ID: str({
    desc: "Salesforce Client ID. Also named Consumer Key.",
  }),
  SALESFORCE_CLIENT_SECRET: str({
    desc: "Salesforce Client Secret. Also named Consumer Secret.",
  }),
  SALESFORCE_USERNAME: str({
    desc: "Salesforce OAUTH username.",
  }),
  SALESFORCE_PASSWORD: str({
    desc: "Salesforce OAUTH password.",
  }),
  SALESFORCE_SECURITYTOKEN: str({
    desc: "Salesforce Security Token. A security token can be generated from the Salesforce dashboard under: Account Name > Setup > My Personal Information > Reset My Security Token.",
  }),
  WEBEX_ORG_ID: str({
    desc: "Webex Organization ID.",
  }),
  WEBEX_APP_CLIENT_ID: str({
    desc: "Webex Integration Client ID."
  }),
  WEBEX_APP_CLIENT_SECRET: str({
    desc: "Webex Integration Client Secret."
  }),
  WEBEX_APP_REDIRECT_URL: url({
    desc: "One or more URIs that a user will be redirected to when completing an OAuth grant flow. This needs to match your Integration Redirect URL."
  }),
  WEBEX_APP_AUTHORIZATION_URL: url({
    desc: "URL to identify your integration when granting access to the Webex REST API.", default: 'https://webexapis.com/v1/authorize'
  }),
  WEBEX_APP_TOKEN_URL: url({
    desc: "Resource server to exchange an authorization code for an access token to use with Webex REST API", default: 'https://webexapis.com/v1/access_token'
  }),
  WEBEX_APP_SCOPES: str({ desc: "Space-delimited list of scopes that identify the resources that your integration can access on behalf of the user. For example: spark:all spark:kms" })
});

exports.env = env;