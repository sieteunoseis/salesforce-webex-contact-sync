if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const axios = require('axios')
const cron = require('node-cron');
const express = require('express')
const path = require('path')
const app = express()
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const getVariables = require('./js/enVars.js');
const getContacts = require('./js/contacts.js');

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Construct our Authorization URL
const authorizationURL =  getVariables.env.WEBEX_APP_AUTHORIZATION_URL + "?" +
                          "client_id="+getVariables.env.WEBEX_APP_CLIENT_ID+
                          "&response_type=code"+
                          "&redirect_uri="+ encodeURIComponent(getVariables.env.WEBEX_APP_REDIRECT_URL)+
                          "&scope="+encodeURIComponent(getVariables.env.WEBEX_APP_SCOPES)
                          

//Store the access and refresh tokens here
let integrationAuthentication;

app.use(express.static(path.join(__dirname, "public")));

/* GET home page. */
app.get('/', function(req, res, next) {
  if (integrationAuthentication == null){
    res.render('index', { title: 'Salesforce to Webex Contact Sync', integrationAuthentication: false  });
    sendMessage("Not authenticated.");
  }else{
    res.render('index', { title: 'Salesforce to Webex Contact Sync', integrationAuthentication: true  });
    sendMessage("Authentication Successful!");
  }
});

//OAuth 
app.get('/oauth', (req, res) => {
  if (integrationAuthentication == null){
    if (typeof(req.query.code) == 'undefined'){
      res.redirect(authorizationURL)
    } else {
      getAccessToken(req.query.code, res)
    }
  } else {
    res.redirect('/')
  }
})

//This function will get the initial access token
function getAccessToken(code, res){
  //Create a post to the token URL
  axios.post(getVariables.env.WEBEX_APP_TOKEN_URL, {
    grant_type: "authorization_code",
    client_id: getVariables.env.WEBEX_APP_CLIENT_ID,
    client_secret: getVariables.env.WEBEX_APP_CLIENT_SECRET,
    code: code,
    redirect_uri: getVariables.env.WEBEX_APP_REDIRECT_URL
  })
  .then(function (response) {
    if (typeof(response.data.access_token) != 'undefined'){
      //Store the response in a global variable
      integrationAuthentication = response.data
      // Let log to the DOM via Socket.io
      sendMessage("Retrieved access token.");
      //Create a scheduled job to refresh the access token daily
      // 0 0 0 * * * = every day at midnight
      // */5 * * * * = every 5 minutes
      sendMessage("Creating a scheduled job to refresh the Webex access token daily at midnight.");
      cron.schedule('0 0 0 * * *', async () => {
        integrationAuthentication = await refreshAccessToken();
        SFtoWebex(integrationAuthentication.access_token);
      })
      
      res.redirect('/')

      ///////////////////////////////////////////
      ///// Call your integration code here /////
      ///////////////////////////////////////////
      SFtoWebex(integrationAuthentication.access_token);
    }
  })

}

const SFtoWebex = async (webexToken) => {
  var sfContacts = await getContacts.getSalesforceContacts();
  var createWebex = await getContacts.createWebexContacts(sfContacts,webexToken);
  refreshMessage(`Found ${sfContacts.totalSize} Salesforce contacts. Attempting to sync with Webex.`);
  refreshMessage(`Webex processed ${createWebex.total} records. Created: ${createWebex.success.length}. Duplicates: ${createWebex.duplicates.length}. Failures ${createWebex.errors.length}.`);
}

//This function will refresh the existing access token
function refreshAccessToken(){
  return new Promise((resolve, reject) => {
    refreshMessage("Refreshing Webex access token.");
    //Create a HTTP Port to the Token URL with the refresh token
    axios.post(getVariables.env.WEBEX_APP_TOKEN_URL, {
      grant_type: "refresh_token",
      client_id: getVariables.env.WEBEX_APP_CLIENT_ID,
      client_secret: getVariables.env.WEBEX_APP_CLIENT_SECRET,
      refresh_token: integrationAuthentication.refresh_token
    })
    .then(function (response) {
      if(typeof(response.data.access_token) != 'undefined'){
        resolve(response.data)
      }
    }).catch(function (error) {
      reject(error.toJSON());
    });
  });
}

// Send socket message to front end
function sendMessage(message) {
  io.on("connection", (socket) => {
    console.log('Socket.io. Sending message: ' + message);
    socket.emit('response', { message: new Date().toLocaleString().concat(' - ').concat(message) });
  });
}

function refreshMessage(message) {
  console.log('Socket.io. Refresh message: ' + message);
  io.emit('response', { message: new Date().toLocaleString().concat(' - ').concat(message) });
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});

