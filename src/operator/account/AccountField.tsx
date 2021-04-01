import React, {FC} from 'react'
import {TextBlock} from '@influxdata/clockface'

interface Props {
  header: string
  body: string
  testID: string
}
const AccountField: FC<Props> = ({header, body, testID}) => {
  return (
    <>
      <TextBlock
        className="account-grid-text heading"
        text={header}
        testID={`${testID}-header`}
      />
      <TextBlock
        className="account-grid-text body"
        text={body}
        testID={`${testID}-body`}
      />
    </>
  )
}

export default AccountField
