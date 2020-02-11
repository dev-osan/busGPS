# Bus GPS API

This is the server application that will be running as the middle person between the gps units on the the busses and the front end to display the bus locations.

There is no data being persisted in a database, the application just stores the most recent location data for each route in memory. Anything older than 60 seconds is outdated data anyway.

### The api endpoints are as follows:

`/api` GET will return the following data:
```typescript
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
```

`/pi` POST expects the following data:
```typescript
{
  route: String, // "blue" or "orange"
  stop: Number,
  intransit: Boolean
  status: String //send empty string if everything is okay
}
```

`/routes` GET will return a list of all stops on the bus route in order.
```typescript
{
  "stops": [
    name: String,
    lat: Number,
    lon: Number,
    blue_time: Number,
    orange_time: Number
  ]
}
```

`/routes_min` GET will return a list of all gps coords for stops on the bus route in order.
This is a minified version, so the array will still be in order but just in the form: [lat, lon, lat, lon, ...].
The first set of lat/lon belong to stop one, the next - stop two, and so on. The Arduino has a limited amount of memory to store responses, so it's best to keep it under 500 characters total.
```typescript
{
  "stops": Number[]
}
```

`/updateLocation?id=STRING&loc=NUMBER&inTransit=BOOLEAN` GET will update the current location of the id supplied using the params in the url query.
```typescript
// Returns HTTP Status 200 if OK.
```

### Building a new Arduino Tracker

**Hardware**
- Arduino UNO
- Botletics SIM7000G
- Hologram SIM card
- Adafruit USB to 2.1mm DC Booster Cable - 9V

Solder everything together, make the connections, and power it up!

**Software**
Located in the Arduino folder in this project.
- Follow the README instructions in the arduino folder of this project. That's how you'll prep the device to recieve the software. https://github.com/dev-osan/busGPS/tree/master/arduino

**Case**
The case is 3d printed, contact William Duncan or myself (repo owner) for more information or just make your own. It was quite fun!

**Guides**
These are some of the guides that helped me get it running.
https://www.hackster.io/botletics/real-time-2g-3g-lte-arduino-gps-tracker-iot-dashboard-01d471
https://www.youtube.com/watch?v=l3He0RGahN4
https://github.com/botletics/SIM7000-LTE-Shield
https://community.botletics.com/

Memory Management on Arduino
https://learn.adafruit.com/memories-of-an-arduino/optimizing-sram

Reach out for more information. This project was built for tracking busses on Osan Air Base, ROK. Contact the 51 LRS there, they should have a continuity binder for more information.
