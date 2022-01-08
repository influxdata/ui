// Libraries
import React, {ChangeEvent, FC, useCallback, useContext, useMemo} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  ComponentStatus,
  Dropdown,
  Icon,
  IconFont,
  Input,
  InputType,
  FlexBox,
  FlexDirection,
  Form,
  TextBlock,
} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {event} from 'src/cloud/utils/reporting'

enum ThresholdFormat {
  Value = 'value',
  Range = 'range',
}

type Threshold = {
  value: number
  type: string
  field: string
  max?: number
  min?: number
}

export const THRESHOLD_TYPES = {
  greater: {
    name: 'greater than',
    format: ThresholdFormat.Value,
    condition: data => `(r) => (r["${data.field}"] > ${data.value})`,
  },
  'greater-equal': {
    name: 'greater than or equal to',
    format: ThresholdFormat.Value,
    condition: data => `(r) => (r["${data.field}"] >= ${data.value})`,
  },
  less: {
    name: 'less than',
    format: ThresholdFormat.Value,
    condition: data => `(r) => (r["${data.field}"] < ${data.value})`,
  },
  'less-equal': {
    name: 'less than or equal to',
    format: ThresholdFormat.Value,
    condition: data => `(r) => (r["${data.field}"] <= ${data.value})`,
  },
  equal: {
    name: 'equal to',
    format: ThresholdFormat.Value,
    condition: data => `(r) => (r["${data.field}"] == ${data.value})`,
  },
  'not-equal': {
    name: 'not equal to',
    format: ThresholdFormat.Value,
    condition: data => `(r) => (r["${data.field}"] != ${data.value})`,
  },
  between: {
    name: 'between',
    format: ThresholdFormat.Range,
    condition: data =>
      `(r) => (r["${data.field}"] > ${data.min} and r["${data.field}"] < ${data.max})`,
  },
  'not-between': {
    name: 'not between',
    format: ThresholdFormat.Range,
    condition: data =>
      `(r) => (r["${data.field}"] < ${data.min} or r["${data.field}"] > ${data.max})`,
  },
}

const ErrorThresholds: FC = () => {
  const {data, update, results} = useContext(PipeContext)

  const fields = Array.from(
    new Set(results.parsed.table.columns['_field']?.data as string[])
  )

  const errorThresholds = useMemo(() => data?.errorThresholds ?? [], [
    data?.errorThresholds,
  ])

  const setThresholdType = useCallback(
    (type, index) => {
      if (!THRESHOLD_TYPES[type]) {
        return
      }

      event('Changed Error Threshold', {type})

      const threshold = errorThresholds.find((_, i) => index === i)

      if (!threshold) {
        return
      }

      threshold.type = type
      threshold.field = threshold.field || '_value'

      if (THRESHOLD_TYPES[type].format === ThresholdFormat.Range) {
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

  const handleAddThreshold = () => {
    event('Error Threshold Added to Visualization Panel')
    update({
      errorThresholds: [
        ...(errorThresholds ?? []),
        {
          type: 'greater',
          value: 0,
        },
      ],
    })
  }

  const handleRemoveThreshold = (index: number) => {
    const copy = errorThresholds.slice()
    copy.splice(index, 1)

    update({
      errorThresholds: copy,
    })
  }

  const updateMin = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const threshold = errorThresholds.find((_, i) => index === i)

    if (threshold) {
      threshold.min = Number(event.target.value)
    }

    update({errorThresholds})
  }

  const updateMax = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const threshold = errorThresholds.find((_, i) => index === i)

    if (threshold) {
      threshold.max = Number(event.target.value)
    }

    update({errorThresholds})
  }

  const updateValue = (
    changeEvent: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    event('Alert Panel (Notebooks) - Threshold Value Entered')
    const threshold = errorThresholds.find((_, i) => index === i)

    if (threshold) {
      threshold.value = Number(changeEvent.target.value)
    }

    update({errorThresholds})
  }

  const columnDropdown = useCallback(
    (threshold: Threshold, index: number) => {
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
    },
    [fields, setColumn]
  )

  const funcDropdown = useCallback(
    (threshold: Threshold, index: number) => {
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
          {THRESHOLD_TYPES[threshold?.type]?.name || 'Select a function'}
        </Dropdown.Button>
      )
      return <Dropdown menu={menu} button={menuButton} />
    },
    [setThresholdType]
  )

  const thresholdEntry = (threshold: Threshold, index: number) => {
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
          />
        </FlexBox.Child>
      </FlexBox>
    )
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      alignItems={AlignItems.Stretch}
      margin={ComponentSize.Medium}
      testID="threshold-error-settings"
    >
      <Form.Element label="Error Thresholds">
        <FlexBox
          direction={FlexDirection.Column}
          margin={ComponentSize.Small}
          testID="component-spacer"
        >
          {data?.errorThresholds?.map((threshold: any, index: number) => (
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
              <FlexBox.Child grow={1} testID="component-spacer--flex-child">
                <div
                  className="threshold-trash-icon--block"
                  onClick={() => handleRemoveThreshold(index)}
                >
                  <Icon glyph={IconFont.Trash_New} />
                </div>
              </FlexBox.Child>
            </FlexBox>
          ))}
        </FlexBox>
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
      </Form.Element>
    </FlexBox>
  )
}

export default ErrorThresholds
