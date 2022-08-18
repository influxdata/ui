// Libraries
import React, {useState} from 'react'
import {
  Button,
  ButtonGroup,
  ComponentColor,
  Orientation,
} from '@influxdata/clockface'

const listStyle = {
  fontSize: '16px',
  fontWeight: 'normal',
}

export const PrepareIde = () => {
  type CurrentBoardSelection = 'ESP8266' | 'ESP32'
  const [currentSelection, setCurrentSelection] = useState<
    CurrentBoardSelection
  >('ESP8266')
  return (
    <>
      <h1>Prepare Arduino IDE</h1>
      <p>
        The easiest way to get started with the InfluxDB Arduino client is with
        the ESP8266 or ESP32 board.
      </p>
      <p>
        If you haven't already, add the board you wish to use (ESP8266 or ESP32)
        to the Arduino IDE by following these steps:
      </p>
      <ButtonGroup
        orientation={Orientation.Horizontal}
        style={{margin: '32px 0px'}}
      >
        <Button
          text="ESP8266"
          color={
            currentSelection === 'ESP8266'
              ? ComponentColor.Primary
              : ComponentColor.Default
          }
          onClick={() => {
            setCurrentSelection('ESP8266')
          }}
        />
        <Button
          text="ESP32"
          color={
            currentSelection === 'ESP32'
              ? ComponentColor.Primary
              : ComponentColor.Default
          }
          onClick={() => {
            setCurrentSelection('ESP32')
          }}
        />
      </ButtonGroup>
      {currentSelection === 'ESP8266' && (
        <>
          <p>
            <b>For ESP8266:</b>
          </p>
          <ol style={listStyle}>
            <li>Open the Arduino Preferences (Arduino &rarr; Preferences) </li>
            <li>
              Look for "Additional Boards Manager URLs" input box and paste
              "http://arduino.esp8266.com/stable/package_esp8266com_index.json"
              in it.
            </li>
            <li>Click OK.</li>
            <li>Then under Tools &rarr; Boards: , click on Boards Manager.</li>
            <li>Search for ESP8266 in the boards.</li>
            <li>Install the ESP8266 board by ESP8266 Community.</li>
          </ol>
        </>
      )}
      {currentSelection === 'ESP32' && (
        <>
          <p>
            <b>For ESP32:</b>
          </p>
          <ol style={listStyle}>
            <li>Open the Arduino Preferences (Arduino &rarr; Preferences) </li>
            <li>
              Look for "Additional Boards Manager URLs" input box and paste
              "https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json"
              in it.
            </li>
            <li>Click OK.</li>
            <li>Then under Tools &rarr; Boards: , click on Boards Manager.</li>
            <li>Search for ESP32 in the boards.</li>
            <li>Install the ESP32 board by ESP32 Community.</li>
          </ol>
        </>
      )}
    </>
  )
}
