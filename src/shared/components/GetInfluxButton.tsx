import React, {FC} from 'react'
import {
  ComponentSize,
  IconFont,
  ComponentColor,
  ButtonShape,
  Button,
} from '@influxdata/clockface'

import {safeBlankLinkOpen} from 'src/utils/safeBlankLinkOpen'

interface OwnProps {
  hasIcon?: boolean
}

const handleSignUpClick = () => {
  safeBlankLinkOpen('https://cloud2.influxdata.com/signup')
}
const GetInfluxButton: FC<OwnProps> = ({hasIcon}) => {
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
