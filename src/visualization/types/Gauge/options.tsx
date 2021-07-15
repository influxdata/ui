import React, {FC} from 'react'

import {
  Grid,
  Columns,
  Form,
  AutoInput,
  AutoInputMode,
  Input,
  InputType,
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
              <Form.Element label="Value Prefix">
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
              <Form.Element label="Value Suffix">
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
              <Form.Element label="Axis Prefix">
                <Input
                  testID="tick-prefix-input"
                  value={properties.tickPrefix}
                  onChange={evt => {
                    update({tickPrefix: evt.target.value})
                  }}
                  placeholder="%, MPH, etc."
                />
              </Form.Element>
            </Grid.Column>
            <Grid.Column widthXS={Columns.Six}>
              <Form.Element label="Axis Suffix">
                <Input
                  testID="tick-suffix-input"
                  value={properties.tickSuffix}
                  onChange={evt => {
                    update({tickSuffix: evt.target.value})
                  }}
                  placeholder="%, MPH, etc."
                />
              </Form.Element>
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
