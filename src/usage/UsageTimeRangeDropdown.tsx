// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Dropdown, Form, IconFont} from '@influxdata/clockface'
import {UsageContext} from 'src/usage/context/usage'

// Utils
import {getTimeRangeLabel} from 'src/shared/utils/duration'

// Constants
import {SELECTABLE_USAGE_TIME_RANGES} from 'src/shared/constants/timeRanges'

const UsageTimeRangeDropdown: FC = () => {
  const {handleSetTimeRange, timeRange} = useContext(UsageContext)
  const timeRangeLabel = getTimeRangeLabel(timeRange)

  const handleClickDropdownItem = (label: string): void => {
    const timeRange = SELECTABLE_USAGE_TIME_RANGES.find(t => t.label === label)
    handleSetTimeRange(timeRange)
  }

  return (
    <Form.Element label="Time Range">
      <Dropdown
        style={{width: 200, marginBottom: 8}}
        testID="usage-timerange--dropdown"
        button={(active, onClick) => (
          <Dropdown.Button
            active={active}
            onClick={onClick}
            icon={IconFont.Clock_New}
            testID="usage-timerange--selected"
          >
            {timeRangeLabel}
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu onCollapse={onCollapse}>
            {SELECTABLE_USAGE_TIME_RANGES.map(({label}) => {
              const testID = label.toLowerCase().replace(/\s/g, '')
              return (
                <Dropdown.Item
                  key={label}
                  value={label}
                  id={label}
                  testID={`dropdown-item-${testID}`}
                  selected={label === timeRangeLabel}
                  onClick={handleClickDropdownItem}
                >
                  {label}
                </Dropdown.Item>
              )
            })}
          </Dropdown.Menu>
        )}
      />
    </Form.Element>
  )
}

export default UsageTimeRangeDropdown
