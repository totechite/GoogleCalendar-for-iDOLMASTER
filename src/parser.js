"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var moment_1 = __importDefault(require("moment"));
var readline_1 = __importDefault(require("readline"));
var googleapis_1 = require("googleapis");
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
var TOKEN_PATH = 'token.json';
function main() {
    console.log(moment_1.default('2019-01-01 00:00', 'YYYY-MM-DD HH:mm').format());
    // Client ID
    // 608447596395-m42a9krrbn836077klg8c9f7kdb4eiqc.apps.googleusercontent.com
    // Client Secret
    // IQ_j9yvDH6OFYTc7sJ4-oBUF
    fs_1.default.readFile('./credentials.json', function (err, content) {
        if (err)
            return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Calendar API.
        authorize(JSON.parse(content), listEvents);
    });
}
function authorize(credentials, callback) {
    var _a = credentials.installed, client_secret = _a.client_secret, client_id = _a.client_id, redirect_uris = _a.redirect_uris;
    var oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    fs_1.default.readFile(TOKEN_PATH, function (err, token) {
        if (err)
            return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        callback(oAuth2Client);
    });
}
function getAccessToken(oAuth2Client, callback) {
    var authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    var rl = readline_1.default.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oAuth2Client.getToken(code, function (err, token) {
            if (err)
                return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs_1.default.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
                if (err)
                    console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}
function listEvents(auth) {
    var calendar = googleapis_1.google.calendar({ version: 'v3', auth: auth });
    var event = {
        'summary': 'Test',
        'location': 'wired',
        'description': 'hogehoge hugahuga',
        'start': {
            'dateTime': moment_1.default().format(),
            'timeZone': 'Japan'
        },
        'end': {
            'dateTime': moment_1.default('2019-01-23 00:00', 'YYYY-MM-DD HH:mm').format(),
            'timeZone': 'Japan'
        },
        'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
        ],
    };
    calendar.events.insert({
        calendarId: 'uv32on1tflbt3fi5brpem5sja8@group.calendar.google.com',
        resource: event
    });
}
main();
