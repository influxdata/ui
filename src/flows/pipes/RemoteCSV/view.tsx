import React, {FC, useState, useContext} from 'react'

import {
  Dropdown,
  ComponentColor,
  Input,
  InputType,
  ComponentStatus,
} from '@influxdata/clockface'
import {PipeProp} from 'src/types/flows'
import {PipeContext} from 'src/flows/context/pipe'

const SampleCSVs = {
  Sample_Air_Sensor_Data:
    'https://raw.githubusercontent.com/influxdata/influxdb2-sample-data/master/air-sensor-data/air-sensor-data-annotated.csv',
  NOAA_Weather_Data: 'https://influx-testdata.s3.amazonaws.com/noaa.csv',
  USGS_Earthquake_Data:
    'https://raw.githubusercontent.com/influxdata/influxdb2-sample-data/master/usgs-earthquake-data/all_week-annotated.csv',
  'NOAA_National_Buoy_Data_Center_(NDBC)':
    'https://raw.githubusercontent.com/influxdata/influxdb2-sample-data/master/noaa-ndbc-data/latest-observations-annotated.csv',
  Custom: '',
}

const RemoteCSV: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const [selectedCSV, setSelectedCSV] = useState(data.csvType ?? '')
  const [selectedCSVURL, setSelectedCSVURL] = useState(
    data.url.length ? data.url : ''
  )

  const handleChange = (e: any) => {
    setSelectedCSVURL(e.target.value)
    update({url: e.target.value})
  }

  const handleSelectFromDropdown = (selected: string) => {
    update({csvType: selected, url: SampleCSVs[selected] ?? ''})
    setSelectedCSV(selected)
    setSelectedCSVURL(SampleCSVs[selected])
  }

  return (
    <Context>
      <div className="remote-csv-container" data-testid="csvimporturl">
        <div className="remote-csv-card">
          <Dropdown
            testID="remote-csv--dropdown"
            style={{width: '220px'}}
            button={(active, onClick) => (
              <Dropdown.Button
                active={active}
                onClick={onClick}
                color={ComponentColor.Primary}
                testID="dropdown-button--remote-csv"
              >
                {selectedCSV.length ? selectedCSV : 'Import Sample CSV'}
              </Dropdown.Button>
            )}
            menu={onCollapse => (
              <Dropdown.Menu onCollapse={onCollapse}>
                {Object.keys(SampleCSVs).map(m => (
                  <Dropdown.Item
                    testID={`remote-csv--dropdown-item-${m}`}
                    id={m}
                    key={m}
                    value={m}
                    onClick={() => handleSelectFromDropdown(m)}
                    selected={m === selectedCSV}
                  >
                    {m}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            )}
          />
          <div data-testid="csvimporturl" className="remote-csv-url-input">
            <Input
              type={InputType.Text}
              value={selectedCSVURL}
              onChange={handleChange}
              status={
                selectedCSV.length && selectedCSV !== 'Custom'
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            />
          </div>
        </div>
      </div>
    </Context>
  )
}

export default RemoteCSV
