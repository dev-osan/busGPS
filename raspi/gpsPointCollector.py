import gps
import time
session = gps.gps("127.0.0.1", "2947") 
session.stream(gps.WATCH_ENABLE | gps.WATCH_NEWSTYLE)



NUMBER_OF_DATA_POINTS_PER_GPS_READ = 60
lat = None
lon = None




def getLatLon():
    global session
    lat_accumulator = []
    lon_accumulator = []
    i = 1
    print("Getting data...")
    while i <= NUMBER_OF_DATA_POINTS_PER_GPS_READ:
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

    print("Latitude: " + str(lat))
    print("Longitude: " + str(lon))




getLatLon()
print("Completed.")