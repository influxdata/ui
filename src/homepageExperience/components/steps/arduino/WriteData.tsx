// Libraries
import React from 'react'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const WriteData = () => {
  const codeSnippetOne = `void setup() {
    // ... code in setup() from Initialize Client
   
    // Add tags to the data point
    sensor.addTag("device", DEVICE);
    sensor.addTag("SSID", WiFi.SSID());
   }`

  const codeSnippetTwo = `void loop() {
    // Clear fields for reusing the point. Tags will remain the same as set above.
    sensor.clearFields();
  
    // Store measured value into point
    // Report RSSI of currently connected network
    sensor.addField("rssi", WiFi.RSSI());
  
    // Print what are we exactly writing
    Serial.print("Writing: ");
    Serial.println(sensor.toLineProtocol());
  
    // Check WiFi connection and reconnect if needed
    if (wifiMulti.run() != WL_CONNECTED) {
      Serial.println("Wifi connection lost");
    }
  
    // Write point
    if (!client.writePoint(sensor)) {
      Serial.print("InfluxDB write failed: ");
      Serial.println(client.getLastErrorMessage());
    }
  
    Serial.println("Waiting 1 second");
    delay(1000);
    }`

  // Events log handling
  const logCopyCodeSnippet = () => {
    event(`firstMile.arduinoWizard.buckets.code.copied`) // edit
  }

  return (
    <>
      <h1>Write Data</h1>
      <p className="small-margins">
        Append the lines of code to add tags to the Point, the end of void
        setup() function like:
      </p>
      <CodeSnippet
        text={codeSnippetOne}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p>
        Add the following{' '}
        <code className="homepage-wizard--code-highlight">loop()</code> code
        snippet to your sketch
      </p>
      <CodeSnippet
        text={codeSnippetTwo}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p>
        In the above code snippet, we retrive the RSSI (Received Signal Strength
        Indicator) of your wifi connection and write it to InfluxDB using the
        client.
      </p>
    </>
  )
}
