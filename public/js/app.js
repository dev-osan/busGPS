// This file will hold the logic for making a GET request to the API, parse the returned JSON, and update the screen. There is a blue line and a orange line, each running in opposite directions.

// The fetch function should automatically update every 5 seconds.

// TODO: make a request for the current routes and build the page based on the route that is returned.

// TODO: Add an arrow to the icon to indicate which direction the bus is traveling. It's not obvious.

/*

JSON data structure
loc - A number that represents the location of the Bus.
intransit - A boolean describing if the bus is in transit FROM the location.
err - A string with an error message. Empty string if none exist.

{
  "blue": {
    loc: Number,
    intransit: Boolean,
    err?: String
  },
  "orange": {
    loc: Number,
    intransit: Boolean,
    err?: String
  }
}

*/

const url = `/api`;

window.setInterval(() => {
  fetch(url).then(function(res) {
    return res.json();
  }).then(function(data) {
    deactivateAllBlueIcons();
    deactivateAllOrangeIcons();
    updateBusLocations(data);
  }).catch(function() {
    console.log("Unable to reach server.");
    document.getElementById("blue-status").innerText = "Unable to reach server...";
    document.getElementById("orange-status").innerText = "Unable to reach server...";
  });
}, 5000);

function updateBusLocations(data) {

  let blueLocation = data.blue.loc;
  let orangeLocation = data.orange.loc;

  let blueInTransit = data.blue.intransit;
  let orangeInTransit = data.orange.intransit;

  if (data.blue.err) {
    document.getElementById("blue-status").innerText = data.blue.err;
  } else if (!blueInTransit) {
    document.getElementById(`blue-${blueLocation}`).classList.add('active');
    document.getElementById("blue-status").innerText = `Stopped at #${blueLocation}`;
  } else if (blueInTransit) {
    document.getElementById(`blue-${blueLocation + 1}`).classList.add('active', 'blink');
    document.getElementById("blue-status").innerText = `In transit to #${blueLocation + 1}`;
  }

  if (data.orange.err) {
    document.getElementById("orange-status").innerText = data.orange.err;
  } else if (!orangeInTransit) {
    document.getElementById(`orange-${orangeLocation}`).classList.add('active');
    document.getElementById("orange-status").innerText = `Stopped at #${orangeLocation}`;
  } else {
    document.getElementById(`orange-${orangeLocation - 1}`).classList.add('active', 'blink');
    document.getElementById("orange-status").innerText = `In transit to #${orangeLocation - 1}`;
  }

}

function deactivateAllBlueIcons() {
  for (let i = 1; i <= 13; i++) {
    document.getElementById(`blue-${i}`).classList.remove('active');
    document.getElementById(`blue-${i}`).classList.remove('blink');
  }
}

function deactivateAllOrangeIcons() {
  for (let i = 1; i <= 13; i++) {
    document.getElementById(`orange-${i}`).classList.remove('active');
    document.getElementById(`orange-${i}`).classList.remove('blink');
  }
}