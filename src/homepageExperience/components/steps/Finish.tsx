import React, {useEffect} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  Icon,
  IconFont,
  ResourceCard,
} from '@influxdata/clockface'

import {
  InfluxDBUniversityIcon,
  VSCodePluginIcon,
} from 'src/homepageExperience/components/HomepageIcons'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {event} from 'src/cloud/utils/reporting'

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
      <p>Curious to learn more? Try these next steps!</p>
      <FlexBox margin={ComponentSize.Medium} alignItems={AlignItems.Stretch}>
        <ResourceCard className="homepage-wizard-next-steps">
          <SafeBlankLink href="https://influxdbu.com/">
            <h4>{InfluxDBUniversityIcon}InfluxDB University</h4>
          </SafeBlankLink>
          <p>
            Our free hands-on courses teach you the technical skills and best
            practices to get the most out of your real-time data with InfluxDB."
          </p>
        </ResourceCard>
        <ResourceCard className="homepage-wizard-next-steps">
          <SafeBlankLink href="https://docs.influxdata.com/influxdb/cloud/tools/flux-vscode">
            <h4>{VSCodePluginIcon}Install VSCode Plugin</h4>
          </SafeBlankLink>
          <p>Streamline your workflow even further with our VSCode plugin!</p>
        </ResourceCard>
        <ResourceCard className="homepage-wizard-next-steps">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              height: '100%',
              textTransform: 'uppercase',
            }}
          >
            <h5>
              More Options{' '}
              <Icon
                glyph={IconFont.ArrowRight_New}
                style={{marginLeft: '9px'}}
              />
            </h5>
          </div>
        </ResourceCard>
      </FlexBox>

      <p style={{marginTop: '150px'}}>
        What did you think about the set up process? Give us feedback to improve
      </p>
    </>
  )
}
