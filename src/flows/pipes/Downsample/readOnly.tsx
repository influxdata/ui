// Libraries
import React, {FC, useContext} from 'react'
import {
  FlexBox,
  FlexDirection,
  ComponentSize,
  Input,
  InputType,
  InputLabel,
  IconFont,
  ComponentColor,
  Toggle,
  InputToggleType,
  QuestionMarkTooltip,
  ComponentStatus,
  Dropdown,
} from '@influxdata/clockface'

import {PipeContext} from 'src/flows/context/pipe'

import {PipeProp} from 'src/types/flows'

const Downsample: FC<PipeProp> = ({Context}) => {
  const {data} = useContext(PipeContext)

  return (
    <Context>
      <div className="downsample-panel">
        <div className="downsample-panel--left">
          <h5>Apply aggregate</h5>
          <Dropdown
            button={(active, onClick) => (
              <Dropdown.Button
                onClick={onClick}
                active={active}
                icon={IconFont.BarChart_New}
                color={ComponentColor.Secondary}
                status={ComponentStatus.Disabled}
              >
                {data.functions.map(f => f.name).join(', ')}
              </Dropdown.Button>
            )}
            menu={onCollapse => <Dropdown.Menu onCollapse={onCollapse} />}
            style={{width: '250px'}}
          />
        </div>
        <div className="downsample-panel--right">
          <h5>Every Window Period</h5>
          <Input
            name="period"
            type={InputType.Text}
            placeholder="ex: 3h30s"
            value={data.aggregateWindow.period}
            status={ComponentStatus.Disabled}
            size={ComponentSize.Medium}
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
              onChange={() => {}}
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
