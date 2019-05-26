import express from 'express';
import path from 'path';

import * as busStopLocationData from './routes';

const app = express();
const port = process.env.PORT || 3000;

// Global variables for storing locations in memory. Persistance isn't necessary.
var blueLoc = 1;
var orangeLoc = 1;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// redirect home to blue line
app.get('/', (req: any, res: any) => {
  res.sendFile(path.join(__dirname + '/views/index.html'));
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
  res.json(busStopLocationData.routes);
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
