// Libraries
import React, {FC} from 'react'

// Components
import {
  Panel,
  LinkButton,
  ComponentColor,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'

export const CustomerSuccessLinkPanel: FC<{}> = () => {
  return (
    <Panel>
      <Panel.Header>
        <h4>Need help getting started?</h4>
      </Panel.Header>
      <Panel.Body>
        <LinkButton
          style={{textAlign: 'center'}}
          className="home-page--contact-button"
          color={ComponentColor.Primary}
          shape={ButtonShape.Default}
          size={ComponentSize.Small}
          text="Speak with an Expert"
          href="https://calendly.com/c/DFDSVZN2HL475XUF"
          target="_blank"
        />
      </Panel.Body>
    </Panel>
  )
}
