import express from 'express';
import path from 'path';
import moment = require('moment');

import * as busStopLocationData from './routes';

const app = express();
const port = process.env.PORT || 3000;
const TIMEOUT_MS = 10 * 60 * 1000;

// Global variables for storing locations in memory. Persistance isn't necessary.
var blueLoc = 1;
var orangeLoc = 1;
var blueStatus = 'No GPS tracking available at the moment.';
var orangeStatus = 'No GPS tracking available at the moment.';
var blueInTransit = false
var orangeInTransit = false
var blueLastUpdateTimestamp = moment();
var orangeLastUpdateTimestamp = moment();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req: any, res: any) => {
  res.sendFile(path.join(__dirname + '/views/index.html'));
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
  
  res.json(locationData);
});

// The endpoint for getting the bus stop gps data.
app.get('/routes', (req: any, res: any) => {
  res.json(busStopLocationData.routes);
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

// TODO: check if each bus hasn't been updated after a certain amount of time.
// If it fails to update then, set a status that says it's lost connection with the bus.

function checkTimeout() {
  if (Number(moment()) - Number(blueLastUpdateTimestamp) > TIMEOUT_MS) {
    blueStatus = "Bus has lost connection."
  }
  if (Number(moment()) - Number(orangeLastUpdateTimestamp) > TIMEOUT_MS) {
    orangeStatus = "Bus has lost connection."
  }
}