// Get the current bus routes from the server.
void getRoutes() {

  if (!fona.postData("GET", "busgps.herokuapp.com/routes_min", serverResponse)) {
    Serial.println(F("Failed to complete HTTP GET..."));
    turnOnGPRS();
    return;
  }

  int ob = serverResponse.indexOf("[");
  int cb = serverResponse.indexOf("]");
  if (ob == -1 || cb == -1) {
    Serial.print(F("Bad server response: "));
    Serial.println(serverResponse);
    return 0;
  }
  int size = 1;
  unsigned int i = ob;
  while (i < cb) {
    if (serverResponse.charAt(i) == ',') {
      size++;
    }
    i++;
  }

  numberOfStops = size / 2;
}

// Returns the index of the nearest stop.
int getNearestStop(float lat, float lon, int &distance) {
  int stopIndex = 0;
  int ob = serverResponse.indexOf("[");
  int cb = serverResponse.indexOf("]");
  double coords[numberOfStops * 2];
  int coords_index = 0;

  int i = ob;
  while (i < cb) {
    if (serverResponse.charAt(i) == ',' || i == ob) {
      i++;
      int begin_index = i;
      while (serverResponse.charAt(i) != ',' && i < cb) {
        i++;
      }
      coords[coords_index] = serverResponse.substring(begin_index, i).toDouble();
      coords_index++;
    } else {
      i++;
    }
  }

  for (int i = 0; i < numberOfStops * 2; i += 2) {
    int d = distanceBetween(lat, lon, coords[i], coords[i + 1]);
    if (i == 0) {
      distance = d;
      continue;
    }
    if (d < distance) {
      distance = d;
      stopIndex = i / 2;
    }
  }
  return stopIndex;
}


// This function courtesy of TinyGPS++ open source sketch.
double distanceBetween(double lat1, double long1, double lat2, double long2) {
  // returns distance in meters between two positions, both specified
  // as signed decimal-degrees latitude and longitude. Uses great-circle
  // distance computation for hypothetical sphere of radius 6372795 meters.
  // Because Earth is no exact sphere, rounding errors may be up to 0.5%.
  // Courtesy of Maarten Lamers
  double delta = radians(long1 - long2);
  double sdlong = sin(delta);
  double cdlong = cos(delta);
  lat1 = radians(lat1);
  lat2 = radians(lat2);
  double slat1 = sin(lat1);
  double clat1 = cos(lat1);
  double slat2 = sin(lat2);
  double clat2 = cos(lat2);
  delta = (clat1 * slat2) - (slat1 * clat2 * cdlong);
  delta = sq(delta);
  delta += sq(clat2 * sdlong);
  delta = sqrt(delta);
  double denom = (slat1 * slat2) + (clat1 * clat2 * cdlong);
  delta = atan2(delta, denom);
  return delta * 6372795;
}
