import React, {FC, useContext} from 'react'
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

const Downsample: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)

  const selectFn = fn => {
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
            options={FUNCTIONS.map(f => f.name)}
            selectedOptions={data.functions.map(fn => fn.name)}
            onSelect={selectFn}
            buttonColor={ComponentColor.Secondary}
            buttonIcon={IconFont.BarChart}
          />
        </div>
        <div className="downsample-panel--right">
          <h5>Window Period</h5>
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
