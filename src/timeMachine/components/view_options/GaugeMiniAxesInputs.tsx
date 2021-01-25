// Libraries
import React, {FC} from 'react'

// Components
import {
  Button,
  ButtonShape,
  Input,
  InputType,
  AlignItems,
  AutoInputMode,
  ComponentSize,
  FlexBox,
  FlexDirection,
  IconFont,
  SquareButton,
} from '@influxdata/clockface'

// Actions
import {setGaugeMiniProp} from 'src/timeMachine/actions'

import {SelectGroup as _SelectGroup} from '@influxdata/clockface'
const {SelectGroup, Option: SelectGroupOption} = _SelectGroup

type Prop = {
  axesSteps: number | 'thresholds' | number[] | undefined
  onUpdateProp: typeof setGaugeMiniProp
}

export const GaugeMiniAxesInputs: FC<Prop> = ({axesSteps, onUpdateProp}) => (
  <>
    <SelectGroup shape={ButtonShape.StretchToFit}>
      <SelectGroupOption
        active={axesSteps === undefined}
        id="select-group--axes-steps--none"
        titleText="No axes"
        value={undefined}
        onClick={() => {
          onUpdateProp({axesSteps: undefined})
        }}
      >
        None
      </SelectGroupOption>
      <SelectGroupOption
        active={axesSteps === 'thresholds'}
        id="select-group--axes-steps--thresholds"
        titleText="Axes same as thresholds"
        value={AutoInputMode.Auto}
        onClick={() => {
          onUpdateProp({axesSteps: 'thresholds'})
        }}
      >
        Thresholds
      </SelectGroupOption>
      <SelectGroupOption
        active={typeof axesSteps === 'number'}
        id="select-group--axes-steps--Steps"
        titleText="Evenly spaced steps"
        value={AutoInputMode.Custom}
        onClick={() => {
          onUpdateProp({axesSteps: 2})
        }}
      >
        Steps
      </SelectGroupOption>
      <SelectGroupOption
        active={Array.isArray(axesSteps)}
        id="select-group--axes-steps--Custom"
        titleText="Specify every one value"
        value={AutoInputMode.Custom}
        onClick={() => {
          onUpdateProp({axesSteps: []})
        }}
      >
        Custom
      </SelectGroupOption>
    </SelectGroup>
    {typeof axesSteps === 'number' && (
      <Input
        type={InputType.Number}
        value={axesSteps}
        onChange={e => onUpdateProp({axesSteps: +e.target.value})}
      />
    )}
    {Array.isArray(axesSteps) ? (
      <>
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.Stretch}
          margin={ComponentSize.Medium}
          testID="threshold-settings"
        >
          <Button
            shape={ButtonShape.StretchToFit}
            icon={IconFont.Plus}
            text="Add point"
            onClick={() => {
              onUpdateProp({axesSteps: [...axesSteps, 0]})
            }}
          />
          {axesSteps.map((step, stepIndex) => (
            <FlexBox
              direction={FlexDirection.Row}
              alignItems={AlignItems.Center}
              margin={ComponentSize.Small}
              key={stepIndex}
            >
              <Input
                id={`axes-step-input-${stepIndex}`}
                type={InputType.Number}
                value={step}
                onChange={e => {
                  onUpdateProp({
                    axesSteps: axesSteps.map((x, i) =>
                      i !== stepIndex ? x : +e.target.value
                    ),
                  })
                }}
              />
              <SquareButton
                icon={IconFont.Remove}
                onClick={() => {
                  onUpdateProp({
                    axesSteps: axesSteps.filter((_, i) => i !== stepIndex),
                  })
                }}
                style={{flex: '0 0 30px'}}
              />
            </FlexBox>
          ))}
        </FlexBox>
      </>
    ) : (
      undefined
    )}
  </>
)
