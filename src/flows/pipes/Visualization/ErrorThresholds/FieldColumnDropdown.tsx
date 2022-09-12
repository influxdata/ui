// Libraries
import React, {FC, useCallback, useContext, useMemo} from 'react'

// Components
import {ComponentSize, Dropdown} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {event} from 'src/cloud/utils/reporting'
import {ErrorThreshold} from 'src/flows/pipes/Visualization/threshold'

type Props = {
  threshold: ErrorThreshold
  index: number
}

const FieldColumnDropdown: FC<Props> = ({threshold, index}) => {
  const {data, update, results} = useContext(PipeContext)

  const fields = Array.from(
    new Set(results.parsed.table.columns['_field']?.data as string[])
  )

  const errorThresholds = useMemo(
    () => data?.errorThresholds ?? [],
    [data?.errorThresholds]
  )

  const setColumn = useCallback(
    (column: string, index: number) => {
      event('Changed Notification Threshold Column')

      const threshold = errorThresholds.find((_, i) => index === i)

      if (threshold) {
        threshold.field = column
      }

      const values = Object.values(results.parsed.table.columns).filter(c => {
        return c.name === '_value'
      })

      const fields = (
        (results.parsed.table.columns['_field'].data as any) ?? []
      ).reduce((acc, curr, index) => {
        const type = values.find(d => {
          return d.data[index] !== undefined
        })?.type
        if (!acc[curr]) {
          acc[curr] = {}
        }
        acc[curr][type] = true
        return acc
      }, {})

      const fieldTypes = Object.keys(fields[threshold?.field] ?? {})
      let fieldType: 'not-number' | 'number' = 'not-number'
      if (fieldTypes.length === 1 && fieldTypes[0] === 'number') {
        fieldType = 'number'
      }

      threshold.fieldType = fieldType

      // We want to invalidate the previous type selection if the
      // fieldType is not a number, and the selected type is not equality based
      if (
        threshold.fieldType !== 'number' &&
        threshold.type !== 'equal' &&
        threshold.type !== 'not-equal'
      ) {
        threshold.type = 'equal'
      }

      update({errorThresholds})
    },
    [results.parsed.table.columns, errorThresholds, update]
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

export default FieldColumnDropdown
