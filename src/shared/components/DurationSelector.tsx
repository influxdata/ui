// Libraries
import React, {FunctionComponent, useEffect, useState} from 'react'

// Components
import {
  ComponentStatus,
  Dropdown,
  FlexBox,
  FlexDirection,
  JustifyContent,
  TimeInput,
} from '@influxdata/clockface'

// Utils
import {areDurationsEqual} from 'src/shared/utils/duration'

export interface DurationOption {
  duration: string
  displayText: string
}

interface Props {
  selectedDuration: string
  onSelectDuration: (duration: string) => any
  durations: DurationOption[]
  disabled?: boolean
}

const durationUnits = ['d', 'mo', 'y']

const DurationSelector: FunctionComponent<Props> = ({
  selectedDuration,
  onSelectDuration,
  durations,
  disabled = false,
}) => {
  let resolvedDurations = durations
  let selected: DurationOption = durations.find(
    d =>
      selectedDuration === d.duration ||
      areDurationsEqual(selectedDuration, d.duration)
  )

  if (!selected) {
    selected = {duration: selectedDuration, displayText: selectedDuration}
    resolvedDurations = [selected, ...resolvedDurations]
  }

  const [customDurationClicked, setCustomDurationClicked] = useState(false)
  const [customDurationUnit, setCustomDurationUnit] = useState<string>(
    durationUnits[0]
  )
  const [customDurationValue, setCustomDurationValue] = useState<number>(2)

  useEffect(() => {
    if (customDurationClicked) {
      onSelectDuration(
        getCustomDurationString(customDurationValue, customDurationUnit)
      )
    }
  }, [customDurationValue, customDurationUnit, customDurationClicked])

  const getCustomDurationString = (
    durationValue: number,
    durationUnit: string
  ) => {
    return `${durationValue}${durationUnit}`
  }
  return (
    <FlexBox direction={FlexDirection.Column}>
      <Dropdown
        testID="duration-selector"
        button={(active, onClick) => (
          <Dropdown.Button
            testID="duration-selector--button"
            active={active}
            onClick={onClick}
            status={getStatus(disabled)}
          >
            {customDurationClicked ? 'Custom duration' : selected.displayText}
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu
            onCollapse={onCollapse}
            testID="duration-selector--menu"
            scrollToSelected={false}
          >
            <Dropdown.Item
              value={'Custom'}
              selected={customDurationClicked}
              onClick={() => {
                setCustomDurationClicked(true)
                onSelectDuration(
                  getCustomDurationString(
                    customDurationValue,
                    customDurationUnit
                  )
                )
              }}
            >
              Custom duration
            </Dropdown.Item>
            {resolvedDurations.map(({duration, displayText}) => (
              <Dropdown.Item
                id={duration}
                key={duration}
                value={duration}
                testID={`duration-selector--${duration}`}
                selected={
                  duration === selectedDuration && !customDurationClicked
                }
                onClick={duration => {
                  onSelectDuration(duration)
                  setCustomDurationClicked(false)
                }}
              >
                {displayText}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        )}
      />
      {customDurationClicked && (
        <FlexBox
          direction={FlexDirection.Row}
          justifyContent={JustifyContent.SpaceBetween}
          stretchToFitWidth={true}
          style={{marginTop: '8px'}}
        >
          <p style={{marginLeft: '12px'}}>Enter your custom retention duration:</p>
          <TimeInput
            style={{width: '150px'}}
            onChange={durationValue => {
              setCustomDurationValue(Number(durationValue))
            }}
            value={customDurationValue.toString()}
            onSelectUnit={unit => {
              setCustomDurationUnit(unit)
            }}
            selectedUnit={customDurationUnit}
            units={durationUnits}
          />
        </FlexBox>
      )}
    </FlexBox>
  )
}

const getStatus = (disabled: boolean): ComponentStatus => {
  if (disabled) {
    return ComponentStatus.Disabled
  }

  return ComponentStatus.Default
}

export default DurationSelector
