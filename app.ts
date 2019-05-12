import express from 'express';
import path from 'path';

// const express = require('express');
// const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Global variables for storing locations in memory. Persistance isn't necessary.
var blueLoc = 1;
var orangeLoc = 1;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// redirect home to blue line
app.get('/', (req: any, res: any) => res.redirect('/blue'));

app.get('/blue', (req: any, res: any) => {
  res.sendFile(path.join(__dirname + '/views/blue.html'));
});

app.get('/orange', (req: any, res: any) => {
  res.sendFile(path.join(__dirname + '/views/orange.html'));
});

// the endpoint for the client to update it's bus location
app.get('/api', (req: any, res: any) => {
  const locationData = {
    1: {
      loc: blueLoc
    },
    2: {
      loc: orangeLoc
    }
  };

  res.json(locationData);
});

// The endpoint for getting the bus stop gps data.
app.get('/routes', (req: any, res: any) => {
  res.json(busStopLocationData);
});

// the endpoint for the bus to post data to.
// updates the global variables location for each one.
/**
 * Example incoming data
 *
 * {line: 1,loc: 5}
 */
app.post('/pi', (req: any, res: any) => {
  switch (parseInt(req.body.line)) {
    case 1:
      blueLoc = parseInt(req.body.loc);
      break;
    case 2:
      orangeLoc = parseInt(req.body.loc);
  }

  res.sendStatus(200);
});

app.listen(port, () => console.log(`bus GPS listening on port ${port}!`));

// The location data for each stop.
const busStopLocationData = {
  'Orange Route': [
    ['Mustang Center', 37.08081000000001, 127.02802666666668],
    ['Bldg 1601 ECP (Golf Course)', 37.082617, 127.02308299999997],
    ['Commando Warrior ECP', 37.08593625, 127.02627625000001],
    ['IPE', 37.08489, 127.03301999999998],
    ['BX', 37.08386375, 127.03390250000001],
    ['Bldg 936 (MPF/7AF)', 37.08144333333333, 127.03573111111112],
    ['DBIDS', 37.08249333333334, 127.03905222222222],
    ['Passenger Terminal', 37.08686222222222, 127.03648333333336],
    ['Bldg 667 (CE Customer Service)', 37.08597, 127.03798000000003],
    ['Bldg 383 (SFS Dorms)', 37.08466777777778, 127.04041555555558],
    ['Bldg 474 (SNCO Dorms)', 37.083195555555555, 127.04271555555556],
    ['Commissary', 37.07875444444445, 127.04181222222223],
    ['Main Gate', 37.08054333333334, 127.04833]
  ],
  'Blue Route': [
    ['Main Gate', 37.08054333333334, 127.04833],
    ['Commissary', 37.07875444444445, 127.04181222222223],
    ['Bldg 474 (SNCO Dorms)', 37.083195555555555, 127.04271555555556],
    ['Bldg 383 (SFS Dorms)', 37.08466777777778, 127.04041555555558],
    ['Bldg 667 (CE Customer Service)', 37.08597, 127.03798000000003],
    ['Passenger Terminal', 37.08686222222222, 127.03648333333336],
    ['DBIDS', 37.08249333333334, 127.03905222222222],
    ['Bldg 936 (MPF/7AF)', 37.08144333333333, 127.03573111111112],
    ['BX', 37.08386375, 127.03390250000001],
    ['IPE', 37.08489, 127.03301999999998],
    ['Commando Warrior ECP', 37.08593625, 127.02627625000001],
    ['Bldg 1601 ECP (Golf Course)', 37.082617, 127.02308299999997],
    ['Mustang Center', 37.08081000000001, 127.02802666666668]
  ]
};
