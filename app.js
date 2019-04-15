const express = require('express');
const app = express();
const port = 3000;

// serve the front end
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.send("Hello World")
});

app.listen(port, () => console.log(`bus GPS listening on port ${port}!`));