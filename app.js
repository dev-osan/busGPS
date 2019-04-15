const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

// redirect home to blue line
app.get('/', (req, res) => res.redirect('/blue'));

app.get('/blue', (req, res) => {
  res.send('Hello from the blue line.');
});

app.get('/orange', (req, res) => {
  res.send('Hello from the orange line.');
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
app.post('/pi', (req, res) => {
  res.send(`this path receives data from the buses.`);
});

app.listen(port, () => console.log(`bus GPS listening on port ${port}!`));