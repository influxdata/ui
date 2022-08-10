import React, {FC} from 'react'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

export const InstallDependencies: FC = () => {

  return (
    <>
      <h1>Install Dependencies</h1>
      <p>You can install the required InfluxDB Client for Arduino library from the library manager</p>
      <p>1. Under Sketch {'>'} Include Libraries, click on Manage Libraries.</p>
      <p>2. Search for 'influxdb' in the search box.</p>
      <p>3. Install 'InfluxDB Client for Arduino' library.</p>
      <p>
            You'll need to have {' '}
            <SafeBlankLink href="https://www.arduino.cc/en/software">
              Arduino
            </SafeBlankLink>{' '}
            installed.
      </p>
    </>
  )
}
