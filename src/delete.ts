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
        authorize(JSON.parse(content.toString()), delete_events);
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
async function sleep(t: number) {
    return await new Promise(r => {
        setTimeout(() => {
            r();
        }, t);
    });
}

async function delete_events(auth: OAuth2Client) {
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarIds = {
        "765": "uv32on1tflbt3fi5brpem5sja8@group.calendar.google.com",
        "CG": "2jtqfn3p803fl4mgeb2kpco2cs@group.calendar.google.com",
        "ML": "95kg6p598lqg857retat31s2dk@group.calendar.google.com",
        "SM": "1fdprh725au6aqnlslok9j2vqg@group.calendar.google.com",
        "SC": "cn00hegu328707hcn9j3qjcqng@group.calendar.google.com",
    }

    const delete_event = (items: any, calendarId: string) => {
        for (let index = 0; index < items!.length; index++) {
            const item = items[index];
            let id = item.id
            calendar.events.delete({ calendarId: calendarId, eventId: id })
            
        }
    }

    const namco = await calendar.events.list({ calendarId: calendarIds['765'], alwaysIncludeEmail: false });
    delete_event(namco.data.items, calendarIds['765'])
    await sleep(300)
    const CG = await calendar.events.list({ calendarId: calendarIds['CG'], alwaysIncludeEmail: false });
    delete_event(CG.data.items, calendarIds['CG'])
    await sleep(300)
    const ML = await calendar.events.list({ calendarId: calendarIds['ML'], alwaysIncludeEmail: false });
    delete_event(ML.data.items, calendarIds['ML'])
    await sleep(300)
    const SM = await calendar.events.list({ calendarId: calendarIds['SM'], alwaysIncludeEmail: false });
    delete_event(SM.data.items, calendarIds['SM'])
    await sleep(300)
    const SC = await calendar.events.list({ calendarId: calendarIds['SC'], alwaysIncludeEmail: false });
    delete_event(SC.data.items, calendarIds['SC'])

}


main()