# Bus GPS API

This is the server application that will be running as the middle person between the gps units on the the busses and the front end to display the bus locations.

There is no data being persisted in a database, the application just stores the most recent location data for each route in memory.

### The api endpoints are as follows:

`/api` GET will return the following data:
```typescript
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
```

`/pi` POST expects the following data:
```typescript
{
  line: Number,
  loc: Number
}
```
### Keys
```
Blue Line = 1
Orange Line = 2

Location number key:
1 - MAIN GATE
2 - TRANSIT
3 - COMMISSARY
4 - TRANSIT
5 - BLDG 474 (SNCO DORMS)
6 - TRANSIT
7 - BLDG 383 (SFS DORMS)
8 - TRANSIT
9 - BLDG 657 (CE CUST SVC)
10 - TRANSIT
11 - PASSENGER TERMINAL
12 - TRANSIT
13 - DBIDS
14 - TRANSIT
15 - BLDG 936 (MPF/7 AF)
16 - TRANSIT
17 - BX
18 - TRANSIT
19 - IPE
20 - TRANSIT
21 - COMMAND WARRIOR ECP
22 - TRANSIT
23 - BLDG 1601 (GOLF CRSE)
24 - TRANSIT
25 - MUSTANG CENTER
```

