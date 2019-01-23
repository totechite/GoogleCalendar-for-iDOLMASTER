import fs from 'fs'
import moment from 'moment'
import readline from 'readline'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const TOKEN_PATH = 'token.json';

function main(): void {
    console.log(moment('2019-01-01 00:00', 'YYYY-MM-DD HH:mm').format())


    fs.readFile('./credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Calendar API.
        authorize(JSON.parse(content.toString()), addEvents);
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
            oAuth2Client.setCredentials(token!);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function addEvents(auth: OAuth2Client): void {
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarIds = {
        "765": "uv32on1tflbt3fi5brpem5sja8@group.calendar.google.com",
        "CG": "2jtqfn3p803fl4mgeb2kpco2cs@group.calendar.google.com",
        "ML": "95kg6p598lqg857retat31s2dk@group.calendar.google.com",
        "SM": "1fdprh725au6aqnlslok9j2vqg@group.calendar.google.com",
        "SC": "cn00hegu328707hcn9j3qjcqng@group.calendar.google.com",
    }
    interface event {
        summary: string
        location: string
        description: string
        start: {
            dataTime: string
            timeZone: string
        }
        end: {
            dataTime: string
            timeZone: string
        }
    }

    let event = {
        'summary': '「THE IDOLM@STER CINDERELLA GIRLS new generations★BrilliantParty！」Produced by CG STAR LIVE',
        'location': "https://vrzone-pic.com/osaka/activity/brilliantparty.html",
        'description': 'イベント',
        'start': { "dateTime": moment('12:00', 'HH:mm').date(25).format() },
        'end': { "dateTime": moment('12:00', 'HH:mm').date(25).add(1, 'hour').format() },
    }
    calendar.events.insert({
        calendarId: calendarIds["765"],
        resource: event
    });
}


main()