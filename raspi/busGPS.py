from geopy.distance import geodesic
import gps
import json
import os
import requests
import time
session = gps.gps("127.0.0.1", "2947") 
session.stream(gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)

NUMBER_OF_DATA_POINTS_PER_GPS_READ = 5
GEOFENCE_RADIUS_METERS = 50

# important urls
LOC_URL = "https://busgps.herokuapp.com/pi"
ROUTE_URL = "https://busgps.herokuapp.com/routes"

# get routes
routes = requests.get(ROUTE_URL)
routes = routes.json()
stops = routes["stops"]

currentRoute = None
currentStop = None
nextStop = None
previousStop = None
inTransit = None

lat = None
lon = None




def setLatLon():
    global session
    lat_accumulator = []
    lon_accumulator = []
    i = 1
    print("Getting data"),
    while i <= NUMBER_OF_DATA_POINTS_PER_GPS_READ:
        print("."),
        raw_data = session.next()
        if raw_data['class'] == 'TPV':
            if hasattr(raw_data, 'lat') and hasattr(raw_data,'lon'):
                lat_accumulator.append(raw_data.lat)
                lon_accumulator.append(raw_data.lon)
                i += 1

    global lat, lon

    sum = 0
    for point in lat_accumulator:
        sum += point
    lat = sum / NUMBER_OF_DATA_POINTS_PER_GPS_READ

    sum = 0
    for point in lon_accumulator:
        sum += point
    lon = sum / NUMBER_OF_DATA_POINTS_PER_GPS_READ

    print("I am at: " + str(lat) + ", " + str(lon))





def setCurrentStop():
    if lat == None or lon == None:
        return
    
    distances = getDistances()
    
    global currentStop
    if min(distances) <= GEOFENCE_RADIUS_METERS:
        currentStop = distances.index(min(distances)) + 1
        setPreviousAndNextStops()





def getDistances():
    distances = []
    for stop in routes["stops"]:
        stop_coord = (stop["lat"], stop["lon"])
        now_coord = (lat, lon)
        distance = round(geodesic(now_coord, stop_coord).km * 1000)
        distances.append(distance)
    return distances





def setCurrentRoute():
    if currentStop == None:
        return

    global currentRoute

    if currentRoute == None:
        if currentStop <= len(stops) / 2:
            currentRoute = "blue"
        else:
            currentRoute = "orange"
        return
    
    # Handles the ends of the routes. The bus changes it's route after leaving the the turn-around stop.
    if currentRoute == "blue" and currentStop == len(stops) and inTransit == True:
        currentRoute = "orange"
        return
    elif currentRoute == "orange" and currentStop == 1 and inTransit == True:
        currentRoute = "blue"
        return
    
    # Make a case utilizing the previous and next stop flags
    if previousStop == None or nextStop == None:
        return
    
    currentRoute = "blue" if previousStop < nextStop else "orange"





def setInTransit():
    if lat == None or lon == None:
        return
    
    distances = getDistances()

    global inTransit
    inTransit = min(distances) > GEOFENCE_RADIUS_METERS




def setPreviousAndNextStops():
    if currentStop == None or currentRoute == None:
        return

    global previousStop, nextStop

    # Handle starting condition
    if previousStop == None or nextStop == None:
        if currentRoute == "blue":
            previousStop = currentStop - 1
            nextStop = currentStop + 1
        else:
            previousStop = currentStop + 1
            nextStop = currentStop - 1
        return
    
    # Check current stop against prev and next stops
    if currentStop == previousStop:
        if currentRoute == "blue":
            previousStop = currentStop + 1
            nextStop = currentStop - 1
        else:
            previousStop = currentStop - 1
            nextStop = currentStop + 1
    else:
        if currentRoute == "orange":
            previousStop = currentStop + 1
            nextStop = currentStop - 1
        else:
            previousStop = currentStop - 1
            nextStop = currentStop + 1





def sendBusLocation():

    def send(status = ""):
        if status != "":
            print("Status: " + status)

        requests.post(LOC_URL, json={"route": currentRoute, "stop": currentStop, "intransit": inTransit, "status": status})


    if lat == None or lon == None:
        send("Waiting for GPS signal... standby")
        return
    
    if currentStop == None or currentRoute == None:
        send("Orienting bus to route... standby")
        return
    
    send()

    print("Current Stop: " + str(currentStop)),
    print("\tCurrent Route: " + str(currentRoute)),
    print("\tIn Transit: " + str(inTransit)),
    print("\tPrevious Stop: " + str(previousStop)),
    print("\tNext Stop: " + str(nextStop))




def main():
    while True:
        try:
            setLatLon()
            setCurrentStop()
            setCurrentRoute()
            setInTransit()
            sendBusLocation()


        except KeyError:
            pass
        except KeyboardInterrupt:
            quit()
        except StopIteration:
            session = None
            print("No incoming data from the GPS module")




print("Starting busGPS program.")
main()