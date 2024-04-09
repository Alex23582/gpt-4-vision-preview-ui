"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const openai_1 = __importDefault(require("openai"));
const app = (0, express_1.default)();
app.use(express_1.default.json({
    limit: "30mb"
}));
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));
const port = 3001;
app.use(express_1.default.static("../frontend/build"));
app.post('/getResponse', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d, _e;
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    const body = req.body;
    const response = yield new openai_1.default({ apiKey: req.body.apikey }).chat.completions.create(({
        model: "gpt-4-vision-preview",
        max_tokens: req.body.maxLength,
        messages: body.messages.map((message) => {
            let content = [];
            if (message.message) {
                content.push({
                    type: "text",
                    text: message.message,
                });
            }
            if (message.image) {
                content.push({
                    type: "image_url",
                    image_url: {
                        url: message.image
                    }
                });
            }
            let role = "assistant";
            if (message.author == "User") {
                role = "user";
            }
            return {
                role,
                content: content,
            };
        }),
        stream: true
    }));
    try {
        for (var _f = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _a = response_1_1.done, !_a; _f = true) {
            _c = response_1_1.value;
            _f = false;
            const part = _c;
            const chunk = (_e = (_d = part.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content;
            if (chunk)
                res.write(chunk);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_f && !_a && (_b = response_1.return)) yield _b.call(response_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    res.end();
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
