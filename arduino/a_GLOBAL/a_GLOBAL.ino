#include <Adafruit_FONA.h>
#include <SoftwareSerial.h>

// Define global values for the hat.
#define FONA_PWRKEY 6
#define FONA_RST 7
#define FONA_TX 10
#define FONA_RX 11

SoftwareSerial ss = SoftwareSerial(FONA_TX, FONA_RX);
SoftwareSerial *fonaSerial = &ss;

Adafruit_FONA_LTE fona = Adafruit_FONA_LTE();

// Define global values for utilities
String serverResponse;
int numberOfStops;
int currentStop = -1;
int numberOfFailableLoops = 25;
int numberOfFailedLoops = 0;

int geofenceRadius = 40; //meters
char deviceId[21];
