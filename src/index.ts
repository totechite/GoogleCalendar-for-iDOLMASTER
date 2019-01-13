import axios from 'axios'
import {JSDOM} from 'jsdom'
import fs from 'fs'

// const get_result: Promise<string> = axios.get("./imastable.html")
//     .then((html) => html.data)
//     .catch(error => {
//         console.debug(error)
//         return "error!"
//     });

declare global {
    interface String {
        replaceall(pattern: string | RegExp, word: string): string;
    }
}

String.prototype.replaceall = function (pattern: string | RegExp, word: string): string {
    const self:string = (this as String).valueOf()
    self.replace(pattern, word)
    return self
}

const get_html: string = fs.readFileSync("./imastable.html", 'utf-8')

const dom = new JSDOM(get_html)
const tr = dom.window.document.getElementsByClassName(names)

// fs.writeFile("./out.html", aa, ()=>{})
// console.debug(tr.item(3).cells)
// for (let i of tr.item(3).cells){
//     console.debug(i.textContent+"\n--------------------------")
// }
// console.debug(tr.item(3).cells[3].firstChild.alt)