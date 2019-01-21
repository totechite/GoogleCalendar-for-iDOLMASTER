import fs from 'fs'
import moment from 'moment'
import readline from 'readline'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library';


const SCOPES = ['https://www.googleapis.com/auth/calendar'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

function main(): void {
    console.log(moment('2019-01-01 00:00', 'YYYY-MM-DD HH:mm').format())

    // Client ID
    // 608447596395-m42a9krrbn836077klg8c9f7kdb4eiqc.apps.googleusercontent.com
    // Client Secret
    // IQ_j9yvDH6OFYTc7sJ4-oBUF


    fs.readFile('./credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Calendar API.
        authorize(JSON.parse(content), listEvents);
    });

}

interface credentials {
    installed: {
        client_secret: string
        client_id: string
        redirect_uris: string
    }
}

interface callbackType { (arg: OAuth2Client): void }

function authorize(credentials: credentials, callback: callbackType) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client: OAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        callback(oAuth2Client);
    });
}

function getAccessToken(oAuth2Client: OAuth2Client, callback: callbackType) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function listEvents(auth: OAuth2Client): void {
    const calendar = google.calendar({ version: 'v3', auth });
    const event = {
        'summary': 'Test',
        'location': 'wired',
        'description': 'hogehoge hugahuga',
        'start': {
            'dateTime': moment().format(),
            'timeZone': 'Japan'
        },
        'end': {
            'dateTime': moment('2019-01-23 00:00', 'YYYY-MM-DD HH:mm').format(),
            'timeZone': 'Japan'
        },
        'recurrence': [
            'RRULE:FREQ=DAILY;COUNT=2'
        ],

    }
    calendar.events.insert({
        calendarId: 'uv32on1tflbt3fi5brpem5sja8@group.calendar.google.com',
        resource: event
    });
}

main()