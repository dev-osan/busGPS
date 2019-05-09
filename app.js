"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var app = express_1.default();
var port = process.env.PORT || 3000;
var blueLoc = 1;
var orangeLoc = 1;
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get('/', function (req, res) { return res.redirect('/blue'); });
app.get('/blue', function (req, res) {
    res.sendFile(path_1.default.join(__dirname + '/views/blue.html'));
});
app.get('/orange', function (req, res) {
    res.sendFile(path_1.default.join(__dirname + '/views/orange.html'));
});
app.get('/api', function (req, res) {
    var locationData = {
        1: {
            loc: blueLoc
        },
        2: {
            loc: orangeLoc
        }
    };
    res.json(locationData);
});
app.get('/routes', function (req, res) {
    res.json(busStopLocationData);
});
app.post('/pi', function (req, res) {
    switch (parseInt(req.body.line)) {
        case 1:
            blueLoc = parseInt(req.body.loc);
            break;
        case 2:
            orangeLoc = parseInt(req.body.loc);
    }
    res.sendStatus(200);
});
app.listen(port, function () { return console.log("bus GPS listening on port " + port + "!"); });
var busStopLocationData = {};
