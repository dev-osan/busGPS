// This file will hold the logic for making a GET request to the API, parse the returned JSON, and update the screen. There is a blue line and a orange line, each running in opposite directions.

// The fetch function should automatically update every 5 seconds.

// TODO: review the display logic for the blue line, the status message is showing the wrong information for some reason... it may be because I didn't refresh the page after I made the changes.

var stops;

fetch('/routes').then((res) => {
  return res.json()
}).then((data) => {
  stops = data.stops
  buildBusRouteTable(data.stops)
}).catch((err) => {
  //display an error to the user.
  console.log("an error occurred building the page")
  console.error(err);
});

function pad(num) {
  var s = String(num);
  while (s.length < 2) {s = "0" + s;}
  return s;
}

function buildBusRouteTable(stops) {
  
  let scheduleAccumulator = `
    <div class="row table-title">
      <div class="col">
        <h1>Osan AB Bus Schedule</h1>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <a href="https://ice.disa.mil/index.cfm?fa=card&sp=142875">
          <button type="button" class="btn btn-link">Please give us your feedback here!</button>
        </a>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <i class="fas fa-bus blue active"></i> : <span id="blue-status">Loading...</span>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <i class="fas fa-bus orange active"></i> : <span id="orange-status">Loading...</span>
      </div>
    </div>

    <div class="row table-header">
      <div class="col-2"><i style="color: blue;" class="fas fa-arrow-down"></i> # <i style="color: orange;" class="fas fa-arrow-up"></i></div>
      <div class="col-6">STOP LOCATIONS</div>
      <div class="col-2">BLUE TIMES</div>
      <div class="col-2">ORANGE TIMES</div>
    </div>`;
  let index = 1;
  for (let stop of stops) {
    scheduleAccumulator += `
      <div class="row">
      <div class="col-2"><i class="fas fa-bus blue" id="blue-${index}"></i> ${index} <i class="fas fa-bus orange" id="orange-${index}"></i></div>
      <div class="col-6">${stop.name}</div>
      <div class="col-2">:${pad(stop.blue_time)} / :${pad((stop.blue_time + 30) % 60)}</div>
      <div class="col-2">:${pad(stop.orange_time)} / :${pad((stop.orange_time + 30) % 60)}</div>
      </div>`;
    index = index + 1;
  }
  document.getElementById("schedule").innerHTML = scheduleAccumulator;
}



/*

JSON data structure
loc - A number that represents the location of the Bus.
intransit - A boolean describing if the bus is in transit FROM the location.
err - A string with an error message. Empty string or no value if none exist.

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
const UPDATE_INTERVAL_MILLISECONDS = 2000;

window.setInterval(() => {
  fetch(url).then(function(res) {
    return res.json();
  }).then(function(data) {
    deactivateAllBlueIcons();
    deactivateAllOrangeIcons();
    updateBlueBusLocation(data);
    updateOrangeBusLocation(data);
  }).catch(function(err) {
    console.log("Unable to reach server.");
    console.error(err)
    document.getElementById("blue-status").innerText = "Unable to reach server...";
    document.getElementById("orange-status").innerText = "Unable to reach server...";
  });
}, UPDATE_INTERVAL_MILLISECONDS);

function updateBlueBusLocation(data) {

  let blueLocation = data.blue.loc;

  let blueInTransit = data.blue.intransit;

  if (blueLocation < 1 || blueLocation > stops.length) {
    return console.error(`Recieved ${blueLocation} as the Blue Line location.`);
  }

  if (data.blue.err) {
    document.getElementById("blue-status").innerText = data.blue.err;
  } else if (!blueInTransit) {
    document.getElementById(`blue-${blueLocation}`).classList.add('active');
    document.getElementById("blue-status").innerText = `Stopped at #${blueLocation}: ${stops[blueLocation - 1].name}`;
  } else if (blueInTransit) {
    if (blueLocation == stops.length) {
      return console.error(`The blue route is recieving a transit signal from ${stops.length} to ${stops.length + 1}, change to orange line.`);
    }
    document.getElementById(`blue-${blueLocation + 1}`).classList.add('active', 'blink');
    document.getElementById("blue-status").innerText = `In transit to #${blueLocation + 1}: ${stops[blueLocation].name}`;
  }
}

function updateOrangeBusLocation(data) {

  let orangeLocation = data.orange.loc;

  let orangeInTransit = data.orange.intransit;

  if (orangeLocation < 1 || orangeLocation > stops.length) {
    return console.error(`Recieved ${orangeLocation} as the Orange Line location.`);
  }

  if (data.orange.err) {
    document.getElementById("orange-status").innerText = data.orange.err;
  } else if (!orangeInTransit) {
    document.getElementById(`orange-${orangeLocation}`).classList.add('active');
    document.getElementById("orange-status").innerText = `Stopped at #${orangeLocation}: ${stops[orangeLocation - 1].name}`;
  } else if (orangeInTransit) {
    if (orangeLocation == 1) {
      return console.error("The orange route is recieving a transit signal from 1 to 0, change to blue line.");
    }
    document.getElementById(`orange-${orangeLocation - 1}`).classList.add('active', 'blink');
    document.getElementById("orange-status").innerText = `In transit to #${orangeLocation - 1}: ${stops[orangeLocation - 2].name}`;
  }

}

function deactivateAllBlueIcons() {
  for (let i = 1; i <= stops.length; i++) {
    document.getElementById(`blue-${i}`).classList.remove('active');
    document.getElementById(`blue-${i}`).classList.remove('blink');
  }
}

function deactivateAllOrangeIcons() {
  for (let i = 1; i <= stops.length; i++) {
    document.getElementById(`orange-${i}`).classList.remove('active');
    document.getElementById(`orange-${i}`).classList.remove('blink');
  }
}