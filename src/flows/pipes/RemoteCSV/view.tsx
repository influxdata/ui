import React, {FC, useContext} from 'react'

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
  USGS_Earthquake_Data:
    'https://raw.githubusercontent.com/influxdata/influxdb2-sample-data/master/usgs-earthquake-data/all_week-annotated.csv',
  'NOAA_National_Buoy_Data_Center_(NDBC)':
    'https://raw.githubusercontent.com/influxdata/influxdb2-sample-data/master/noaa-ndbc-data/latest-observations-annotated.csv',
  Custom: '',
}

const RemoteCSV: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)

  const handleChange = (e: any) => {
    update({url: e.target.value})
  }

  const handleSelectFromDropdown = (selected: string) => {
    update({csvType: selected, url: SampleCSVs[selected] ?? ''})
  }

  const {csvType, url} = data

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
                {csvType.length ? csvType : 'Import Sample CSV'}
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
                    selected={m === csvType}
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
              value={url}
              onChange={handleChange}
              status={
                csvType.length && csvType !== 'Custom'
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
