import React from 'react'
import {
  convertUserInputToNumOrNaN,
  convertUserInputValueToNumOrNaN,
} from 'src/shared/utils/convertUserInput'

describe('convertUserInputToNumOrNaN', () => {
  let value
  let result

  it('should convert a number string to a number', () => {
    value = 123
    const event = {
      target: {
        value: `${value}`,
      },
    } as React.ChangeEvent<HTMLInputElement>
    expect(convertUserInputToNumOrNaN(event)).toEqual(value)
  })

  it('should convert a non-numeric, non-empty string to NaN', () => {
    const event = {
      target: {
        value: 'a number',
      },
    } as React.ChangeEvent<HTMLInputElement>

    result = convertUserInputToNumOrNaN(event)
    expect(Number.isNaN(result)).toEqual(true)
  })

  it('should convert an empty string to NaN', () => {
    const event = {
      target: {
        value: '',
      },
    } as React.ChangeEvent<HTMLInputElement>

    result = convertUserInputToNumOrNaN(event)
    expect(Number.isNaN(result)).toEqual(true)
  })

  it('should convert undefined to NaN', () => {
    const event = {
      target: {
        value: undefined,
      },
    } as React.ChangeEvent<HTMLInputElement>
    result = convertUserInputToNumOrNaN(event)
    expect(Number.isNaN(result)).toEqual(true)
  })

  it('should convert false to 0', () => {
    value = false
    const event = {
      target: {
        value,
      },
    } as React.ChangeEvent<HTMLInputElement>
    expect(convertUserInputToNumOrNaN(event)).toEqual(0)
  })

  it('should convert null to 0', () => {
    value = null
    const event = {
      target: {
        value,
      },
    } as React.ChangeEvent<HTMLInputElement>
    expect(convertUserInputToNumOrNaN(event)).toEqual(0)
  })
})

describe('convertUserInputValueToNumOrNaN', () => {
  it('should convert undefined to NaN', () => {
    expect(Number.isNaN(convertUserInputValueToNumOrNaN())).toBeTruthy()
    expect(
      Number.isNaN(convertUserInputValueToNumOrNaN(undefined))
    ).toBeTruthy()
  })

  it('should convert an object to NaN', () => {
    expect(Number.isNaN(convertUserInputValueToNumOrNaN({}))).toBeTruthy()
  })

  it('should convert a function to NaN', () => {
    expect(Number.isNaN(convertUserInputValueToNumOrNaN(() => {}))).toBeTruthy()
  })

  it('should convert a boolean to the appropriate number', () => {
    expect(convertUserInputValueToNumOrNaN(false)).toEqual(0)
    expect(convertUserInputValueToNumOrNaN(true)).toEqual(1)
  })

  it('should convert an empty string to NaN', () => {
    expect(Number.isNaN(convertUserInputValueToNumOrNaN(''))).toBeTruthy()
  })

  it('should convert a non-empty, non-numeric string to NaN', () => {
    expect(Number.isNaN(convertUserInputValueToNumOrNaN('abcd'))).toBeTruthy()
  })

  it('should convert an array to 0', () => {
    expect(convertUserInputValueToNumOrNaN([])).toEqual(0)
  })

  it('should convert null to numeric 0', () => {
    expect(convertUserInputValueToNumOrNaN(null)).toEqual(0)
  })

  it('should convert a non-empty, numeric string to a number that is not NaN', () => {
    const result = convertUserInputValueToNumOrNaN('270')
    expect(typeof result).toEqual('number')
    expect(Number.isNaN(result)).toBeFalsy()
  })
})
