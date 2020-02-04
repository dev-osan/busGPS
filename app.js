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
var moment = require("moment-timezone");
var busStopLocationData = __importStar(require("./routes"));
var app = express_1.default();
var port = process.env.PORT || 3000;
var TIMEOUT_MS = 2 * 60 * 1000;
var WEEKEND_START_TIME = moment().set({ 'hour': 7 });
var WEEKEND_STOP_TIME = moment().set({ 'hour': 23 });
var WEEKDAY_START_TIME = moment().set({ 'hour': 5 });
var WEEKDAY_STOP_TIME = moment().set({ 'hour': 23 });
var blueLoc = 1;
var orangeLoc = 1;
var blueStatus = 'Bus running without tracking.';
var orangeStatus = 'Bus running without tracking.';
var blueInTransit = false;
var orangeInTransit = false;
var blueLastUpdateTimestamp = moment();
var orangeLastUpdateTimestamp = moment();
var routeLength;
app.use(express_1.default.static('public'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.get('/', function (req, res) {
    res.sendFile(path_1.default.join(__dirname + '/views/index.html'));
});
var prev_loc_map = new Map();
app.get('/updateLocation', function (req, res) {
    console.log("ID: " + req.query.id);
    console.log("Location: " + req.query.loc);
    console.log("inTransit: " + req.query.inTransit);
    var loc = Number(req.query.loc);
    var inTransit = (req.query.inTransit == 'true');
    var id = req.query.id;
    if (loc <= 0) {
        res.sendStatus(200);
        return;
    }
    if (!prev_loc_map.has(id)) {
        prev_loc_map.set(id, loc);
        if (loc < routeLength / 2) {
            blueLoc = loc;
            blueStatus = '';
            blueLastUpdateTimestamp = moment();
        }
        else {
            orangeLoc = loc;
            orangeStatus = '';
            orangeLastUpdateTimestamp = moment();
        }
    }
    if (!inTransit) {
        if (prev_loc_map.get(id) < loc) {
            blueLoc = loc;
            prev_loc_map.set(id, loc);
            blueInTransit = false;
            blueStatus = '';
            blueLastUpdateTimestamp = moment();
        }
        else if (prev_loc_map.get(id) > loc) {
            orangeLoc = loc;
            prev_loc_map.set(id, loc);
            orangeInTransit = false;
            orangeStatus = '';
            orangeLastUpdateTimestamp = moment();
        }
    }
    if (blueLoc == 1 && orangeLoc == routeLength || blueLoc == routeLength && orangeLoc == 1) {
        if (inTransit) {
            if (prev_loc_map.get(id) == 1) {
                blueInTransit = true;
                blueStatus = '';
                blueLastUpdateTimestamp = moment();
            }
            else if (prev_loc_map.get(id) == routeLength) {
                orangeInTransit = true;
                orangeStatus = '';
                orangeLastUpdateTimestamp = moment();
            }
        }
        else {
            blueLoc = 1;
            orangeLoc = routeLength;
            blueStatus = '';
            orangeStatus = '';
            blueLastUpdateTimestamp = moment();
            orangeLastUpdateTimestamp = moment();
        }
    }
    if (Number(moment()) - Number(blueLastUpdateTimestamp) > TIMEOUT_MS) {
        if (orangeLoc == 1) {
            orangeStatus = "Bus is currently running without tracking.";
            blueLoc = 1;
            blueStatus = "";
            blueLastUpdateTimestamp = moment();
        }
    }
    if (Number(moment()) - Number(orangeLastUpdateTimestamp) > TIMEOUT_MS) {
        if (blueLoc == routeLength) {
            blueStatus = "Bus is currently running without tracking.";
            orangeLoc = routeLength;
            orangeStatus = "";
            orangeLastUpdateTimestamp = moment();
        }
    }
    res.sendStatus(200);
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
    checkTimeout();
    res.json(locationData);
});
app.get('/routes', function (req, res) {
    var day = moment().tz('asia/seoul').format('dddd');
    var isWeekend = day === 'Sunday' || day === 'Saturday';
    var currentTime = moment().tz('asia/seoul');
    console.log("Weekend stop time: " + WEEKEND_STOP_TIME);
    console.log("Today is " + day + " at " + currentTime.format('HH:mm:ss') + ", and isWeekend = " + isWeekend);
    console.log("In between? " + currentTime.isBetween(WEEKEND_START_TIME, WEEKEND_STOP_TIME));
    if (isWeekend) {
        if (!currentTime.isBetween(WEEKEND_START_TIME, WEEKEND_STOP_TIME)) {
            blueStatus = "Weekend running hours are 0700-2300";
            orangeStatus = "Busses are not currently running.";
        }
        routeLength = busStopLocationData.weekendRoute.stops.length;
        res.json(busStopLocationData.weekendRoute);
    }
    else {
        if (!currentTime.isBetween(WEEKDAY_START_TIME, WEEKDAY_STOP_TIME)) {
            blueStatus = "Weekday running hours are 0500-2300";
            orangeStatus = "Busses are not currently running.";
        }
        routeLength = busStopLocationData.weekdayRoute.stops.length;
        res.json(busStopLocationData.weekdayRoute);
    }
});
app.get('/routes_min', function (req, res) {
    var day = moment().tz('asia/seoul').format('dddd');
    var isWeekend = day === 'Sunday' || day === 'Saturday';
    var currentTime = moment().tz('asia/seoul');
    console.log("Weekend stop time: " + WEEKEND_STOP_TIME);
    console.log("Today is " + day + " at " + currentTime.format('HH:mm:ss') + ", and isWeekend = " + isWeekend);
    console.log("In between? " + currentTime.isBetween(WEEKEND_START_TIME, WEEKEND_STOP_TIME));
    if (isWeekend) {
        if (!currentTime.isBetween(WEEKEND_START_TIME, WEEKEND_STOP_TIME)) {
            blueStatus = "Weekend running hours are 0700-2300";
            orangeStatus = "Busses are not currently running.";
        }
        routeLength = busStopLocationData.weekendRoute.stops.length;
        res.json(minifyBusRouteInfo(busStopLocationData.weekendRoute));
    }
    else {
        if (!currentTime.isBetween(WEEKDAY_START_TIME, WEEKDAY_STOP_TIME)) {
            blueStatus = "Weekday running hours are 0500-2300";
            orangeStatus = "Busses are not currently running.";
        }
        routeLength = busStopLocationData.weekdayRoute.stops.length;
        res.json(minifyBusRouteInfo(busStopLocationData.weekdayRoute));
    }
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
        blueStatus = "Bus is currently running without tracking.";
    }
    if (Number(moment()) - Number(orangeLastUpdateTimestamp) > TIMEOUT_MS) {
        orangeStatus = "Bus is currently running without tracking.";
    }
}
function minifyBusRouteInfo(routes) {
    var routes_minified = { stops: [] };
    routes.stops.forEach(function (stop) {
        routes_minified.stops.push(stop.lat);
        routes_minified.stops.push(stop.lon);
    });
    return routes_minified;
}
