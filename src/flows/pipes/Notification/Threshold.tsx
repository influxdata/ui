import React, {ChangeEvent, FC, useCallback, useContext, useMemo} from 'react'
import {
  ComponentSize,
  FlexBox,
  IconFont,
  TextBlock,
  Dropdown,
  FlexDirection,
  Input,
  InputType,
  Icon,
  ComponentStatus,
} from '@influxdata/clockface'
import DurationInput from 'src/shared/components/DurationInput'
import {CHECK_OFFSET_OPTIONS} from 'src/alerting/constants'

import {PipeContext} from 'src/flows/context/pipe'
import 'src/flows/pipes/Notification/Threshold.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {
  deadmanType,
  Threshold as ThresholdType,
  ThresholdFormat,
  THRESHOLD_TYPES,
} from 'src/flows/pipes/Visualization/threshold'

interface Props {
  readOnly?: boolean
}

const Threshold: FC<Props> = ({readOnly}) => {
  const {data, update, results} = useContext(PipeContext)

  const fields = Array.from(
    new Set(results.parsed.table.columns['_field']?.data as string[])
  )

  const thresholds = useMemo(() => data?.thresholds ?? [], [data?.thresholds])

  const setThresholdType = useCallback(
    (type: string, index) => {
      if (!THRESHOLD_TYPES[type]) {
        return
      }

      event('Changed Notification Threshold', {type})

      const threshold = thresholds.find((_, i) => index === i)

      if (!threshold) {
        return
      }

      threshold.type = type

      let updatedThreshold = thresholds

      if (THRESHOLD_TYPES[type].format === ThresholdFormat.Range) {
        threshold.min = 0
        threshold.max = 100
      } else if (THRESHOLD_TYPES[type].format === ThresholdFormat.Deadman) {
        updatedThreshold = [
          {
            type: deadmanType,
            deadmanCheckValue: '5s',
            deadmanStopValue: '90s',
            field: threshold?.field || 'Select a numeric field',
          },
        ]
      } else {
        threshold.value = 20
      }
      update({thresholds: updatedThreshold})
    },
    [thresholds, update]
  )

  const setColumn = useCallback(
    (column: string, index: number) => {
      event('Changed Notification Threshold Column')

      const threshold = thresholds.find((_, i) => index === i)

      if (threshold) {
        threshold.field = column
      }

      update({thresholds})
    },
    [thresholds, update]
  )

  const funcDropdown = useCallback(
    (threshold: ThresholdType, index: number) => {
      const menuItems = Object.entries(THRESHOLD_TYPES)
        .filter(([key]) => {
          if (index > 0 && key === deadmanType) {
            return false
          }
          return true
        })
        .map(([key, value]) => (
          <Dropdown.Item
            testID="dropdown-item--threshold-field"
            key={key}
            value={key}
            onClick={type => setThresholdType(type, index)}
            selected={key === threshold?.type}
            title={value.name}
            disabled={!!readOnly}
          >
            {value?.name}
          </Dropdown.Item>
        ))
      const menu = onCollapse => (
        <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
      )
      const menuButton = (active, onClick) => (
        <Dropdown.Button
          testID="dropdown--threshold-fields"
          onClick={onClick}
          active={active}
          size={ComponentSize.Medium}
          status={
            !!readOnly ? ComponentStatus.Disabled : ComponentStatus.Default
          }
        >
          {THRESHOLD_TYPES[threshold?.type]?.name || 'Select a function'}
        </Dropdown.Button>
      )
      return <Dropdown menu={menu} button={menuButton} />
    },
    [setThresholdType]
  )

  const columnDropdown = useCallback(
    (threshold: ThresholdType, index: number) => {
      const menuItems = fields.map(key => (
        <Dropdown.Item
          key={key}
          value={key}
          onClick={field => setColumn(field, index)}
          selected={key === threshold?.field}
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
          status={
            !!readOnly ? ComponentStatus.Disabled : ComponentStatus.Default
          }
        >
          {threshold?.field || 'Select a numeric field'}
        </Dropdown.Button>
      )
      return <Dropdown menu={menu} button={menuButton} />
    },
    [fields, setColumn]
  )

  const updateMin = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const threshold = thresholds.find((_, i) => index === i)

    if (threshold) {
      threshold.min = event.target.value
    }

    update({thresholds})
  }

  const updateMax = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const threshold = thresholds.find((_, i) => index === i)

    if (threshold) {
      threshold.max = event.target.value
    }

    update({thresholds})
  }

  const updateDeadmanCheckValue = (value: string) => {
    // we only ever want to present deadman checks in the first instance
    // so we're only ever concerned with the first value of the threshold
    // since anything after that is irrelevant
    update({
      thresholds: [
        {
          ...thresholds[0],
          deadmanCheckValue: value,
          type: deadmanType,
        },
      ],
    })
  }

  const updateDeadmanStopValue = (value: string) => {
    // we only ever want to present deadman checks in the first instance
    // so we're only ever concerned with the first value of the threshold
    // since anything after that is irrelevant
    update({
      thresholds: [
        {
          ...thresholds[0],
          deadmanStopValue: value,
          type: deadmanType,
        },
      ],
    })
  }

  const updateValue = (
    changeEvent: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    event('Alert Panel (Notebooks) - Threshold Value Entered')
    const threshold = thresholds.find((_, i) => index === i)

    if (threshold) {
      threshold.value = changeEvent.target.value
    }

    update({thresholds})
  }

  const handleAddThreshold = () => {
    event('Alert Panel (Notebooks) - New Threshold Added')
    update({
      thresholds: [
        ...thresholds,
        {
          type: 'greater',
          value: 0,
        },
      ],
    })
  }

  const handleRemoveThreshold = (index: number) => {
    const copy = thresholds.slice()
    copy.splice(index, 1)

    update({
      thresholds: copy,
    })
  }

  const thresholdEntry = (threshold: ThresholdType, index: number) => {
    if (threshold?.type === deadmanType) {
      return (
        <FlexBox
          direction={FlexDirection.Row}
          margin={ComponentSize.Small}
          stretchToFitWidth
        >
          <FlexBox.Child testID="component-spacer--flex-child" grow={1}>
            <DurationInput
              suggestions={CHECK_OFFSET_OPTIONS}
              onSubmit={updateDeadmanCheckValue}
              value={threshold.deadmanCheckValue ?? '5s'}
              showDivider={false}
            />
          </FlexBox.Child>
          <TextBlock
            testID="when-value-text-block"
            text="And stop checking after"
          />
          <FlexBox.Child testID="component-spacer--flex-child" grow={1}>
            <DurationInput
              suggestions={CHECK_OFFSET_OPTIONS}
              onSubmit={updateDeadmanStopValue}
              value={threshold.deadmanStopValue ?? '90s'}
              showDivider={false}
            />
          </FlexBox.Child>
        </FlexBox>
      )
    }
    if (THRESHOLD_TYPES[threshold?.type]?.format === ThresholdFormat.Range) {
      return (
        <FlexBox
          direction={FlexDirection.Row}
          margin={ComponentSize.Small}
          stretchToFitWidth
        >
          <FlexBox.Child grow={1}>
            <Input
              name="interval"
              type={InputType.Text}
              placeholder="min"
              value={threshold.min}
              onChange={event => updateMin(event, index)}
              size={ComponentSize.Medium}
              status={
                !!readOnly ? ComponentStatus.Disabled : ComponentStatus.Default
              }
            />
          </FlexBox.Child>
          <TextBlock testID="is-value-text-block" text="to" />
          <FlexBox.Child grow={1}>
            <Input
              name="interval"
              type={InputType.Text}
              placeholder="max"
              value={threshold.max}
              onChange={event => updateMax(event, index)}
              size={ComponentSize.Medium}
              status={
                !!readOnly ? ComponentStatus.Disabled : ComponentStatus.Default
              }
            />
          </FlexBox.Child>
        </FlexBox>
      )
    }
    return (
      <FlexBox
        direction={FlexDirection.Row}
        margin={ComponentSize.Small}
        stretchToFitWidth
      >
        <FlexBox.Child grow={1}>
          <Input
            name="interval"
            type={InputType.Text}
            placeholder="value"
            value={threshold.value}
            onChange={event => updateValue(event, index)}
            size={ComponentSize.Medium}
            status={
              !!readOnly ? ComponentStatus.Disabled : ComponentStatus.Default
            }
          />
        </FlexBox.Child>
      </FlexBox>
    )
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Small}
      testID="component-spacer"
      style={{padding: '24px 0'}}
    >
      {thresholds.map((threshold: ThresholdType, index: number) => (
        <FlexBox
          direction={FlexDirection.Row}
          margin={ComponentSize.Medium}
          stretchToFitWidth
          testID="component-spacer"
          key={`${threshold.type}_${index}`}
        >
          <TextBlock
            testID="when-value-text-block"
            text={index === 0 ? 'When' : 'And'}
            style={{minWidth: 56, textAlign: 'center'}}
          />
          <FlexBox.Child grow={2} testID="component-spacer--flex-child">
            {columnDropdown(threshold, index)}
          </FlexBox.Child>
          <TextBlock testID="is-value-text-block" text="is" />
          <FlexBox.Child grow={2} testID="component-spacer--flex-child">
            {funcDropdown(threshold, index)}
          </FlexBox.Child>
          <FlexBox.Child grow={3} testID="component-spacer--flex-child">
            {thresholdEntry(threshold, index)}
          </FlexBox.Child>
          <FlexBox.Child grow={4} testID="component-spacer--flex-child">
            {index !== 0 && !readOnly ? (
              <div
                className="threshold-trash-icon--block"
                onClick={() => handleRemoveThreshold(index)}
              >
                <Icon glyph={IconFont.Trash_New} />
              </div>
            ) : null}
          </FlexBox.Child>
        </FlexBox>
      ))}
      {thresholds[0].type !== deadmanType && !readOnly && (
        <FlexBox
          direction={FlexDirection.Row}
          margin={ComponentSize.Small}
          stretchToFitWidth
          testID="component-spacer"
        >
          <div
            className="threshold-add-icon--block"
            onClick={handleAddThreshold}
          >
            <TextBlock
              testID="add-value-text-block"
              text="+"
              style={{
                fontWeight: 400,
                fontSize: 25,
                textAlign: 'center',
                minWidth: 56,
              }}
            />
          </div>
        </FlexBox>
      )}
    </FlexBox>
  )
}

export default Threshold
