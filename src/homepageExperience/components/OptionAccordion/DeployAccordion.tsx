// Libraries
import React, {FC} from 'react'

// Components
import {IconFont, InfluxColors} from '@influxdata/clockface'
import {OptionAccordion} from 'src/homepageExperience/components/OptionAccordion/OptionAccordion'
import {OptionAccordionElement} from 'src/homepageExperience/components/OptionAccordion/OptionAccordionElement'
import {OptionLink} from './OptionLink'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const DeployAccordion: FC = () => {
  const optionId = 'deployInstance'

  const handleServerlessClick = () => {
    event(`homeOptions.${optionId}.serverless.clicked`)
  }

  const handleDedicatedClick = () => {
    event(`homeOptions.${optionId}.dedicated.clicked`)
  }

  const handleClusteredClick = () => {
    event(`homeOptions.${optionId}.clustered.clicked`)
  }

  return (
    <OptionAccordion
      headerIcon={IconFont.Cube}
      headerIconColor={InfluxColors.Star}
      headerTitle="Deploy"
      headerDescription="Run InfluxDB where you need it."
      optionId="deployInstance"
      bodyContent={
        <>
          <OptionAccordionElement
            elementTitle="Cloud Serverless"
            elementDescription="A fully managed, elastic, multi-tenant service best for smaller workloads."
            cta={() => {
              return (
                <OptionLink
                  title="Learn More"
                  href="https://docs.influxdata.com/influxdb/cloud-serverless/"
                  onClick={handleServerlessClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Cloud Dedicated"
            elementDescription="A fully managed, single-tenant service for high volume production workloads."
            cta={() => {
              return (
                <OptionLink
                  title="Learn More"
                  href="https://docs.influxdata.com/influxdb/cloud-dedicated/"
                  onClick={handleDedicatedClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Clustered"
            elementDescription="A self-managed database for on-premises or private cloud deployments."
            cta={() => {
              return (
                <OptionLink
                  title="Learn More"
                  href="https://docs.influxdata.com/influxdb/clustered/"
                  onClick={handleClusteredClick}
                />
              )
            }}
          />
        </>
      }
    />
  )
}
