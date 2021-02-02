// Libraries
import React, {FC, useContext, useState} from 'react'

// Components
import {
  FlexBox,
  FlexDirection,
  ComponentSize,
  AlignItems,
  InputLabel,
  ComponentColor,
  Toggle,
  InputToggleType,
  QuestionMarkTooltip,
  SelectGroup,
  ButtonShape,
  ComponentStatus,
} from '@influxdata/clockface'
import {millisecondsToDuration} from 'src/shared/utils/duration'
import SelectorList from 'src/timeMachine/components/SelectorList'

import {
  DURATIONS,
  AUTO_FUNCTIONS,
  FUNCTIONS,
} from 'src/timeMachine/constants/queryBuilder'

import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'
import DurationInput from 'src/shared/components/DurationInput'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowContext} from 'src/flows/context/flow.current'

const DESIRED_POINTS_PER_GRAPH = 360

const AggregationSelector: FC = () => {
  const {data, update} = useContext(PipeContext)
  const {flow} = useContext(FlowContext)
  const {period, fillValues} = data.aggregateWindow

  const [isAutoFunction, setIsAutoFunction] = useState(
    data.functions.length === 1 &&
      AUTO_FUNCTIONS.map(fn => fn.name).includes(data.functions[0].name)
  )

  const fnList = isAutoFunction
    ? AUTO_FUNCTIONS.map(f => f.name)
    : FUNCTIONS.map(f => f.name)
  const durationDisplay = period

  const toggleFill = () => {
    update({
      aggregateWindow: {
        ...data.aggregateWindow,
        fillValues: !fillValues,
      },
    })
  }

  const setPeriodMode = (_period: 'custom' | 'auto'): void => {
    if (_period === 'auto') {
      update({
        aggregateWindow: {
          ...data.aggregateWindow,
          period: 'auto',
        },
      })
      return
    }

    const {range} = flow

    if (range.type === 'selectable-duration') {
      update({
        aggregateWindow: {
          ...data.aggregateWindow,
          period: millisecondsToDuration(range.windowPeriod),
        },
      })
      return
    }

    if (range.type === 'custom') {
      update({
        aggregateWindow: {
          ...data.aggregateWindow,
          period: millisecondsToDuration(
            Math.round(
              (Date.parse(range.upper) - Date.parse(range.lower)) /
                DESIRED_POINTS_PER_GRAPH
            )
          ),
        },
      })
    }
  }

  const setPeriod = _period => {
    update({
      aggregateWindow: {
        ...data.aggregateWindow,
        period: _period,
      },
    })
  }

  const selectFn = fn => {
    if (isAutoFunction) {
      update({
        functions: [{name: fn}],
      })
      return
    }

    const fns = [...data.functions]
    const fnsFound = fns.map(f => f.name).indexOf(fn)
    if (fnsFound !== -1) {
      fns.splice(fnsFound, 1)
      update({
        functions: fns,
      })
    } else {
      update({
        functions: [...fns, {name: fn}],
      })
    }
  }
  const setFnMode = (mode: 'custom' | 'auto') => {
    if (mode === 'custom') {
      setIsAutoFunction(false)
      return
    }
    const newFunctions = data.functions.filter(f =>
      AUTO_FUNCTIONS.map(fn => fn.name).includes(f.name)
    )
    if (newFunctions.length === 0) {
      update({
        functions: [{name: AUTO_FUNCTIONS[0].name}],
      })
    } else {
      update({
        functions: [{name: newFunctions[0].name}],
      })
    }
    setIsAutoFunction(true)
  }

  return (
    <BuilderCard className="aggregation-selector" testID="aggregation-selector">
      <BuilderCard.Header
        title="Window Period"
        className="aggregation-selector-header"
      />
      <BuilderCard.Body
        scrollable={false}
        addPadding={false}
        className="aggregation-selector-body"
      >
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.Stretch}
          margin={ComponentSize.ExtraSmall}
          stretchToFitWidth={true}
        >
          <SelectGroup
            shape={ButtonShape.StretchToFit}
            size={ComponentSize.ExtraSmall}
          >
            <SelectGroup.Option
              name="custom"
              id="custom-window-period"
              testID="custom-window-period"
              active={period !== 'auto'}
              value="custom"
              onClick={setPeriodMode}
              titleText="Custom"
            >
              Custom
            </SelectGroup.Option>
            <SelectGroup.Option
              name="auto"
              id="auto-window-period"
              testID="auto-window-period"
              active={period === 'auto'}
              value="auto"
              onClick={setPeriodMode}
              titleText="Auto"
            >
              Auto
            </SelectGroup.Option>
          </SelectGroup>
          <DurationInput
            onSubmit={setPeriod}
            value={durationDisplay}
            suggestions={DURATIONS}
            submitInvalid={false}
            status={
              period === 'auto'
                ? ComponentStatus.Disabled
                : ComponentStatus.Default
            }
          />
          <FlexBox
            direction={FlexDirection.Row}
            margin={ComponentSize.ExtraSmall}
            stretchToFitWidth
          >
            <Toggle
              id="isFillValues"
              type={InputToggleType.Checkbox}
              checked={fillValues}
              onChange={toggleFill}
              color={ComponentColor.Primary}
              size={ComponentSize.ExtraSmall}
            />
            <FlexBox.Child grow={1}>
              <InputLabel className="fill-values-checkbox--label">
                Fill missing values
              </InputLabel>
            </FlexBox.Child>
            <QuestionMarkTooltip
              diameter={16}
              tooltipContents="For windows without data, create an empty window and fill it with a null aggregate value"
              tooltipStyle={{fontSize: '13px', padding: '8px'}}
            />
          </FlexBox>
        </FlexBox>
      </BuilderCard.Body>
      <BuilderCard.Header
        title="Aggregate Function"
        className="aggregation-selector-header"
      />
      <BuilderCard.Menu className="aggregation-selector-menu">
        <FlexBox
          direction={FlexDirection.Column}
          margin={ComponentSize.ExtraSmall}
          alignItems={AlignItems.Stretch}
        >
          <SelectGroup
            shape={ButtonShape.StretchToFit}
            size={ComponentSize.ExtraSmall}
          >
            <SelectGroup.Option
              name="custom"
              id="custom-function"
              testID="custom-function"
              active={!isAutoFunction}
              value="custom"
              onClick={setFnMode}
              titleText="Custom"
            >
              Custom
            </SelectGroup.Option>
            <SelectGroup.Option
              name="auto"
              id="auto-function"
              testID="auto-function"
              active={isAutoFunction}
              value="auto"
              onClick={setFnMode}
              titleText="Auto"
            >
              Auto
            </SelectGroup.Option>
          </SelectGroup>
        </FlexBox>
      </BuilderCard.Menu>
      <SelectorList
        items={fnList}
        selectedItems={data.functions.map(fn => fn.name)}
        onSelectItem={selectFn}
        multiSelect={!isAutoFunction}
      />
    </BuilderCard>
  )
}

export default AggregationSelector
