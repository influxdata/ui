// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import {Button, ComponentSize, IconFont} from '@influxdata/clockface'
import {OptionAccordion} from 'src/homepageExperience/components/OptionAccordion/OptionAccordion'
import {OptionAccordionElement} from 'src/homepageExperience/components/OptionAccordion/OptionAccordionElement'
import {OptionLink} from './OptionLink'

// Utils
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

export const ManageDatabasesAccordion: FC = () => {
  const orgID = useSelector(getOrg).id
  const history = useHistory()
  const optionId = 'manageDatabases'

  const handleDatabaseManagerClick = () => {
    event(`homeOptions.${optionId}.databaseManager.clicked`)
    history.push(`/orgs/${orgID}/load-data/buckets`)
  }

  const handleTokenManagerClick = () => {
    event(`homeOptions.${optionId}.tokenManager.clicked`)
    history.push(`/orgs/${orgID}/load-data/tokens`)
  }

  const handleAPIClick = () => {
    event(`homeOptions.${optionId}.apiDocs.clicked`)
  }

  const handleCLIClick = () => {
    event(`homeOptions.${optionId}.cliDocs.clicked`)
  }

  return (
    <OptionAccordion
      headerIcon={IconFont.Layers}
      headerIconColor="#5EE4E4"
      headerTitle="Manage Databases & Security"
      headerDescription="Create and manage your buckets (databases) &amp; access tokens."
      optionId={optionId}
      bodyContent={
        <>
          <OptionAccordionElement
            elementTitle="Database Manager"
            elementDescription="Use the built-in bucket (database) management tools to create and manage your databases."
            cta={() => {
              return (
                <Button
                  text="Go to Buckets"
                  size={ComponentSize.ExtraSmall}
                  onClick={handleDatabaseManagerClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Access Token Manager"
            elementDescription="Use the built-in token management tools to generate and manage your access tokens."
            cta={() => {
              return (
                <Button
                  text="Go to Tokens"
                  size={ComponentSize.ExtraSmall}
                  onClick={handleTokenManagerClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="API"
            elementDescription="Use the InfluxDB REST API to manage your databases."
            cta={() => {
              return (
                <OptionLink
                  href="https://docs.influxdata.com/influxdb/cloud-serverless/admin/buckets/create-bucket/?t=InfluxDB+API"
                  onClick={handleAPIClick}
                  title="View API Docs"
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="CLI"
            elementDescription="Use the InfluxDB Command Line Interface to manage your databases."
            cta={() => {
              return (
                <OptionLink
                  href="https://docs.influxdata.com/influxdb/cloud-serverless/admin/buckets/create-bucket/?t=influx+CLI"
                  onClick={handleCLIClick}
                  title="View CLI Docs"
                />
              )
            }}
          />
        </>
      }
    />
  )
}
