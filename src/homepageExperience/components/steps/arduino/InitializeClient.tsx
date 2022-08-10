// Libraries
import React from 'react'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const InitializeClient = () => {

  const codeSnippet = `#if defined(ESP32)
  #include <WiFiMulti.h>
  WiFiMulti wifiMulti;
  #define DEVICE "ESP32"
  #elif defined(ESP8266)
  #include <ESP8266WiFiMulti.h>
  ESP8266WiFiMulti wifiMulti;
  #define DEVICE "ESP8266"
  #endif
  
  #include <InfluxDbClient.h>
  #include <InfluxDbCloud.h>
  
  // WiFi AP SSID
  #define WIFI_SSID "YOUR_WIFI_SSID"
  // WiFi password
  #define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
  
  #define INFLUXDB_URL "https://stag-us-east-1-4.aws.cloud2.influxdata.com"
  #define INFLUXDB_TOKEN "mJC2rCuKlDi4T1pjG-JysYsbTSUJ7mrmck9TlpMrNYbUWzhG7CO23_wDiRFcwrLaFjBc1fHVVNhEK1AMc1BbCA=="
  #define INFLUXDB_ORG "schitlange@influxdata.com"
  #define INFLUXDB_BUCKET "apis"
  
  // Time zone info
  #define TZ_INFO "UTC−07:00"
  
  // Declare InfluxDB client instance with preconfigured InfluxCloud certificate
  InfluxDBClient client(INFLUXDB_URL, INFLUXDB_ORG, INFLUXDB_BUCKET, INFLUXDB_TOKEN, InfluxDbCloud2CACert);
  
  // Declare Data point
  Point sensor("wifi_status");
  
  void setup() {
    Serial.begin(115200);
  
    // Setup wifi
    WiFi.mode(WIFI_STA);
    wifiMulti.addAP(WIFI_SSID, WIFI_PASSWORD);
  
    Serial.print("Connecting to wifi");
    while (wifiMulti.run() != WL_CONNECTED) {
      Serial.print(".");
      delay(100);
    }
    Serial.println();
  
    // Accurate time is necessary for certificate validation and writing in batches
    // We use the NTP servers in your area as provided by: https://www.pool.ntp.org/zone/
    // Syncing progress and the time will be printed to Serial.
    timeSync(TZ_INFO, "pool.ntp.org", "time.nis.gov");
  
  
    // Check server connection
    if (client.validateConnection()) {
      Serial.print("Connected to InfluxDB: ");
      Serial.println(client.getServerUrl());
    } else {
      Serial.print("InfluxDB connection failed: ");
      Serial.println(client.getLastErrorMessage());
    }
  }`

  // Events log handling
  const logCopyCodeSnippet = () => {
    event(`firstMile.arduinoWizard.buckets.code.copied`) // edit
  }

  return (
    <>
      <h1>Initialize Client</h1>
      <p className="small-margins">
        Paste the following snippet into a blank Arduino sketch file.
      </p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p style={{fontSize: '14px', marginTop: '8px', marginBottom: '48px'}}>
        Note: you will need to set the WIFI_SSID and WIFI_PASSWORD variables to 
        the correct values for your wifi router.
      </p>
    </>
  )
}
