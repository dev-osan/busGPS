// This file will hold the logic for making a GET request to the API, parse the returned JSON, and update the screen. There is a blue line and a orange line, each running in opposite directions.

/*

JSON data structure
1 - Blue Line
2 - Orange Line
loc - A number that represents the location of the Bus.

{
  1: {
    loc: Number,
    error: String
  },
  2: {
    loc: Number,
    error: String
  }
}

*/


const url = `/`

fetch(url).then(function(res) {
  return res.json();
}).then(function(data) {
  console.log(data);
}).catch(function() {
  console.log("Booo");
});