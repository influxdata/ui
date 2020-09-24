// Libraries
import React, {FC} from 'react'
import {
  Form,
  Grid,
  Input,
  Columns,
  InputType,
  AutoInput,
  AutoInputMode,
} from '@influxdata/clockface'

// Utils
import {MIN_DECIMAL_PLACES, MAX_DECIMAL_PLACES} from 'src/dashboards/constants'
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

import {SingleStatViewProperties} from 'src/types'
import {VisOptionProps} from '../../'

interface Props extends VisOptionProps {
  properties: SingleStatViewProperties
}

const SingleStatOptions: FC<Props> = ({properties, update}) => {
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
          <Form.Element label="Decimal Places">
            <AutoInput
              mode={
                typeof properties.decimalPlaces.digits === 'number'
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
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

export default SingleStatOptions
