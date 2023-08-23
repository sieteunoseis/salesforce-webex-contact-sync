if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const axios = require("axios");
const cron = require("node-cron");
const express = require("express");
const path = require("path");
const app = express();
const fs = require("fs");

const getVariables = require("./js/enVars.js");
const getContacts = require("./js/contacts.js");
const { env } = require("process");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Construct our Authorization URL
const authorizationURL =
  getVariables.env.WEBEX_APP_AUTHORIZATION_URL +
  "?" +
  "client_id=" +
  getVariables.env.WEBEX_APP_CLIENT_ID +
  "&response_type=code" +
  "&redirect_uri=" +
  encodeURIComponent(getVariables.env.WEBEX_APP_REDIRECT_URL) +
  "&scope=" +
  encodeURIComponent(getVariables.env.WEBEX_APP_SCOPES);

//Store the access and refresh tokens here
let integrationAuthentication;
let task;

app.use(express.static(path.join(__dirname, "public")));

/* GET home page. */
app.get("/", function (req, res, next) {
  if (integrationAuthentication == null) {
    res.render("index", {
      title: "Salesforce to Webex Contact Sync",
      integrationAuthentication: false,
    });
  } else {
    res.render("index", {
      title: "Salesforce to Webex Contact Sync",
      integrationAuthentication: true,
    });
  }
});

//OAuth
app.get("/oauth", (req, res) => {
  if (integrationAuthentication == null) {
    if (typeof req.query.code == "undefined") {
      res.redirect(authorizationURL);
    } else {
      getAccessToken(req.query.code, res);
    }
  } else {
    res.redirect("/");
  }
});

/* GET Console Data. */
app.get("/console", function (req, res, next) {
  // Use fs.readFile() method to read the file
  fs.readFile("./data/console.txt", 'utf8', function(err, data){
    res.send(data);
  });
});

app.get("/logout", function (req, res) {
  const encoded = encodeURI(env.WEBEX_APP_RETURN_URL);
  writeLog("Logging out of application.");
  res.redirect(
    "https://idbroker.webex.com/idb/oauth2/v1/logout?goto=" + encoded + "&token=" + integrationAuthentication.access_token
  );
  
  // Reset the integrationAuthentication variable and stop cron job
  integrationAuthentication = null;
  task.stop();
});

//This function will get the initial access token
function getAccessToken(code, res) {
  //Create a post to the token URL
  axios
    .post(getVariables.env.WEBEX_APP_TOKEN_URL, {
      grant_type: "authorization_code",
      client_id: getVariables.env.WEBEX_APP_CLIENT_ID,
      client_secret: getVariables.env.WEBEX_APP_CLIENT_SECRET,
      code: code,
      redirect_uri: getVariables.env.WEBEX_APP_REDIRECT_URL,
    })
    .then(function (response) {
      if (typeof response.data.access_token != "undefined") {
        //Store the response in a global variable
        integrationAuthentication = response.data;

        writeLog("Retrieved access token.");
        //Create a scheduled job to refresh the access token daily
        // 0 0 0 * * * = every day at midnight
        // */5 * * * * = every 5 minutes
        writeLog("Creating a scheduled job to refresh the Webex access token daily at midnight.");

        task = cron.schedule("0 0 0 * * *", async () => {
          integrationAuthentication = await refreshAccessToken();
          SFtoWebex(integrationAuthentication.access_token);
        });

        res.redirect("/");

        ///////////////////////////////////////////
        ///// Call your integration code here /////
        ///////////////////////////////////////////
        SFtoWebex(integrationAuthentication.access_token);
      }
    });
}

const SFtoWebex = async (webexToken) => {
  var sfContacts = await getContacts.getSalesforceContacts();
  writeLog(`Found ${sfContacts.totalSize} Salesforce contacts. Attempting to sync with Webex.`);
  var createWebex = await getContacts.createWebexContacts(
    sfContacts,
    webexToken
  );
  writeLog( `Webex processed ${createWebex.total} records. Created: ${createWebex.success.length}. Duplicates: ${createWebex.duplicates.length}. Failures ${createWebex.errors.length}.`)
};

//This function will refresh the existing access token
function refreshAccessToken() {
  return new Promise((resolve, reject) => {
    writeLog("Refreshing Webex access token.");
    //Create a HTTP Port to the Token URL with the refresh token
    axios
      .post(getVariables.env.WEBEX_APP_TOKEN_URL, {
        grant_type: "refresh_token",
        client_id: getVariables.env.WEBEX_APP_CLIENT_ID,
        client_secret: getVariables.env.WEBEX_APP_CLIENT_SECRET,
        refresh_token: integrationAuthentication.refresh_token,
      })
      .then(function (response) {
        if (typeof response.data.access_token != "undefined") {
          resolve(response.data);
        }
      })
      .catch(function (error) {
        reject(error.toJSON());
      });
  });
}

function writeLog(message) {
  const path = "./data/console.txt";
  var logs;
  // Check if the file exists in the current directory.
  if (fs.existsSync(path)) {
    // If the file exists, append to the file
    logs = fs.createWriteStream(path, {
      flags: "a",
    });
    logs.write(new Date().toLocaleString().concat(" - ").concat(message).concat('\n'));
    logs.end();
  } else {
    // Create a new log file
    logs = fs.createWriteStream(path);
    logs.write(new Date().toLocaleString().concat(" - ").concat(message).concat('\n'));
    logs.end();
  }
}

app.listen(process.env.PORT, () => {
  console.log(`App listening at http://localhost:${env.PORT}`)
})
