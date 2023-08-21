if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { default: consoleStamp } = require("console-stamp");
const { cleanEnv, str } = require("envalid");
var nforce = require("nforce");
var phone = require("phone");
// add timestamps in front of log messages
require("console-stamp")(console);
const getVariables = require('./enVars.js');

//Static Variables
var SALESFORCE_CLIENT_ID = getVariables.env.SALESFORCE_CLIENT_ID;
var SALESFORCE_CLIENT_SECRET = getVariables.env.SALESFORCE_CLIENT_SECRET;
var SALESFORCE_USERNAME = getVariables.env.SALESFORCE_USERNAME;
var SALESFORCE_PASSWORD = getVariables.env.SALESFORCE_PASSWORD;
var SALESFORCE_SECURITYTOKEN = getVariables.env.SALESFORCE_SECURITYTOKEN;
var WEBEX_ORG_ID = getVariables.env.WEBEX_ORG_ID;

var org = nforce.createConnection({
  clientId: SALESFORCE_CLIENT_ID,
  clientSecret: SALESFORCE_CLIENT_SECRET,
  redirectUri: "https://login.salesforce.com/",
  environment: "production", // optional, salesforce 'sandbox' or 'production', production default
  mode: "single", // optional, 'single' or 'multi' user mode, multi default
});

const getSalesforceContacts = () => {
  return org
    .authenticate({
      username: SALESFORCE_USERNAME,
      password: SALESFORCE_PASSWORD,
      securityToken: SALESFORCE_SECURITYTOKEN, // A security token can be generated from the Salesforce dashboard under: Account Name > Setup > My Personal Information > Reset My Security Token.
    })
    .then(async function () {
      var q =
        "SELECT Id, Name, Salutation, FirstName, LastName, Title, Email, Phone, MailingStreet, MailingCity, MailingState, MailingCountry, MailingPostalCode, account.Name FROM Contact";

      return org.query({
        query: q,
      });
    })
    .then(function (response) {
      return response;
    })
    .catch(function (err) {
      return err;
    });
};

const createWebexContacts = (data,WEBEX_TOKEN) => {

  const WEBEX_HEADERS = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${WEBEX_TOKEN}`,
  };

  var outputJson = {
    total: 0,
    errors: [],
    success: [],
    duplicates: []
  };

  return new Promise(async (resolve, reject) => {
    try {
      for (const record of data.records) {
        outputJson.total++;
        // Let's check if this contact exists in Webex already
        await fetch(
          `https://webexapis.com/v1/contacts/organizations/${WEBEX_ORG_ID}/contacts/search?keyword=${record._fields.email}&limit=1000&source=CH`,
          {
            headers: WEBEX_HEADERS,
          }
        )
          .then((response) => response.json())
          .then(async (body) => {
            if (body.errors) {
              outputJson.errors.push(body.errors[0].description);
              return;
            }
            // If the contact doesn't exist, let's create it
            if (body.total < 1) {
              var normalizedPhone = phone.phone(record._fields.phone);
              const WEBEX_BODY = {
                schemas: "urn:cisco:codev:identity:contact:core:1.0",
                displayName: record._fields.name,
                firstName: record._fields.firstname,
                lastName: record._fields.lastname,
                companyName: record._fields.account.Name,
                title: record._fields.salutation,
                address: `{"street":"${record._fields.mailingstreet}","city":"${record._fields.mailingcity}","state":"${record._fields.mailingstate}","country":"${record._fields.mailingcountry}","zipCode":"${record._fields.mailingpostalcode}"}`,
                source: "CH",
                emails: [
                  {
                    value: record._fields.email,
                    type: "home",
                    primary: true,
                  },
                ],
                phoneNumbers: [
                  {
                    value: normalizedPhone.phoneNumber,
                    type: "work",
                    primary: true,
                  },
                ],
              };

              await fetch(
                `https://webexapis.com/v1/contacts/organizations/${WEBEX_ORG_ID}/contacts`,
                {
                  method: "POST",
                  body: JSON.stringify(WEBEX_BODY),
                  headers: WEBEX_HEADERS,
                }
              )
                .then((response) => response.json())
                .then((body) => {
                  outputJson.success.push({
                    status: "created",
                    email: record._fields.email,
                  });
                });
            } else {
              outputJson.duplicates.push({
                status: "already exists",
                email: record._fields.email,
              });
            }
          });
      }
      resolve(outputJson);
    } catch (error) {
      reject(error);
    }
  });
};

exports.getSalesforceContacts = getSalesforceContacts;
exports.createWebexContacts = createWebexContacts;
