import React, {FC, useContext} from 'react'
import {
  Grid,
  Columns,
  FlexBox,
  FlexDirection,
  ComponentSize,
  AlignItems,
  InputLabel,
  ComponentColor,
  Toggle,
  InputToggleType,
  QuestionMarkTooltip,
  ComponentStatus,
} from '@influxdata/clockface'

import {DURATIONS, FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

import {PipeContext} from 'src/flows/context/pipe'
import SelectorList from 'src/timeMachine/components/SelectorList'
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
        <Grid>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
              <FlexBox
                direction={FlexDirection.Column}
                alignItems={AlignItems.Stretch}
                margin={ComponentSize.ExtraSmall}
                stretchToFitWidth={true}
              >
                <h5>Window Period</h5>
                <DurationInput
                  onSubmit={setPeriod}
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
              </FlexBox>
            </Grid.Column>
            <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
              <FlexBox
                direction={FlexDirection.Column}
                alignItems={AlignItems.Stretch}
                margin={ComponentSize.ExtraSmall}
                stretchToFitWidth={true}
              >
                <h5>Aggregate Function</h5>
                <SelectorList
                  items={FUNCTIONS.map(f => f.name)}
                  selectedItems={data.functions.map(fn => fn.name)}
                  onSelectItem={selectFn}
                  multiSelect={true}
                />
              </FlexBox>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    </Context>
  )
}

export default Downsample
