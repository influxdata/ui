import React, {FC, useContext, useEffect, useState} from 'react'

// Utils
import {event} from 'src/cloud/utils/reporting'

import {
  Dropdown,
  ComponentColor,
  Input,
  InputType,
  ComponentStatus,
} from '@influxdata/clockface'
import {PipeProp} from 'src/types/flows'
import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'

const SampleCSVs = {
  airSensor: 'Sample Air Sensor Data',
  noaa: 'NOAA National Buoy Data Center (NDBC)',
  usgs: 'USGS Earthquake Data',
}

const RemoteCSV: FC<PipeProp> = ({Context}) => {
  const [csvHash, setCSVHash] = useState({})
  const {data, update} = useContext(PipeContext)
  const {query} = useContext(FlowQueryContext)

  const handleChange = (e: any) => {
    update({url: e.target.value})
  }

  const handleSelectFromDropdown = (
    selected: string,
    url: string,
    name: string
  ) => {
    event('Remote CSV Panel (Notebooks)- Selected Option: ' + name)
    update({csvType: selected, url: url ?? '', sampleName: name})
  }

  const {csvType, url} = data
  useEffect(() => {
    query(`import "influxdata/influxdb/sample"
     sample.list()`).then(res => {
      const columnNames = [
        ...(res.parsed.table.columns.name.data as string[]),
        'Custom',
      ]
      const columnUrls = res.parsed.table.columns.url.data as string[]
      setCSVHash(
        columnNames.reduce((a, b, idx) => {
          if (SampleCSVs[b]) {
            a[b] = {
              url: columnUrls[idx],
              label: SampleCSVs[b],
              name: b,
            }
          }
          if (b === 'Custom') {
            a[b] = {
              url: '',
              label: 'Custom',
              name: 'Custom',
            }
          }
          return a
        }, {})
      )
    })
  }, [])

  return (
    <Context>
      <div className="remote-csv-container" data-testid="csvimporturl">
        <div className="remote-csv-card">
          <Dropdown
            testID="remote-csv--dropdown"
            className="remote-csv--dropdown"
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
                {Object.values(csvHash).map(
                  (m: {url: string; label: string; name: string}) => {
                    return (
                      <Dropdown.Item
                        testID={`remote-csv--dropdown-item-${m.label}`}
                        id={m.label}
                        key={m.label}
                        value={m.label}
                        onClick={() =>
                          handleSelectFromDropdown(m.label, m.url, m.name)
                        }
                        selected={m.label === csvType}
                      >
                        {m.label}
                      </Dropdown.Item>
                    )
                  }
                )}
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
