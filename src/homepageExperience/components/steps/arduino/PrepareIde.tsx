// Libraries
import React from 'react'

const listStyle = {
  fontSize: '16px',
  fontWeight: 'normal',
}

export const PrepareIde = () => {
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
      <p>
        <b>For ESP8266:</b>
      </p>
      <ol style={listStyle}>
        <li>Open the Arduino Preferences (Arduino {'>'} Preferences) </li>
        <li>
          Look for "Additional Boards Manager URLs" input box and paste
          "http://arduino.esp8266.com/stable/package_esp8266com_index.json" in
          it.
        </li>
        <li>Click OK.</li>
        <li>Then under Tools {'>'} Boards: , click on Boards Manager.</li>
        <li>Search for ESP8266 in the boards.</li>
        <li>Install the ESP8266 board by ESP8266 Community.</li>
      </ol>
      <p>
        <b>For ESP32:</b>
      </p>
      <ol style={listStyle}>
        <li>Open the Arduino Preferences (Arduino {'>'} Preferences) </li>
        <li>
          Look for "Additional Boards Manager URLs" input box and paste
          "https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json"
          in it.
        </li>
        <li>Click OK.</li>
        <li>Then under Tools {'>'} Boards: , click on Boards Manager.</li>
        <li>Search for ESP32 in the boards.</li>
        <li>Install the ESP32 board by ESP32 Community.</li>
      </ol>
    </>
  )
}
