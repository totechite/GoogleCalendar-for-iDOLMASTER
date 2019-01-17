"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom_1 = require("jsdom");
var fs_1 = __importDefault(require("fs"));
// ============= Get .html ================
// axios.get("https://idolmaster.jp/schedule/?ey=2019&em=01")
//     .then((res) => { fs.writeFileSync("./imastable.html", res.data) }).catch(()=>{})
// ========================================
var get_html = fs_1.default.readFileSync("./imastable.html", 'utf-8');
var dom = new jsdom_1.JSDOM(get_html);
var tr = dom.window.document.getElementsByTagName("tr");
var day_count = 1;
var json = [];
for (var i = 3; tr.length - 1 > i; i++) {
    var row_1 = tr.item(i);
    if (row_1 == null) {
        break;
    }
    var week = row_1.getElementsByClassName("week2");
    var time = row_1.getElementsByClassName("time2").item(0);
    var performance_1 = row_1.getElementsByClassName("performance2").item(0);
    var genre = row_1.getElementsByClassName("genre2").item(0);
    var article = row_1.getElementsByClassName("article2").item(0);
    for (var o = 0; week.length >= o; o++) {
        var w = week.item(o);
        if (w != null) {
            var wk = (w.textContent !== null) ? w.textContent : "null";
            var tmp = { day: day_count, week: wk, data: [] };
            json.push(tmp);
            day_count++;
        }
        else {
            var tmp = json.pop();
            if (tmp != undefined) {
                var nullCheck = function (arg) {
                    if (arg != null) {
                        return arg;
                    }
                    else {
                        return "null";
                    }
                };
                var t_time = nullCheck(time.textContent);
                var t_group = nullCheck(performance_1.innerHTML.match(/alt=\"(.+)\"/) != null ? performance_1.innerHTML.match(/alt=\"(.+)\"/)[1] : "null");
                var t_genre = nullCheck(genre.textContent);
                var t_title = nullCheck(article.textContent);
                var urlreg = new RegExp(/href=\"(.+)\"(?=\s)/);
                var t_url = nullCheck(article.innerHTML.match(urlreg) != null ? article.innerHTML.match(urlreg)[1] : "null");
                tmp.data.push({ time: t_time, group: t_group, evGenre: t_genre, evTitle: t_title, evURL: t_url });
                var t_result = { day: tmp.day, week: tmp.week, data: tmp.data };
                json.push(t_result);
            }
        }
        ;
    }
}
var row = tr.item(5);
console.debug(json);
fs_1.default.writeFileSync("./producer_schedule.json", JSON.stringify(json));
