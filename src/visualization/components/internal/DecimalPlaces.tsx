// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  AutoInput,
  AutoInputMode,
  Form,
  Input,
  InputType,
} from '@influxdata/clockface'

// Utils
import {convertUserInputToNumOrNaN} from 'src/shared/utils/convertUserInput'

// Constants
import {
  MIN_DECIMAL_PLACES,
  MAX_DECIMAL_PLACES,
} from 'src/visualization/constants'

interface DecimalPlacesProps {
  isEnforced: boolean
  digits: number
  update: (obj: any) => void
}

export const DecimalPlaces: FC<DecimalPlacesProps> = (
  props: DecimalPlacesProps
) => {
  const {isEnforced, digits, update} = props
  const [decimalPlaces, setDecimalPlaces] = useState<number | null>(digits)

  const setDigits = (updatedDigits: number | null) => {
    setDecimalPlaces(updatedDigits)
    if (!Number.isNaN(updatedDigits)) {
      update({
        decimalPlaces: {
          isEnforced,
          digits: updatedDigits,
        },
      })
    }
  }

  const handleChangeMode = (mode: AutoInputMode): void => {
    if (mode === AutoInputMode.Auto) {
      setDigits(null)
    } else {
      setDigits(2)
    }
  }

  return (
    <Form.Element label="Decimal Places">
      <AutoInput
        mode={
          typeof decimalPlaces === 'number'
            ? AutoInputMode.Custom
            : AutoInputMode.Auto
        }
        onChangeMode={handleChangeMode}
        inputComponent={
          <Input
            name="decimal-places"
            placeholder="Enter a number"
            onChange={event => {
              setDigits(convertUserInputToNumOrNaN(event))
            }}
            value={decimalPlaces}
            min={MIN_DECIMAL_PLACES}
            max={MAX_DECIMAL_PLACES}
            type={InputType.Number}
          />
        }
      />
    </Form.Element>
  )
}
