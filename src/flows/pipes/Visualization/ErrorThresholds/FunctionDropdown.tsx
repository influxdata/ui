// Libraries
import React, {FC, useCallback, useContext, useMemo} from 'react'

// Components
import {ComponentSize, ComponentStatus, Dropdown} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {event} from 'src/cloud/utils/reporting'
import {
  COMMON_THRESHOLD_TYPES,
  EQUALITY_THRESHOLD_TYPES,
  ErrorThreshold,
  ThresholdFormat,
} from 'src/flows/pipes/Visualization/threshold'

type Props = {
  threshold: ErrorThreshold
  index: number
}
const FunctionDropdown: FC<Props> = ({threshold, index}) => {
  const {data, update} = useContext(PipeContext)

  const errorThresholds = useMemo(
    () => data?.errorThresholds ?? [],
    [data?.errorThresholds]
  )

  const setThresholdType = useCallback(
    (type, index) => {
      if (!COMMON_THRESHOLD_TYPES[type]) {
        return
      }

      event('Changed Error Threshold', {type})

      const threshold = errorThresholds.find((_, i) => index === i)

      if (!threshold) {
        return
      }

      threshold.type = type
      threshold.field = threshold.field || '_value'

      if (COMMON_THRESHOLD_TYPES[type].format === ThresholdFormat.Range) {
        threshold.min = 0
        threshold.max = 100
        delete threshold.value
      } else {
        threshold.value = 20
      }
      update({errorThresholds})
    },
    [errorThresholds, update]
  )

  const THRESHOLD_TYPES =
    threshold?.fieldType === 'number'
      ? COMMON_THRESHOLD_TYPES
      : EQUALITY_THRESHOLD_TYPES

  const menuItems = Object.entries(THRESHOLD_TYPES).map(([key, value]) => (
    <Dropdown.Item
      key={key}
      value={key}
      onClick={type => setThresholdType(type, index)}
      selected={key === threshold?.type}
      title={value.name}
    >
      {value?.name}
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
      status={ComponentStatus.Default}
    >
      {COMMON_THRESHOLD_TYPES[threshold?.type]?.name || 'Select a function'}
    </Dropdown.Button>
  )
  return <Dropdown menu={menu} button={menuButton} />
}

export default FunctionDropdown
