void setup_hat() {
  pinMode(FONA_RST, OUTPUT);
  digitalWrite(FONA_RST, HIGH);
  pinMode(FONA_PWRKEY, OUTPUT);
  powerOn();
  ss.begin(115200); // Default SIM7000 shield baud rate
  Serial.println(F("Configuring to 9600 baud"));
  ss.println("AT+IPR=9600"); // Set baud rate
  delay(100); // Short pause to let the command run
  ss.begin(9600);
  if (! fona.begin(ss)) {
    Serial.println(F("Couldn't find FONA"));
    while (1); // Don't proceed if it couldn't find the device
  }
  fona.setFunctionality(1);
  fona.setNetworkSettings(F("hologram"));
  turnOnGPS();
  delay(5000);
  turnOnGPRS();
}

// Power on the module
void powerOn() {
  digitalWrite(FONA_PWRKEY, LOW);
  delay(100);
  digitalWrite(FONA_PWRKEY, HIGH);
}

void turnOnGPS() {
  Serial.println(F("Attempting to start GPS...  "));
  fona.enableGPS(false);
  delay(500);
  if (!fona.enableGPS(true)) {
    Serial.println(F("Failed to turn on GPS"));
  } else {
    Serial.println(F("GPS turned on successfully"));
  }
}

void turnOnGPRS() {
  Serial.println(F("Attempting to start GPRS..."));
  fona.enableGPRS(false);
  delay(500);
  if (!fona.enableGPRS(true)) {
    Serial.println(F("Failed to turn on GPRS for data connection."));
  } else {
    Serial.println(F("GPRS turned on successfully. Begin using data."));
  }
}

void getGPSLocation(float &lat, float &lon) {
  float latBuff = 0, lonBuff = 0;
  int numOfReads = 5;
  for (int i = 0; i < numOfReads; i++) {
    float latitude, longitude, speed_kph, heading, altitude;
    if (!fona.getGPS(&latitude, &longitude, &speed_kph, &heading, &altitude)) {
      Serial.println(F("Unreadable GPS Signal"));
      latBuff = 0;
      lonBuff = 0;
    } else {
      latBuff += latitude;
      lonBuff += longitude;
    }
  }
  lat = latBuff / (float)numOfReads;
  lon = lonBuff / (float)numOfReads;
}
