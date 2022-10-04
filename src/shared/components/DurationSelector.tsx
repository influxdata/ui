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
import {ruleToString} from 'src/utils/formatting'

export interface DurationOption {
  duration: string
  displayText: string
}

interface Props {
  selectedDurationInSeconds: string
  onSelectDuration: (duration: string) => any
  durations: DurationOption[]
  disabled?: boolean
  status?: ComponentStatus
}

const durationUnits = ['day', 'month', 'year']

// returns plural version of the unit if value is greater than 1
// Examples: 1 day, 1 month, 12 days, 30 years
const pluralizeUnitIfNeeded = (unit: string, value: number) => {
  if (value > 1) {
    return `${unit}s`
  }
  return unit
}

const DurationSelector: FunctionComponent<Props> = ({
  selectedDurationInSeconds,
  onSelectDuration,
  durations,
  disabled = false,
  status = ComponentStatus.Default,
}) => {
  let resolvedDurations = durations
  let selected: DurationOption = durations.find(
    d =>
      selectedDurationInSeconds === d.duration ||
      areDurationsEqual(selectedDurationInSeconds, d.duration)
  )

  const selectedDurationMagnitude =
    Number(selectedDurationInSeconds.slice(0, -1)) || 0
  if (!selected) {
    selected = {
      duration: selectedDurationInSeconds,
      displayText: ruleToString(selectedDurationMagnitude),
    }
    resolvedDurations = [selected, ...resolvedDurations]
  }

  const defaultCustomDurationValue = 2
  const defaultCustomDurationUnit = durationUnits[0] // day(s)
  const [customDurationClicked, setCustomDurationClicked] = useState(false)
  const [customDurationUnit, setCustomDurationUnit] = useState<string>(
    defaultCustomDurationUnit
  )
  const [customDurationValue, setCustomDurationValue] = useState<number>(
    defaultCustomDurationValue
  )

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
  const timeInputComponentStyle = {width: '175px'}
  const customDurationContainerStyle = {marginTop: '16px'}
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
              value="Custom"
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
                  (selectedDurationInSeconds === duration ||
                    areDurationsEqual(selectedDurationInSeconds, duration)) &&
                  !customDurationClicked
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
          style={customDurationContainerStyle}
        >
          <p style={{marginLeft: '12px'}}>
            Enter your custom retention duration:
          </p>
          <TimeInput
            style={timeInputComponentStyle}
            onChange={durationValue => {
              const zeroNotAllowed = Number(durationValue)
              setCustomDurationValue(zeroNotAllowed)
            }}
            value={customDurationValue.toString()}
            onSelectUnit={unit => {
              setCustomDurationUnit(unit)
            }}
            selectedUnit={pluralizeUnitIfNeeded(
              customDurationUnit,
              customDurationValue
            )}
            units={durationUnits}
            status={
              status === ComponentStatus.Valid
                ? ComponentStatus.Default
                : status
            }
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
