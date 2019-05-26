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

let blueLoc = 1;
let orangeLoc = 1;

const url = `/api`;

window.setInterval(() => {
  fetch(url).then(function(res) {
    return res.json();
  }).then(function(data) {
    updateBlue(data.blue);
    updateOrange(data.orange);
  }).catch(function() {
    console.log("Unable to reach server.");
    document.getElementById("blue-status").innerText = "Out of service.";
    document.getElementById("orange-status").innerText = "Out of service.";
  });
}, 5000);

function updateBlue(data) {
  console.log(`Blue line: ${data.loc}`)
  if (data.loc % 2 != 0) {
    document.getElementById("blue-status").innerText = `The blue bus is at stop #${Math.round(data.loc / 2)}`;
    document.getElementById(data.loc).innerHTML = ` <i class="fas fa-bus blue"></i>`;
  } else {
    document.getElementById("blue-status").innerText = `The blue bus is in transit to #${Math.round(data.loc / 2) + 1}`;
    document.getElementById(data.loc + 1).innerHTML = ` <i class="fas fa-bus blue blink"></i>`;
  }
}

function updateOrange(data) {
  if (data.loc % 2 != 0) {
    document.getElementById("orange-status").innerText = `The orange bus is at stop #${Math.round(data.loc / 2)}`;
    document.getElementById(data.loc).innerHTML = ` <i class="fas fa-bus orange"></i>`;
  } else {
    document.getElementById("orange-status").innerText = `The orange bus is in transit to #${Math.round(data.loc / 2)}`;
    document.getElementById(data.loc - 1).innerHTML = ` <i class="fas fa-bus orange blink"></i>`;
  }
}