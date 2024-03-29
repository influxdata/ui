import React, {FC} from 'react'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

export const InstallDependencies: FC = () => {
  return (
    <>
      <h1>Install Dependencies</h1>
      <p>
        You can install the required InfluxDB Client for Arduino library from
        the library manager
      </p>
      <ol style={{fontSize: '16px', fontWeight: 'normal'}}>
        <li>
          Under Sketch &rarr; Include Libraries, click on Manage Libraries.
        </li>
        <li>
          Search for{' '}
          <code className="homepage-wizard--code-highlight">'influxdb'</code> in
          the search box.
        </li>
        <li>
          Install{' '}
          <code className="homepage-wizard--code-highlight">
            'InfluxDB Client for Arduino'
          </code>{' '}
          library.
        </li>
      </ol>
      <p>
        You'll need to have{' '}
        <SafeBlankLink href="https://www.arduino.cc/en/software">
          Arduino
        </SafeBlankLink>{' '}
        installed.
      </p>
    </>
  )
}
