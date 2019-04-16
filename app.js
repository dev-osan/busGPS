const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Global variables for storing locations in memory. Persistance isn't necessary.
var blueLoc = 1;
var orangeLoc = 1;

app.use(express.static('public'));

// redirect home to blue line
app.get('/', (req, res) => res.redirect('/blue'));

app.get('/blue', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/blue.html'));
});

app.get('/orange', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/orange.html'));
});

// the endpoint for the client to update it's bus location
// currently with test data
app.get('/api', (req, res) => {
  const testData = {
    1: {
      loc:1
    },
    2: {
      loc:14
    }
  };
  
  res.json(testData);
});

// the endpoint for the bus to post data to.
// updates the global variables location for each one.
app.post('/pi', (req, res) => {
  res.send(`this path receives data from the buses.`);
});

app.listen(port, () => console.log(`bus GPS listening on port ${port}!`));