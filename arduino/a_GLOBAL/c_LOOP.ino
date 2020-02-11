void loop() {

  if (numberOfFailedLoops == numberOfFailableLoops) {
    Serial.println(F("Restarting the hat (FONA)..."));
    numberOfFailedLoops = 0;
    fona.setFunctionality(6); // restart the hat
    delay(10000); // 10 second delay to let it restart fully
    setup_hat();
  }

  if (numberOfStops == 0) {
    getRoutes();
    numberOfFailedLoops++;
    return;
  }

  float lat, lon;
  getGPSLocation(lat, lon);
  Serial.println(lat, 8);
  Serial.println(lon, 8);

  int distance;
  int nearestStopIndex = getNearestStop(lat, lon, distance);
  bool inTransit;
  if (distance < geofenceRadius) {
    inTransit = false;
    currentStop = nearestStopIndex;
  } else {
    inTransit = true;
  }

  if (lat == 0 || lon == 0) {
    numberOfFailedLoops++;
    return;
  }

  Serial.print(F("Device ID: ")); Serial.println(deviceId);
  Serial.print(F("Current Stop: ")); Serial.println(currentStop + 1);
  Serial.print(F("Nearest Stop: ")); Serial.println(nearestStopIndex + 1);
  Serial.print(F("Distance to stop: ")); Serial.println(distance);
  Serial.print(F("In transit? ")); Serial.println(inTransit ? "true" : "false");

  if (currentStop == -1) {
    return;
  }
  char URL[75];
  sprintf(URL, "busgps.herokuapp.com/updateLocation?id=%s&inTransit=%s&loc=%d", deviceId, inTransit ? "true" : "false", currentStop + 1);
  if (!fona.postData("GET", URL, serverResponse)) {
    numberOfFailedLoops++;
    return;
  }
//  delay(5000);
  numberOfFailedLoops = 0;
}
