import React, {FC, useContext} from 'react'
import {
  Button,
  ComponentColor,
  ComponentSize,
  IconFont,
} from '@influxdata/clockface'
import {PopupContext} from 'src/flows/context/popup'
import {ShareLinkOverlay} from 'src/flows/shared/ShareLinkOverlay'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {PROJECT_NAME} from 'src/flows'

const ShareButton: FC = () => {
  const {launch} = useContext(PopupContext)

  const handleShare = () => {
    event('Share Button Toggled')
    launch(<ShareLinkOverlay />, {
      bucket: '',
      query: '',
    })
  }

  const text = `Share ${PROJECT_NAME}`

  return (
    <Button
      text={text}
      icon={IconFont.Share}
      color={ComponentColor.Secondary}
      size={ComponentSize.ExtraSmall}
      titleText={text}
      testID="flow-button--share"
      onClick={handleShare}
      className="flow-button--share"
    />
  )
}

export default ShareButton
