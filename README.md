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
