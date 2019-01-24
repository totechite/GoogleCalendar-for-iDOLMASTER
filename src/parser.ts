import fs from 'fs'
import moment from 'moment'
import readline from 'readline'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const TOKEN_PATH = 'token.json';

async function main() {
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

async function sleep(t:number) {
    return await new Promise(r => {
        setTimeout(() => {
            r();
        }, t);
    });
}

async function addEvents(auth: OAuth2Client) {

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
    interface schedule_json {
        day: number
        week: string
        data: {
            startTime: string
            group: string
            evGenre: string
            evTitle: string
            evURL: string
        }[]
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarIds = {
        "765": "28vop157tq01tms0v83j61tmhk@group.calendar.google.com",
        "CG": "uijipvnpvsj9qv8nc35ko4fto8@group.calendar.google.com",
        "ML": "95kg6p598lqg857retat31s2dk@group.calendar.google.com",
        "SM": "94k64095n0lu97eb27vbqav8v0@group.calendar.google.com",
        "SC": "40j1q59vi33t5e4ptmnbq4qhl0@group.calendar.google.com",
    }

    const events: schedule_json[] = JSON.parse(fs.readFileSync("./producer_schedule.json").toString())
    for (let index_root = 0; index_root < events.length; index_root++) {
        let data = events[index_root].data;
        for (let index = 0; index < data.length; index++) {
            let dat = data[index];
            if (dat.startTime == 'null') {
            } else {
                let start_dataTime = dat.startTime == 'allday' ? { "date": moment().date(events[index_root].day).format("YYYY-MM-DD") } : { "dateTime": moment(dat.startTime, 'HH:mm').date(events[index_root].day).format() }
                start_dataTime["timeZone"] = "Japan"
                let end_dataTime = dat.startTime == 'allday' ? { "date": moment().date(events[index_root].day + 1).format("YYYY-MM-DD") } : { "dateTime": moment(dat.startTime, 'HH:mm').date(events[index_root].day).add(1, 'hours').format() }
                end_dataTime["timeZone"] = "Japan"
                dat.group.split("、 ").forEach((group: string) => {
                    let g: string | null = null;
                    switch (group) {
                        case "765":
                            g = calendarIds["765"]
                            break;
                        case "シンデレラ":
                            g = calendarIds["CG"]
                            break;
                        case "ミリオン":
                            g = calendarIds["ML"]
                            break;
                        case "SideM":
                            g = calendarIds["SM"]
                            break;
                        case "シャイニー":
                            g = calendarIds["SC"]
                            break;
                    };
                    let event = {
                        'summary': dat.evTitle,
                        'location': dat.evURL,
                        'description': dat.evGenre,
                        'start': start_dataTime,
                        'end': end_dataTime,
                    }
                    if (g != null) {
                        calendar.events.insert({
                            calendarId: g,
                            resource: event
                        });
                    }

                })
            }

        }
        await sleep(1000)
    }

}

main()