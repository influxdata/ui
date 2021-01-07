import React, {FC} from 'react'

import {
  Button,
  ComponentSize,
  ComponentColor,
  FlexBox,
  AlignItems,
  JustifyContent,
  FlexDirection,
  ButtonType,
  Panel,
  ComponentStatus,
} from '@influxdata/clockface'

interface Props {
  hide: boolean
  onNextStep: () => void
  confirmText: string
  color?: ComponentColor
  buttonStatus?: ComponentStatus
}

const BillingPanelFooter: FC<Props> = ({
  hide,
  onNextStep,
  confirmText,
  color = ComponentColor.Primary,
  buttonStatus,
}) => {
  const goToBilling = () => (window.location.href = '/billing')

  if (hide) {
    return null
  }

  return (
    <Panel.Footer>
      <FlexBox
        alignItems={AlignItems.Center}
        justifyContent={JustifyContent.Center}
        direction={FlexDirection.Row}
      >
        <Button
          text="Cancel"
          color={ComponentColor.Default}
          size={ComponentSize.Large}
          onClick={goToBilling}
          type={ButtonType.Button}
        />
        <div style={{marginLeft: '4px'}}>
          <Button
            text={confirmText}
            size={ComponentSize.Large}
            color={color}
            onClick={onNextStep}
            type={ButtonType.Submit}
            status={buttonStatus}
          />
        </div>
      </FlexBox>
    </Panel.Footer>
  )
}

export default BillingPanelFooter
