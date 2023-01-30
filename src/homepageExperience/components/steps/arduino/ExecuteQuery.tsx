// Libraries
import React, {useEffect} from 'react'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {DEFAULT_BUCKET} from 'src/writeData/components/WriteDataDetailsContext'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {keyboardCopyTriggered, userSelection} from 'src/utils/crossPlatform'

const logCopyCodeSnippet = () => {
  event('firstMile.arduinoWizard.executeQuery.code.copied')
}

type OwnProps = {
  bucket: string
}

export const ExecuteQuery = (props: OwnProps) => {
  const {bucket} = props
  const bucketName = bucket === DEFAULT_BUCKET ? 'sample-bucket' : bucket

  const codeSnippet = `void loop() {
    // ... code from Write Data step 
    
    // Query will find the RSSI values for last minute for each connected WiFi network with this device
     String query = "from(bucket: \\"${bucketName}\\")\\n\\
   |> range(start: -1m)\\n\\
   |> filter(fn: (r) => r._measurement == \\"wifi_status\\" and r._field == \\"rssi\\")";
   
     // Print composed query
     Serial.println("Querying for RSSI values written to the \\"${bucketName}\\" bucket in the last 1 min... ");
     Serial.println(query);
   
     // Send query to the server and get result
     FluxQueryResult result = client.query(query);
   
     Serial.println("Results : ");
     // Iterate over rows.
     while (result.next()) {
       // Get converted value for flux result column 'SSID'
       String ssid = result.getValueByName("SSID").getString();
       Serial.print("SSID '");
       Serial.print(ssid);
   
       Serial.print("' with RSSI ");
       // Get value of column named '_value'
       long value = result.getValueByName("_value").getLong();
       Serial.print(value);
   
       // Get value for the _time column
       FluxDateTime time = result.getValueByName("_time").getDateTime();
   
       String timeStr = time.format("%F %T");
   
       Serial.print(" at ");
       Serial.print(timeStr);
   
       Serial.println();
     }
   
     // Report any error
     if (result.getError() != "") {
       Serial.print("Query result error: ");
       Serial.println(result.getError());
     }
   
     // Close the result
     result.close();
   
     Serial.println("==========");
   
     delay(5000);
   }`

  const fluxExample = `from(bucket: “weather-data”)
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == “temperature”)`

  useEffect(() => {
    const fireKeyboardCopyEvent = event => {
      if (
        keyboardCopyTriggered(event) &&
        userSelection().includes('influx query')
      ) {
        logCopyCodeSnippet()
      }
    }
    document.addEventListener('keydown', fireKeyboardCopyEvent)
    return () => document.removeEventListener('keydown', fireKeyboardCopyEvent)
  }, [])

  return (
    <>
      <h1>Execute a Flux Query</h1>
      <p>
        Now let's query the data we wrote into the database. We use the Flux
        scripting language to query data.{' '}
        <SafeBlankLink
          href="https://docs.influxdata.com/influxdb/latest/reference/syntax/flux/"
          onClick={() =>
            event('firstMile.arduinoWizard.documentation.link.clicked')
          }
        >
          Flux
        </SafeBlankLink>{' '}
        is designed for querying, analyzing, and acting on data.
        <br />
        <br />
        Here's an example of a basic Flux script:
      </p>
      <CodeSnippet
        text={fluxExample}
        showCopyControl={false}
        language="properties"
      ></CodeSnippet>
      <p className="small-margins">
        In this query, we are looking for data points within the last 1 minute
        with a measurement of{' '}
        <code className="homepage-wizard--code-highlight">"wifi_status"</code>.
      </p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="arduino"
      />
    </>
  )
}
