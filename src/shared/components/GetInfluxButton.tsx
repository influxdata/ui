import {
  ComponentSize,
  IconFont,
  ComponentColor,
  ButtonShape,
  Button,
} from '@influxdata/clockface'
import React, {FC} from 'react'

interface OwnProps {
  hasIcon?: boolean
}

const GetInfluxButton: FC<OwnProps> = ({hasIcon}) => {
  const handleSignUpClick = () => {
    window.open('https://cloud2.influxdata.com/signup', '_blank').focus()
  }

  return (
    <Button
      icon={hasIcon ? IconFont.CuboNav : null}
      color={ComponentColor.Success}
      size={ComponentSize.Medium}
      shape={ButtonShape.Default}
      onClick={handleSignUpClick}
      text="Get InfluxDB"
      testID="sign-up--button"
    />
  )
}

export default GetInfluxButton
