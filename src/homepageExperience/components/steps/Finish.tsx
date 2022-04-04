import React, {useEffect} from 'react'
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  Icon,
  IconFont,
  ResourceCard,
} from '@influxdata/clockface'
import {InfluxDBUniversityIcon, VSCodePluginIcon} from 'src/homepageExperience/components/HomepageIcons'
import {event} from 'src/cloud/utils/reporting'

export const Finish = () => {
  useEffect(() => {
    event('firstMile.pythonWizard.finished')
  }, [])
  return (
    <>
      <h1>Congrats!</h1>
      <p>You completed setting up, writing, and querying data.</p>
      <p>Curious to learn more? Try these next steps!</p>
      <FlexBox margin={ComponentSize.Medium} alignItems={AlignItems.Stretch}>
        <ResourceCard className="homepage-wizard-next-steps">
          <a href="https://influxdbu.com/" target="_blank">
            <h4>{InfluxDBUniversityIcon}InfluxDB University</h4>
          </a>
          <p>
            Our free hands-on courses teach you the technical skills and best
            practices to get the most out of your real-time data with InfluxDB."
          </p>
        </ResourceCard>
        <ResourceCard className="homepage-wizard-next-steps">
          <a
            href="https://docs.influxdata.com/influxdb/cloud/tools/flux-vscode"
            target="_blank"
          >
            <h4>{VSCodePluginIcon}Install VSCode Plugin</h4>
          </a>
          <p>Streamline your workflow even further with our VSCode plugin!</p>
        </ResourceCard>
        <ResourceCard className="homepage-wizard-next-steps">
          <div
            style={{display: 'flex', justifyContent: 'center', height: '100%'}}
          >
            <h5>
              MORE OPTIONS{' '}
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
