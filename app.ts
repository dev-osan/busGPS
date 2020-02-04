import express from 'express';
import path from 'path';
// import moment = require('moment');
import moment = require('moment-timezone');

import * as busStopLocationData from './routes';

const app = express();
const port = process.env.PORT || 3000;
const TIMEOUT_MS = 2 * 60 * 1000;

const WEEKEND_START_TIME = moment().set({'hour': 7});
const WEEKEND_STOP_TIME = moment().set({'hour': 23});
const WEEKDAY_START_TIME = moment().set({'hour': 5});
const WEEKDAY_STOP_TIME = moment().set({'hour': 23});

// Global variables for storing locations in memory. Persistance isn't necessary.
var blueLoc = 1;
var orangeLoc = 1;
var blueStatus = 'Bus running without tracking.';
var orangeStatus = 'Bus running without tracking.';
var blueInTransit = false
var orangeInTransit = false
var blueLastUpdateTimestamp = moment();
var orangeLastUpdateTimestamp = moment();
var routeLength: number;

interface Route {
  stops: { name: String,
          lat: Number,
          lon: Number,
          blue_time: Number[],
          orange_time: Number[]
        }[]
}

interface Route_min {
  stops: Number[]
}

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req: any, res: any) => {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

var prev_loc_map = new Map();

app.get('/updateLocation', (req: any, res: any) => {
  // should come in like /updateLocation?id=1&loc=4&inTransit=true
  // parse out each param
  // figure out what route this bus id is on
  // update bus status
  console.log(`ID: ${req.query.id}`);
  console.log(`Location: ${req.query.loc}`);
  console.log(`inTransit: ${req.query.inTransit}`);

  let loc: number = Number(req.query.loc);
  let inTransit: boolean = (req.query.inTransit == 'true');
  let id: string = req.query.id;

  if (loc <= 0) {
    // The device doesn't know where it's at yet.
    res.sendStatus(200);
    return;
  }

  // setting initial conditions
  if (!prev_loc_map.has(id)) {
    prev_loc_map.set(id, loc);
    if (loc < routeLength / 2) {
      blueLoc = loc;
      blueStatus = '';
      blueLastUpdateTimestamp = moment();
    } else {
      orangeLoc = loc;
      orangeStatus = '';
      orangeLastUpdateTimestamp = moment();
    }
  }

  // update route at stop
  if (!inTransit) {
    if (prev_loc_map.get(id) < loc) {
      blueLoc = loc;
      prev_loc_map.set(id, loc);
      blueInTransit = false;
      blueStatus = '';
      blueLastUpdateTimestamp = moment();
    } else if (prev_loc_map.get(id) > loc) {
      orangeLoc = loc;
      prev_loc_map.set(id, loc);
      orangeInTransit = false;
      orangeStatus = '';
      orangeLastUpdateTimestamp = moment();
    }
  }

  // edge case where bus turns around.
  if (blueLoc == 1 && orangeLoc == routeLength || blueLoc == routeLength && orangeLoc == 1) {
    if (inTransit) {
      if (prev_loc_map.get(id) == 1) {
        blueInTransit = true;
        blueStatus = '';
        blueLastUpdateTimestamp = moment();
      } else if (prev_loc_map.get(id) == routeLength) {
        orangeInTransit = true;
        orangeStatus = '';
        orangeLastUpdateTimestamp = moment();
      }
    } else { // both busses at end of routes, so swap.
      blueLoc = 1;
      orangeLoc = routeLength;
      blueStatus = '';
      orangeStatus = '';
      blueLastUpdateTimestamp = moment();
      orangeLastUpdateTimestamp = moment();
    }
  }

  // handle when one bus times out while the other is still running and is at end of route.
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

// the endpoint for the client to update it's bus location
app.get('/api', (req: any, res: any) => {
  let locationData: {[k: string]: any} = {
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

// The endpoint for getting the bus stop gps data.
app.get('/routes', (req: any, res: any) => {
  const day = moment().tz('asia/seoul').format('dddd');
  const isWeekend = day === 'Sunday' || day === 'Saturday';
  const currentTime = moment().tz('asia/seoul');
  console.log(`Weekend stop time: ${WEEKEND_STOP_TIME}`);
  console.log(`Today is ${day} at ${currentTime.format('HH:mm:ss')}, and isWeekend = ${isWeekend}`);
  console.log(`In between? ${currentTime.isBetween(WEEKEND_START_TIME, WEEKEND_STOP_TIME)}`);

  if (isWeekend) {
    if (!currentTime.isBetween(WEEKEND_START_TIME, WEEKEND_STOP_TIME)) {
      blueStatus = `Weekend running hours are 0700-2300`;
      orangeStatus = `Busses are not currently running.`;
    }
    routeLength = busStopLocationData.weekendRoute.stops.length;
    res.json(busStopLocationData.weekendRoute);
  } else {
    if (!currentTime.isBetween(WEEKDAY_START_TIME, WEEKDAY_STOP_TIME)) {
      blueStatus = `Weekday running hours are 0500-2300`;
      orangeStatus = `Busses are not currently running.`;
    }
    routeLength = busStopLocationData.weekdayRoute.stops.length;
    res.json(busStopLocationData.weekdayRoute);
  }
});

// The endpoint for getting the bus stop gps data in a very minimal form.
app.get('/routes_min', (req: any, res: any) => {
  const day = moment().tz('asia/seoul').format('dddd');
  const isWeekend = day === 'Sunday' || day === 'Saturday';
  const currentTime = moment().tz('asia/seoul');
  console.log(`Weekend stop time: ${WEEKEND_STOP_TIME}`);
  console.log(`Today is ${day} at ${currentTime.format('HH:mm:ss')}, and isWeekend = ${isWeekend}`);
  console.log(`In between? ${currentTime.isBetween(WEEKEND_START_TIME, WEEKEND_STOP_TIME)}`);

  if (isWeekend) {
    if (!currentTime.isBetween(WEEKEND_START_TIME, WEEKEND_STOP_TIME)) {
      blueStatus = `Weekend running hours are 0700-2300`;
      orangeStatus = `Busses are not currently running.`;
    }
    routeLength = busStopLocationData.weekendRoute.stops.length;
    res.json(minifyBusRouteInfo(busStopLocationData.weekendRoute));
  } else {
    if (!currentTime.isBetween(WEEKDAY_START_TIME, WEEKDAY_STOP_TIME)) {
      blueStatus = `Weekday running hours are 0500-2300`;
      orangeStatus = `Busses are not currently running.`;
    }
    routeLength = busStopLocationData.weekdayRoute.stops.length;
    res.json(minifyBusRouteInfo(busStopLocationData.weekdayRoute));
  }
});

// the endpoint for the bus to post data to.
// updates the global variables location for each one.
/**
 * Example incoming data
 *
 * {stop: 1, route: "blue", intransit: true, status: ''}
 */
app.post('/pi', (req: any, res: any) => {

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

  console.log(`------ ------ ------`);
  console.log(`Route: ${String(req.body.route)}`)
  console.log(`Location: ${parseInt(req.body.stop)}`);
  console.log(`In Transit: ${JSON.parse(req.body.intransit)}`);
  console.log(`Status: ${req.body.status}`);

  res.sendStatus(200);
});

app.listen(port, () => console.log(`bus GPS server listening on port ${port}!`));

// Check if each bus hasn't been updated after a certain amount of time.
// If it fails to update then, set a status that says it's lost connection with the bus.

function checkTimeout() {
  if (Number(moment()) - Number(blueLastUpdateTimestamp) > TIMEOUT_MS) {
    blueStatus = "Bus is currently running without tracking.";
  }
  if (Number(moment()) - Number(orangeLastUpdateTimestamp) > TIMEOUT_MS) {
    orangeStatus = "Bus is currently running without tracking.";
  }
}

function minifyBusRouteInfo(routes: Route): Route_min {
  let routes_minified: Route_min = {stops: []};
  routes.stops.forEach(stop => {
    routes_minified.stops.push(stop.lat);
    routes_minified.stops.push(stop.lon);
  });
  return routes_minified;
}