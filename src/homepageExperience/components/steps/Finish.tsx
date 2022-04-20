import React, {useEffect} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  ResourceCard,
} from '@influxdata/clockface'

import {
  BookIcon,
  CodeTerminalIcon,
} from 'src/homepageExperience/components/HomepageIcons'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'
import FeedbackBar from 'src/homepageExperience/components/FeedbackBar'

type OwnProps = {
  wizardEventName: string
}

export const Finish = (props: OwnProps) => {
  useEffect(() => {
    event(`firstMile.${props.wizardEventName}.finished`)
  }, [])
  return (
    <>
      <h1>Congrats!</h1>
      <p>You completed setting up, writing, and querying data.</p>
      <FeedbackBar wizardEventName={props.wizardEventName} />
      <p style={{marginTop: '80px'}}>
        Curious to learn more? Try these next steps!
      </p>
      <FlexBox margin={ComponentSize.Medium} alignItems={AlignItems.Stretch}>
        <ResourceCard className="homepage-wizard-next-steps">
          <SafeBlankLink href="">
            <h4>{CodeTerminalIcon}Sample App</h4>
          </SafeBlankLink>
          <p>
            Play around with our template code of sample app to streamline your
            own data into InfluxData.
          </p>
        </ResourceCard>
        <ResourceCard className="homepage-wizard-next-steps">
          <SafeBlankLink href="https://docs.influxdata.com">
            <h4>{BookIcon}Key Concepts</h4>
          </SafeBlankLink>
          <p>Learn about important concepts for writing time-series data.</p>
        </ResourceCard>
        <ResourceCard className="homepage-wizard-next-steps">
          <SafeBlankLink href="https://influxdbu.com/">
            <h4>{CodeTerminalIcon}InfluxDB University</h4>
          </SafeBlankLink>
          <p>
            Our free hands-on courses teach you the technical skills and best
            practices to get the most out of your real-time data with InfluxDB.
          </p>
        </ResourceCard>
      </FlexBox>
    </>
  )
}
