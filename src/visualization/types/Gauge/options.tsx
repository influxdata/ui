import React, {FC} from 'react'

import {
  Grid,
  Columns,
  Form,
  Toggle,
  AutoInput,
  AutoInputMode,
  Input,
  InputType,
  InputToggleType,
  InputLabel,
  FlexBox,
  AlignItems,
  ComponentSize,
} from '@influxdata/clockface'

import ThresholdsSettings from 'src/visualization/components/internal/ThresholdsSettings'
import {
  MIN_DECIMAL_PLACES,
  MAX_DECIMAL_PLACES,
} from 'src/visualization/constants'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

import {GaugeViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

interface Props extends VisualizationOptionProps {
  properties: GaugeViewProperties
}

const GaugeOptions: FC<Props> = ({properties, update}) => {
  const setDigits = (digits: number | null) => {
    update({
      decimalPlaces: {
        ...properties.decimalPlaces,
        digits,
      },
    })
  }
  const handleChangeMode = (mode: AutoInputMode): void => {
    if (mode === AutoInputMode.Auto) {
      setDigits(null)
    } else {
      setDigits(2)
    }
  }
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Six}>
              <Form.Element label="Prefix">
                <Input
                  testID="prefix-input"
                  value={properties.prefix}
                  onChange={evt => {
                    update({prefix: evt.target.value})
                  }}
                  placeholder="%, MPH, etc."
                />
              </Form.Element>
            </Grid.Column>
            <Grid.Column widthXS={Columns.Six}>
              <Form.Element label="Suffix">
                <Input
                  testID="suffix-input"
                  value={properties.suffix}
                  onChange={evt => {
                    update({suffix: evt.target.value})
                  }}
                  placeholder="%, MPH, etc."
                />
              </Form.Element>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Six}>
              <FlexBox
                alignItems={AlignItems.Center}
                margin={ComponentSize.Small}
                className="view-options--checkbox"
              >
                <Toggle
                  id="prefixoptional"
                  testID="tickprefix-input"
                  type={InputToggleType.Checkbox}
                  value={properties.tickPrefix}
                  onChange={val => {
                    update({tickPrefix: val === 'false' || !!!val})
                  }}
                  size={ComponentSize.ExtraSmall}
                />
                <InputLabel active={!!properties.tickPrefix}>
                  Optional Prefix
                </InputLabel>
              </FlexBox>
            </Grid.Column>
            <Grid.Column widthXS={Columns.Six}>
              <FlexBox
                alignItems={AlignItems.Center}
                margin={ComponentSize.Small}
                className="view-options--checkbox"
              >
                <Toggle
                  id="suffixoptional"
                  testID="ticksuffix-input"
                  type={InputToggleType.Checkbox}
                  value={properties.tickSuffix}
                  onChange={val => {
                    update({tickSuffix: val === 'false' || !!!val})
                  }}
                  size={ComponentSize.ExtraSmall}
                />
                <InputLabel active={!!properties.tickSuffix}>
                  Optional Suffix
                </InputLabel>
              </FlexBox>
            </Grid.Column>
          </Grid.Row>
          {properties.decimalPlaces && (
            <Form.Element label="Decimal Places">
              <AutoInput
                mode={
                  properties.decimalPlaces.digits
                    ? AutoInputMode.Custom
                    : AutoInputMode.Auto
                }
                onChangeMode={handleChangeMode}
                inputComponent={
                  <Input
                    name="decimal-places"
                    placeholder="Enter a number"
                    onChange={evt => {
                      setDigits(convertUserInputToNumOrNaN(evt))
                    }}
                    value={properties.decimalPlaces.digits}
                    min={MIN_DECIMAL_PLACES}
                    max={MAX_DECIMAL_PLACES}
                    type={InputType.Number}
                  />
                }
              />
            </Form.Element>
          )}
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
          <Form.Element label="Colorized Thresholds">
            <ThresholdsSettings
              thresholds={properties.colors}
              onSetThresholds={colors => {
                update({colors})
              }}
            />
          </Form.Element>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default GaugeOptions
