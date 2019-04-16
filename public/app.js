// This file will hold the logic for making a GET request to the API, parse the returned JSON, and update the screen. There is a blue line and a orange line, each running in opposite directions.

// The fetch function should automatically update every 10 seconds.



/*

JSON data structure
1 - Blue Line
2 - Orange Line
loc - A number that represents the location of the Bus.
err - A string with an error message. Empty string if none exist.

{
  1: {
    loc: Number,
    err: String
  },
  2: {
    loc: Number,
    err: String
  }
}

*/


const url = `/api`

fetch(url).then(function(res) {
  return res.json();
}).then(function(data) {
  console.log(data);
}).catch(function() {
  console.log("Booo");
});