# TODO: implement catching wifi connectivity outage and reboot pi. Use a counter or something so it doesn't reboot after only one lost packet.

from geopy.distance import geodesic
import gps
import json
import os
import requests
import time
session = gps.gps("127.0.0.1", "2947") 
session.stream(gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)

NUMBER_OF_DATA_POINTS_PER_GPS_READ = 3
GEOFENCE_RADIUS_METERS = 40
ALLOWABLE_NUMBER_OF_DROPPED_PACKETS = 15 # If this many packets are dropped in a row, reboot.

# important urls
LOC_URL = "https://busgps.herokuapp.com/pi"
ROUTE_URL = "https://busgps.herokuapp.com/routes"
LOCATION_OF_BUSSES = "https://busgps.herokuapp.com/api"

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

lostConnectionCounter = 0


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
    
    # Make a case utilizing the previous and next stop flags
    if previousStop == None or nextStop == None:
        return
    
    currentRoute = "blue" if previousStop < nextStop else "orange"
    
    # Handles the ends of the routes. The bus changes it's route after both busses arrive at the last stop. Pull down the position of the other bus to find out where it's at.
    # If I'm at the end of my route, hold my current route until the other bus arrives at the end of it's route then change routes.
    if currentStop == 1 or currentStop == len(stops):
        busLocations = requests.get(LOCATION_OF_BUSSES)
        busLocations = busLocations.json()
        blueLocation = busLocations["blue"]["loc"]
        orangeLocation = busLocations["orange"]["loc"]
        if currentRoute == "blue" and orangeLocation == 1:
            currentRoute = "orange"
        elif currentRoute == "orange" and blueLocation == len(stops):
            currentRoute = "blue"
        return
    
    # Old end of route handler. Is supposed to change routes after leaving the last route.
    # if currentRoute == "blue" and currentStop == len(stops) and inTransit == True:
    #     currentRoute = "orange"
    #     return
    # elif currentRoute == "orange" and currentStop == 1 and inTransit == True:
    #     currentRoute = "blue"
    #     return





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




lastStatusSent = None
def sendBusLocation():
    
    def send(status = ""):
        global lastStatusSent
        if status != "":
            if status == lastStatusSent:
                return
            lastStatusSent = status
            print("Status: " + status)
            
        res = requests.post(LOC_URL, json={"route": currentRoute, "stop": currentStop, "intransit": inTransit, "status": status})
        testConnection(res)

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





def testConnection(res):
    global lostConnectionCounter
    if not res:
        lostConnectionCounter += 1
        if lostConnectionCounter == ALLOWABLE_NUMBER_OF_DROPPED_PACKETS:
            os.system("sudo reboot") # Reboot pi
        return

    lostConnectionCounter = 0





def main():
    while True:
        try:
            setLatLon()
            setCurrentStop()
            setInTransit()
            sendBusLocation()
            setCurrentRoute()


        except KeyError:
            pass
        except KeyboardInterrupt:
            quit()
        except StopIteration:
            session = None
            print("No incoming data from the GPS module")




print("Starting busGPS program.")
main()