// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'

// Components
import {
  Button,
  ComponentSize,
  IconFont,
  LinkButton,
} from '@influxdata/clockface'
import {OptionAccordion} from 'src/homepageExperience/components/OptionAccordion/OptionAccordion'
import {OptionAccordionElement} from 'src/homepageExperience/components/OptionAccordion/OptionAccordionElement'

// Utils
import {useSelector} from 'react-redux'
import {getOrg} from 'src/organizations/selectors'

export const ManageDatabasesAccordion: FC = () => {
  const orgID = useSelector(getOrg).id
  const history = useHistory()

  const handleDatabaseManagerClick = () => {
    history.push(`/orgs/${orgID}/load-data/buckets`)
  }

  const handleTokenManagerClick = () => {
    history.push(`/orgs/${orgID}/load-data/tokens`)
  }

  return (
    <OptionAccordion
      headerIcon={IconFont.Layers}
      headerIconColor="#5EE4E4"
      headerTitle="Manage Databases & Security"
      headerDescription="Create and manage your buckets (databases) &amp; access tokens."
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
                <LinkButton
                  text="View API Docs"
                  size={ComponentSize.ExtraSmall}
                  href="https://docs.influxdata.com/influxdb/cloud-iox/admin/buckets/create-bucket/?t=InfluxDB+API"
                  target="_blank"
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="CLI"
            elementDescription="Use the InfluxDB Command Line Interface to manage your databases."
            cta={() => {
              return (
                <LinkButton
                  text="View CLI Docs"
                  size={ComponentSize.ExtraSmall}
                  href="https://docs.influxdata.com/influxdb/cloud-iox/admin/buckets/create-bucket/?t=influx+CLI"
                  target="_blank"
                />
              )
            }}
          />
        </>
      }
    />
  )
}
