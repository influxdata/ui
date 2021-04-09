import React, {FC, useCallback, useContext, useMemo} from 'react'
import {
  FlexBox,
  FlexDirection,
  ComponentSize,
  InputLabel,
  IconFont,
  ComponentColor,
  Toggle,
  InputToggleType,
  QuestionMarkTooltip,
  ComponentStatus,
  MultiSelectDropdown,
} from '@influxdata/clockface'

import {DURATIONS, FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

import {PipeContext} from 'src/flows/context/pipe'
import DurationInput from 'src/shared/components/DurationInput'

import {PipeProp} from 'src/types/flows'

const AVAILABLE_FUNCTIONS = FUNCTIONS.map(f => f.name)

const Downsample: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const options = useMemo(() => {
    if (!data.functions || !data.functions.length) {
      return [{name: 'mean'}].map(f => f.name)
    }
    return data.functions.map(f => f.name)
  }, [data.functions])

  const selectFn = useCallback(
    (fn: string) => {
      const fns = options.map(f => ({name: f}))
      let found = false
      let fnIdx = fns.findIndex(f => f.name === fn)

      while (fnIdx !== -1) {
        found = true
        fns.splice(fnIdx, 1)
        fnIdx = fns.findIndex(f => f.name === fn)
      }

      if (!found) {
        fns.push({name: fn})
      }

      if (!fns.length) {
        fns.push({name: 'mean'})
      }

      update({
        functions: fns,
      })
    },
    [options, update]
  )

  const setPeriod = _period => {
    update({
      aggregateWindow: {
        ...data.aggregateWindow,
        period: _period,
      },
    })
  }

  const toggleFill = () => {
    update({
      aggregateWindow: {
        ...data.aggregateWindow,
        fillValues: !data.aggregateWindow.fillValues,
      },
    })
  }

  return (
    <Context>
      <div className="downsample-panel">
        <div className="downsample-panel--left">
          <h5>Apply aggregate</h5>
          <MultiSelectDropdown
            emptyText="Select"
            style={{width: '250px'}}
            options={AVAILABLE_FUNCTIONS}
            selectedOptions={options}
            onSelect={selectFn}
            buttonColor={ComponentColor.Secondary}
            buttonIcon={IconFont.BarChart}
          />
        </div>
        <div className="downsample-panel--right">
          <h5>Every Window Period</h5>
          <DurationInput
            onSubmit={setPeriod}
            placeholder="ex: 3h30s"
            value={data.aggregateWindow.period}
            suggestions={DURATIONS}
            submitInvalid={false}
            status={ComponentStatus.Default}
          />
          <FlexBox
            direction={FlexDirection.Row}
            margin={ComponentSize.ExtraSmall}
            stretchToFitWidth
          >
            <Toggle
              id="isFillValues"
              type={InputToggleType.Checkbox}
              checked={data.aggregateWindow.fillValues}
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
        </div>
      </div>
    </Context>
  )
}

export default Downsample
