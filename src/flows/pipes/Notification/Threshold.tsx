import React, {FC, useContext, useMemo} from 'react'
import {
  FlexBox,
  ComponentSize,
  TextBlock,
  Dropdown,
  FlexDirection,
  Input,
  InputType,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

enum ThresholdFormat {
  Value = 'value',
  Range = 'range',
}

const THRESHOLD = {
  greater: {
    name: 'Greater Than',
    format: ThresholdFormat.Value,
  },
  'greater-equal': {
    name: 'Greater Than or Equal To',
    format: ThresholdFormat.Value,
  },
  less: {
    name: 'Greater Than',
    format: ThresholdFormat.Value,
  },
  'less-equal': {
    name: 'Greater Than or Equal To',
    format: ThresholdFormat.Value,
  },
  equal: {
    name: 'Equal To',
    format: ThresholdFormat.Value,
  },
  'not-equal': {
    name: 'Not Equal To',
    format: ThresholdFormat.Value,
  },
  between: {
    name: 'Between',
    format: ThresholdFormat.Range,
  },
  'not-between': {
    name: 'Not Between',
    format: ThresholdFormat.Range,
  },
}

const Threshold: FC = () => {
  const {data, update, results} = useContext(PipeContext)

  const numericColumns = results.parsed.table.columnKeys.filter(key => {
    if (key === 'result' || key === 'table') {
      return false
    }

    const columnType = results.parsed.table.getColumnType(key)

    return columnType === 'time' || columnType === 'number'
  })

  const setThresholdType = type => {
    if (!THRESHOLD[type]) {
      return
    }

    if (THRESHOLD[type].format === ThresholdFormat.Range) {
      update({
        threshold: {
          type,
          field: data.threshold.field || '_value',
          min: 0,
          max: 100,
        },
      })
    } else {
      update({
        threshold: {
          type,
          field: data.threshold.field || '_value',
          value: 20,
        },
      })
    }
  }

  const setColumn = column => {
    update({
      threshold: {
        ...data.threshold,
        field: column,
      },
    })
  }

  const funcDropdown = useMemo(() => {
    const menuItems = Object.entries(THRESHOLD).map(([key, value]) => (
      <Dropdown.Item
        key={key}
        value={key}
        onClick={setThresholdType}
        selected={key === data.threshold?.type}
        title={value.name}
      >
        {value.name}
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
        {THRESHOLD[data.threshold?.type]?.name || 'Select a function'}
      </Dropdown.Button>
    )
    return <Dropdown menu={menu} button={menuButton} />
  }, [data.threshold?.type])

  const columnDropdown = useMemo(() => {
    const menuItems = numericColumns.map(key => (
      <Dropdown.Item
        key={key}
        value={key}
        onClick={setColumn}
        selected={key === data.threshold?.field}
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
        {data.threshold?.field || 'Select a numeric column'}
      </Dropdown.Button>
    )
    return <Dropdown menu={menu} button={menuButton} />
  }, [numericColumns, data.threshold?.field])

  const updateMin = evt => {
    update({
      threshold: {
        ...data.threshold,
        min: evt.target.value,
      },
    })
  }

  const updateMax = evt => {
    update({
      threshold: {
        ...data.threshold,
        max: evt.target.value,
      },
    })
  }

  const updateValue = evt => {
    update({
      threshold: {
        ...data.threshold,
        value: evt.target.value,
      },
    })
  }

  const feet =
    THRESHOLD[data.threshold?.type].format === ThresholdFormat.Range ? (
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
            value={data.threshold.min}
            onChange={updateMin}
            size={ComponentSize.Medium}
          />
        </FlexBox.Child>
        <TextBlock testID="is-value-text-block" text="to" />
        <FlexBox.Child grow={1}>
          <Input
            name="interval"
            type={InputType.Text}
            placeholder="max"
            value={data.threshold.max}
            onChange={updateMax}
            size={ComponentSize.Medium}
          />
        </FlexBox.Child>
      </FlexBox>
    ) : (
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
            value={data.threshold.value}
            onChange={updateValue}
            size={ComponentSize.Medium}
          />
        </FlexBox.Child>
      </FlexBox>
    )

  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Small}
      testID="component-spacer"
      style={{padding: '24px 0'}}
    >
      <FlexBox
        direction={FlexDirection.Row}
        margin={ComponentSize.Small}
        stretchToFitWidth
        testID="component-spacer"
      >
        <TextBlock testID="when-value-text-block" text="When" />
        <FlexBox.Child grow={1} testID="component-spacer--flex-child">
          {columnDropdown}
        </FlexBox.Child>
        <TextBlock testID="is-value-text-block" text="is" />
        <FlexBox.Child grow={2} testID="component-spacer--flex-child">
          {funcDropdown}
        </FlexBox.Child>
        <FlexBox.Child grow={3} testID="component-spacer--flex-child">
          {feet}
        </FlexBox.Child>
      </FlexBox>
    </FlexBox>
  )
}

export default Threshold
