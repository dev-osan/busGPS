const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Global variables for storing locations in memory. Persistance isn't necessary.
var blueLoc = 1;
var orangeLoc = 1;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// redirect home to blue line
app.get('/', (req, res) => res.redirect('/blue'));

app.get('/blue', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/blue.html'));
});

app.get('/orange', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/orange.html'));
});

// the endpoint for the client to update it's bus location
app.get('/api', (req, res) => {
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

// the endpoint for the bus to post data to.
// updates the global variables location for each one.
/**
 * Example incoming data
 * 
 * {line: 1,loc: 5}
 */
app.post('/pi', (req, res) => {

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