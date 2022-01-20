// Libraries
import React, {FC} from 'react'

// Components
import {
  FlexBox,
  Panel,
  ComponentSize,
  PanelBody,
  TextBlock,
  SelectDropdown,
  DismissButton,
  ButtonType,
  FlexDirection,
  ComponentColor,
  InfluxColors,
} from '@influxdata/clockface'

// Types
import {Threshold, ThresholdType} from 'src/types'
import {LEVEL_COLORS} from 'src/alerting/constants'

interface Props {
  threshold: Threshold
  removeLevel: () => void
  changeThresholdType: (toType: ThresholdType, within?: boolean) => void
  dataTestID: string
}

const OptionSelector = (threshold: Threshold) => {
  if (threshold.type == 'greater') {
    return 'is above'
  }
  if (threshold.type == 'lesser') {
    return 'is below'
  }
  if (threshold.within) {
    return 'is inside range'
  }
  return 'is outside range'
}

const ThresholdStatement: FC<Props> = ({
  threshold,
  children,
  removeLevel,
  changeThresholdType,
  dataTestID = 'panel',
}) => {
  const dropdownOptions = {
    ['is above']: 'greater',
    ['is below']: 'lesser',
    ['is inside range']: 'range',
    ['is outside range']: 'range',
  }

  const levelColor: string = LEVEL_COLORS[threshold.level]
  const selectedOption = OptionSelector(threshold)

  const onChangeThresholdType = (option: string) => {
    changeThresholdType(dropdownOptions[option], option === 'is inside range')
  }

  return (
    <Panel
      backgroundColor={InfluxColors.Grey15}
      style={{backgroundColor: 'rgba(51,51,70, .3)'}}
      testID={dataTestID}
    >
      <DismissButton
        color={ComponentColor.Default}
        onClick={removeLevel}
        testID="dismiss-button"
        type={ButtonType.Button}
      />
      <PanelBody testID="panel--body">
        <FlexBox
          direction={FlexDirection.Column}
          margin={ComponentSize.Small}
          testID="component-spacer"
        >
          <FlexBox
            direction={FlexDirection.Row}
            margin={ComponentSize.Small}
            stretchToFitWidth
            testID="component-spacer"
          >
            <TextBlock testID="when-value-text-block" text="When value" />
            <FlexBox.Child grow={2} testID="component-spacer--flex-child">
              <SelectDropdown
                options={Object.keys(dropdownOptions)}
                selectedOption={selectedOption}
                onSelect={onChangeThresholdType}
                testID="select-option-dropdown"
              />
            </FlexBox.Child>
          </FlexBox>
          <FlexBox
            direction={FlexDirection.Row}
            margin={ComponentSize.Small}
            stretchToFitWidth
            testID="component-spacer"
          >
            {children}
            <TextBlock testID="set-status-to-text-block" text="set status to" />
            <TextBlock
              backgroundColor={levelColor}
              testID="threshold-level-text-block"
              text={threshold.level}
            />
          </FlexBox>
        </FlexBox>
      </PanelBody>
    </Panel>
  )
}

export default ThresholdStatement
