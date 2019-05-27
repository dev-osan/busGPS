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
var blueErr = '';
var orangeErr = '';
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname + '/views/index.html'));
});
app.get('/api', function (req, res) {
    var locationData = {
        "blue": {
            loc: blueLoc
        },
        "orange": {
            loc: orangeLoc
        }
    };
    if (blueErr != '') {
        locationData.blue.err = blueErr;
    }
    if (orangeErr != '') {
        locationData.orange.err = orangeErr;
    }
    res.json(locationData);
});
app.get('/routes', function (req, res) {
    res.json(busStopLocationData.routes);
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
