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
var busStopLocationData = __importStar(require("./routes"));
var app = express_1.default();
var port = process.env.PORT || 3000;
var blueLoc = 1;
var orangeLoc = 25;
var blueStatus = 'Not currently running.';
var orangeStatus = 'Not currently running.';
var blueInTransit = false;
var orangeInTransit = false;
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
    console.log("Sending update info: " + JSON.stringify(locationData));
    res.json(locationData);
});
app.get('/routes', function (req, res) {
    res.json(busStopLocationData.routes);
});
app.post('/pi', function (req, res) {
    switch (String(req.body.route)) {
        case "blue":
            blueLoc = parseInt(req.body.stop);
            blueStatus = JSON.parse(req.body.status);
            blueInTransit = JSON.parse(req.body.intransit);
            break;
        case "orange":
            console.log("Updating orange route");
            orangeLoc = parseInt(req.body.stop);
            orangeStatus = req.body.status;
            orangeInTransit = req.body.intransit;
    }
    res.sendStatus(200);
});
app.listen(port, function () { return console.log("bus GPS listening on port " + port + "!"); });
