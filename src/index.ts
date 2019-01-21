import axios from 'axios'
import { JSDOM } from 'jsdom'
import fs from 'fs'

function main() {
    // ============= Get .html ================
    // axios.get("https://idolmaster.jp/schedule/?ey=2019&em=01")
    //     .then((res) => { fs.writeFileSync("./imastable.html", res.data) }).catch(()=>{})
    // ========================================

    const get_html: string = fs.readFileSync('./imastable.html', 'utf-8')

    const dom = new JSDOM(get_html)

    const tr = dom.window.document.getElementsByTagName('tr')
    var day_count = 1
    const json: { day: number, week: string, data: { startTime: string, group: string, evGenre: string, evTitle: string, evURL: string }[] }[] = []
    for (let i = 3; tr.length - 1 > i; i++) {
        const row = tr.item(i)
        if (row == null) {
            break
        }
        const week = row.getElementsByClassName('week2')
        const time = row.getElementsByClassName('time2').item(0)
        const performance = row.getElementsByClassName("performance2").item(0)
        const genre = row.getElementsByClassName('genre2').item(0)
        const article = row.getElementsByClassName('article2').item(0)
        for (let o = 0; week.length >= o; o++) {
            const w = week.item(o)
            if (w != null) {
                let wk = (w.textContent !== null) ? w.textContent : 'null'
                const tmp = { day: day_count, week: wk, data: [] }
                json.push(tmp)
                day_count++
            } else {
                let tmp = json.pop()
                if (tmp != undefined) {
                    const nullCheck = (arg: string | null): string => {
                        if (arg != (null | '')) {
                            return arg
                        } else {
                            return 'null'
                        }
                    }
                    const t_time = nullCheck(time.textContent)
                    const t_group = nullCheck(performance.innerHTML.match(/alt=\"(.+)\"/) != null ? performance.innerHTML.match(/alt=\"(.+)\"/)[1] : "null")
                    const t_genre = nullCheck(genre.textContent)
                    const t_title = nullCheck(article.textContent)
                    const urlreg = new RegExp(/href=\"(.+)\"(?=\s)/)
                    const t_url = nullCheck(article.innerHTML.match(urlreg) != null ? article.innerHTML.match(urlreg)[1] : "null")
                    tmp.data.push({ startTime: t_time, group: t_group, evGenre: t_genre, evTitle: t_title, evURL: t_url })
                    const t_result = { day: tmp.day, week: tmp.week, data: tmp.data }
                    json.push(t_result)
                }
            };

        }
    }

    const row = tr.item(5)
    console.debug(json)
    fs.writeFileSync('./producer_schedule.json', JSON.stringify(json))

}

main()