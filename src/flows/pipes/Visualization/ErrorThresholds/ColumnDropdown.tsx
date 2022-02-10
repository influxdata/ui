// Libraries
import React, {FC, useCallback, useContext, useMemo} from 'react'

// Components
import {ComponentSize, Dropdown} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {event} from 'src/cloud/utils/reporting'
import {Threshold} from 'src/flows/pipes/Visualization/threshold'

type Props = {
  threshold: Threshold
  index: number
}

const ColumnDropdown: FC<Props> = ({threshold, index}) => {
  const {data, update, results} = useContext(PipeContext)

  const fields = Array.from(
    new Set(results.parsed.table.columns['_field']?.data as string[])
  )

  const errorThresholds = useMemo(() => data?.errorThresholds ?? [], [
    data?.errorThresholds,
  ])

  const setColumn = useCallback(
    (column: string, index: number) => {
      event('Changed Notification Threshold Column')

      const threshold = errorThresholds.find((_, i) => index === i)

      if (threshold) {
        threshold.field = column
      }

      update({errorThresholds})
    },
    [errorThresholds, update]
  )

  const menuItems = fields.map(key => (
    <Dropdown.Item
      key={key}
      value={key}
      onClick={field => setColumn(field, index)}
      selected={key === threshold?.field}
      title={key}
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
    >
      {threshold?.field || 'Select a field'}
    </Dropdown.Button>
  )
  return <Dropdown menu={menu} button={menuButton} />
}

export default ColumnDropdown
