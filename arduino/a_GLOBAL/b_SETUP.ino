void setup() {
  Serial.begin(9600);
  setup_hat();
  getRoutes();
  fona.getSIMCCID(deviceId);
}
