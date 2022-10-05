// Libraries
import React, {FC} from 'react'
import {Columns, Form, Grid, Input} from '@influxdata/clockface'

// Components
import ThresholdsSettings from 'src/visualization/components/internal/ThresholdsSettings'
import {DecimalPlaces} from 'src/visualization/components/internal/DecimalPlaces'

// Types
import {GaugeViewProperties} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

interface Props extends VisualizationOptionProps {
  properties: GaugeViewProperties
}

export const GaugeOptions: FC<Props> = ({properties, update}) => (
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
          <DecimalPlaces
            isEnforced={properties?.decimalPlaces?.isEnforced === true}
            digits={
              typeof properties?.decimalPlaces?.digits === 'number' ||
              properties?.decimalPlaces?.digits === null
                ? properties.decimalPlaces.digits
                : NaN
            }
            update={update}
          />
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
