// Libraries
import React, {FC} from 'react'

// Components
import {IconFont, InfluxColors} from '@influxdata/clockface'
import {OptionAccordion} from 'src/homepageExperience/components/OptionAccordion/OptionAccordion'
import {OptionAccordionElement} from 'src/homepageExperience/components/OptionAccordion/OptionAccordionElement'
import {OptionLink} from './OptionLink'

// Utils
import {event} from 'src/cloud/utils/reporting'

export const VisualizeAccordion: FC = () => {
  const optionId = 'visualizeAlert'

  const handlePandasClick = () => {
    event(`homeOptions.${optionId}.pandasDocs.clicked`)
  }

  const handleGrafanaClick = () => {
    event(`homeOptions.${optionId}.grafanaDocs.clicked`)
  }

  const handleSupersetClick = () => {
    event(`homeOptions.${optionId}.supersetDocs.clicked`)
  }

  return (
    <OptionAccordion
      headerIcon={IconFont.GraphLine_New}
      headerIconColor={InfluxColors.Galaxy}
      headerTitle="Visualize & Alert"
      headerDescription="Integrate with 3rd party tools to visualize your data or set up alerts."
      optionId="visualizeAlert"
      bodyContent={
        <>
          <OptionAccordionElement
            elementTitle="Pandas"
            elementDescription="Use Pandas to analyze, process, and visualize your data."
            cta={() => {
              return (
                <OptionLink
                  title="View Pandas Docs"
                  href="https://docs.influxdata.com/influxdb/cloud-iox/query-data/tools/pandas/"
                  onClick={handlePandasClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Grafana"
            elementDescription="Set up Grafana to visualize and alert on your data."
            cta={() => {
              return (
                <OptionLink
                  title="View Grafana Docs"
                  href="https://docs.influxdata.com/influxdb/cloud-iox/query-data/tools/grafana/"
                  onClick={handleGrafanaClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Superset"
            elementDescription="Set up Superset to visualize and alert on your data."
            cta={() => {
              return (
                <OptionLink
                  title="View Superset Docs"
                  href="https://docs.influxdata.com/influxdb/cloud-iox/query-data/tools/superset/"
                  onClick={handleSupersetClick}
                />
              )
            }}
          />
        </>
      }
    />
  )
}
