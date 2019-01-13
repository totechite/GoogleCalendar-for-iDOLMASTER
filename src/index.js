"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom_1 = require("jsdom");
var fs_1 = __importDefault(require("fs"));
String.prototype.replaceall = function (pattern, word) {
    var self = this.valueOf();
    self.replace(pattern, word);
    return self;
};
var get_html = fs_1.default.readFileSync("./imastable.html", 'utf-8');
var dom = new jsdom_1.JSDOM(get_html);
var tr = dom.window.document.getElementsByTagName("tr");
// fs.writeFile("./out.html", aa, ()=>{})
console.debug(tr.item(3).cells);
for (var _i = 0, _a = tr.item(3).cells; _i < _a.length; _i++) {
    var i = _a[_i];
    console.debug(i.textContent + "\n--------------------------");
}
console.debug(tr.item(3).cells[3].firstChild.alt);
