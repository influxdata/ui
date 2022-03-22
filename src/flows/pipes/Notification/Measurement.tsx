import React, {useState, FC, useCallback, useContext} from 'react'
import {
  ComponentSize,
  FlexBox,
  AlignItems,
  TextBlock,
  Dropdown,
  FlexDirection,
  ComponentStatus,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'
import 'src/flows/pipes/Notification/Threshold.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface Props {
  readOnly?: boolean
}

const Measurement: FC<Props> = ({readOnly}) => {
  const {data, update, results} = useContext(PipeContext)
  const [measurement, setMeasurement] = useState(data.measurement || null)

  const measurements = Array.from(
    new Set(results.parsed.table.columns['_measurement']?.data as string[])
  )

  const onSelect = useCallback(
    (measurement: string) => {
      event('Changed Notification Measurement')
      setMeasurement(measurement)
      update({measurement})
    },
    [measurements, update]
  )

  const menuItems = measurements.map(key => (
    <Dropdown.Item
      key={key}
      value={key}
      onClick={() => onSelect(key)}
      selected={key === measurement}
      title={key}
      disabled={!!readOnly}
    >
      {key}
    </Dropdown.Item>
  ))

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
  )

  const menuButton = (active, onClick) => (
    <Dropdown.Button
      onClick={onClick}
      active={active}
      size={ComponentSize.Medium}
      status={!!readOnly ? ComponentStatus.Disabled : ComponentStatus.Default}
    >
      {measurement || 'Select a measurement'}
    </Dropdown.Button>
  )

  return (
    <FlexBox
      direction={FlexDirection.Row}
      margin={ComponentSize.Medium}
      alignItems={AlignItems.FlexStart}
      testID="component-spacer"
      style={{padding: '24px 0'}}
    >
      <TextBlock
        testID="measurement-value-text-block"
        text="For"
        style={{minWidth: 56, textAlign: 'center'}}
      />
      <FlexBox.Child grow={0}>
        <Dropdown menu={menu} button={menuButton} />
      </FlexBox.Child>
    </FlexBox>
  )
}

export default Measurement
