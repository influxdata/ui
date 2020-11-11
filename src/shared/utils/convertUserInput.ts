import React from 'react'

export const convertUserInputValueToNumOrNaN = (value?: any): number =>
  value === '' ? NaN : Number(value)

export const convertUserInputToNumOrNaN = (
  event: React.ChangeEvent<HTMLInputElement>
): number => convertUserInputValueToNumOrNaN(event.target.value)
