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

  if (data.blue.err) {
    document.getElementById("blue-status").innerText = data.blue.err;
  } else if (blueLocation % 2 != 0) {
    document.getElementById(`blue-${blueLocation}`).classList.add('active');
    document.getElementById("blue-status").innerText = `Stopped at #${Math.round(blueLocation / 2)}`;
  } else {
    document.getElementById(`blue-${blueLocation + 1}`).classList.add('active', 'blink');
    document.getElementById("blue-status").innerText = `In transit to #${Math.round(blueLocation / 2) + 1}`;
  }

  if (data.orange.err) {
    document.getElementById("orange-status").innerText = data.orange.err;
  } else if (orangeLocation % 2 != 0) {
    document.getElementById(`orange-${orangeLocation}`).classList.add('active');
    document.getElementById("orange-status").innerText = `Stopped at #${Math.round(orangeLocation / 2)}`;
  } else {
    document.getElementById(`orange-${orangeLocation - 1}`).classList.add('active', 'blink');
    document.getElementById("orange-status").innerText = `In transit to #${Math.round(orangeLocation / 2)}`;
  }

}

function deactivateAllBlueIcons() {
  for (let i = 1; i <= 25; i += 2) {
    document.getElementById(`blue-${i}`).classList.remove('active');
    document.getElementById(`blue-${i}`).classList.remove('blink');
  }
}

function deactivateAllOrangeIcons() {
  for (let i = 1; i <= 25; i += 2) {
    document.getElementById(`orange-${i}`).classList.remove('active');
    document.getElementById(`orange-${i}`).classList.remove('blink');
  }
}