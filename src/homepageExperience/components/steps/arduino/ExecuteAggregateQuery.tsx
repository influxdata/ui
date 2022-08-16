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
  event('firstMile.arduinoWizard.executeAggregateQuery.code.copied')
}

const logDocsOpened = () => {
  event('firstMile.arduinoWizard.executeAggregateQuery.docs.opened')
}

type OwnProps = {
  bucket: string
}

export const ExecuteAggregateQuery = (props: OwnProps) => {
  const {bucket} = props
  const bucketName = bucket === DEFAULT_BUCKET ? 'sample-bucket' : bucket

  const fromBucketSnippet = `from(bucket: "weather-data")
  |> range(start: -10m)
  |> filter(fn: (r) => r.measurement == "temperature")
  |> mean()`

  const codeSnippet = `void loop() {
    // ... code from Write Data step
    
    // Query will find the min RSSI value for last minute for each connected WiFi network with this device
      String query = "from(bucket: \"${bucketName}\")\n\
    |> range(start: -1m)\n\
    |> filter(fn: (r) => r._measurement == \"wifi_status\")\n\
    |> min()";
    
      // Print composed query
      Serial.println("Querying for the mean RSSI value written to the \"${bucketName}\" bucket in the last 1 min... ");
      Serial.println(query);
    
      // Send query to the server and get result
      FluxQueryResult result = client.query(query);
    
      Serial.println("Result : ");
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
      <h1>Execute a Flux Aggregate Query</h1>
      <p>
        <SafeBlankLink
          href="https://docs.influxdata.com/flux/v0.x/function-types/#aggregates"
          onClick={logDocsOpened}
        >
          Aggregate functions
        </SafeBlankLink>{' '}
        take the values of all rows in a table and use them to perform an
        aggregate operation. The result is output as a new value in a single-row
        table.
      </p>
      <p>
        An aggregation is applied after the time range and filters, as seen in
        the example below.
      </p>
      <CodeSnippet
        text={fromBucketSnippet}
        showCopyControl={false}
        onCopy={logCopyCodeSnippet}
        language="properties"
      />
      <p className="small-margins">
        In this example, we use the{' '}
        <code className="homepage-wizard--code-highlight">mean()</code> function
        to calculate the average value of data points in the last 1 minute.
      </p>
      <CodeSnippet
        text={codeSnippet}
        onCopy={logCopyCodeSnippet}
        language="arduino"
      />
    </>
  )
}
