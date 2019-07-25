"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var moment = require("moment");
var busStopLocationData = __importStar(require("./routes"));
var app = express_1.default();
var port = process.env.PORT || 3000;
var TIMEOUT_MS = 10 * 60 * 1000;
var blueLoc = 1;
var orangeLoc = 1;
var blueStatus = 'No GPS tracking available at the moment.';
var orangeStatus = 'No GPS tracking available at the moment.';
var blueInTransit = false;
var orangeInTransit = false;
var blueLastUpdateTimestamp = moment();
var orangeLastUpdateTimestamp = moment();
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname + '/views/index.html'));
});
app.get('/api', function (req, res) {
    var locationData = {
        "blue": {
            "loc": blueLoc,
            "intransit": blueInTransit
        },
        "orange": {
            "loc": orangeLoc,
            "intransit": orangeInTransit
        }
    };
    if (blueStatus != '') {
        locationData.blue.err = blueStatus;
    }
    if (orangeStatus != '') {
        locationData.orange.err = orangeStatus;
    }
    res.json(locationData);
});
app.get('/routes', function (req, res) {
    res.json(busStopLocationData.routes);
});
app.post('/pi', function (req, res) {
    switch (String(req.body.route)) {
        case "blue":
            blueLoc = parseInt(req.body.stop);
            blueStatus = req.body.status;
            blueInTransit = JSON.parse(req.body.intransit);
            blueLastUpdateTimestamp = moment();
            break;
        case "orange":
            orangeLoc = parseInt(req.body.stop);
            orangeStatus = req.body.status;
            orangeInTransit = JSON.parse(req.body.intransit);
            orangeLastUpdateTimestamp = moment();
            break;
        default:
            blueStatus = req.body.status;
            orangeStatus = req.body.status;
    }
    checkTimeout();
    console.log("------ ------ ------");
    console.log("Route: " + String(req.body.route));
    console.log("Location: " + parseInt(req.body.stop));
    console.log("In Transit: " + JSON.parse(req.body.intransit));
    console.log("Status: " + req.body.status);
    res.sendStatus(200);
});
app.listen(port, function () { return console.log("bus GPS server listening on port " + port + "!"); });
function checkTimeout() {
    if (Number(moment()) - Number(blueLastUpdateTimestamp) > TIMEOUT_MS) {
        blueStatus = "Bus has lost connection.";
    }
    if (Number(moment()) - Number(orangeLastUpdateTimestamp) > TIMEOUT_MS) {
        orangeStatus = "Bus has lost connection.";
    }
}
