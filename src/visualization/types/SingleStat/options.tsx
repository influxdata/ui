// Libraries
import React, {FC, useCallback} from 'react'
import {
  ButtonShape,
  Columns,
  Form,
  Grid,
  Input,
  SelectGroup,
} from '@influxdata/clockface'

// Components
import ThresholdsSettings from 'src/visualization/components/internal/ThresholdsSettings'
import {DecimalPlaces} from 'src/visualization/components/internal/DecimalPlaces'

// Constants
import {
  THRESHOLD_TYPE_TEXT,
  THRESHOLD_TYPE_BG,
} from 'src/shared/constants/thresholds'

// Types
import {SingleStatViewProperties, Color} from 'src/types'
import {VisualizationOptionProps} from 'src/visualization'

interface Props extends VisualizationOptionProps {
  properties: SingleStatViewProperties
}

export const SingleStatOptions: FC<Props> = ({properties, update}) => {
  const setColors = (colors: Color[]): void => {
    update({colors})
  }

  const updateThreshold = useCallback(
    (threshold: string) => {
      update({
        colors: properties.colors.map(color => {
          if (color.type !== 'scale') {
            return {
              ...color,
              type:
                threshold === THRESHOLD_TYPE_BG
                  ? THRESHOLD_TYPE_BG
                  : THRESHOLD_TYPE_TEXT,
            }
          }

          return color
        }),
      })
    },
    [update, properties.colors]
  )

  const activeSetting =
    properties.colors.filter(color => color.type !== 'scale')[0]?.type || 'text'

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
          <Grid.Row>
            <Grid.Column widthSM={Columns.Six}>
              <Form.Element label="Prefix">
                <Input
                  value={properties.prefix}
                  placeholder="%, MPH, etc."
                  onChange={evt => {
                    update({prefix: evt.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
            <Grid.Column widthSM={Columns.Six}>
              <Form.Element label="Suffix">
                <Input
                  value={properties.suffix}
                  placeholder="%, MPH, etc."
                  onChange={evt => {
                    update({suffix: evt.target.value})
                  }}
                />
              </Form.Element>
            </Grid.Column>
          </Grid.Row>
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
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
        </Grid.Column>
        <Grid.Column widthXS={Columns.Twelve} widthMD={Columns.Six}>
          <Form.Element label="Colorized Thresholds">
            <ThresholdsSettings
              thresholds={properties.colors.filter(c => c.type !== 'scale')}
              onSetThresholds={setColors}
            />
          </Form.Element>
          <Form.Element label="Colorization" style={{marginTop: '16px'}}>
            <SelectGroup shape={ButtonShape.StretchToFit}>
              <SelectGroup.Option
                name="threshold-coloring"
                titleText="background"
                id="background"
                active={activeSetting === THRESHOLD_TYPE_BG}
                onClick={updateThreshold}
                value={THRESHOLD_TYPE_BG}
              >
                Background
              </SelectGroup.Option>
              <SelectGroup.Option
                name="threshold-coloring"
                titleText="text"
                id="text"
                active={activeSetting === THRESHOLD_TYPE_TEXT}
                onClick={updateThreshold}
                value={THRESHOLD_TYPE_TEXT}
              >
                Text
              </SelectGroup.Option>
            </SelectGroup>
          </Form.Element>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}
