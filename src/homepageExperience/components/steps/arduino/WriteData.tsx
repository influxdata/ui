// Libraries
import React, {useState} from 'react'

// Components
import {Button, ButtonGroup, ComponentColor} from '@influxdata/clockface'

// Styles
import './ArduinoSteps.scss'

// Types
type CurrentDataSelection = 'URL' | 'CSV'
type OwnProps = {
  bucket: string
}

export const WriteDataComponent = (props: OwnProps) => {
  const {bucket} = props

  const [currentDataSelection, setCurrentDataSelection] = useState<
    CurrentDataSelection
  >('URL')

  return (
    <>
      <h1>Write Data</h1>
      <h2 style={{marginBottom: '8px'}}>Choose your sample data source</h2>
      <p className="small-margins">
        We recommend choosing an option that most closely matches how you will
        write your actual data.
      </p>
      <ButtonGroup className="small-margins">
        <Button
          text="URL to File"
          color={
            currentDataSelection === 'URL'
              ? ComponentColor.Primary
              : ComponentColor.Default
          }
          onClick={() => {
            setCurrentDataSelection('URL')
          }}
        />
        <Button
          text="Local CSV"
          color={
            currentDataSelection === 'CSV'
              ? ComponentColor.Primary
              : ComponentColor.Default
          }
          onClick={() => {
            setCurrentDataSelection('CSV')
          }}
        />
      </ButtonGroup>
      {currentDataSelection === 'CSV' && (
        <>
          <h2 className="large-margins">Download sample data to {bucket}</h2>
        </>
      )}
      {currentDataSelection === 'URL' && (
        <>
          <h2 className="large-margins">Review sample data</h2>
        </>
      )}
    </>
  )
}

export const WriteData = props => {
  return <WriteDataComponent bucket={props.bucket} />
}
