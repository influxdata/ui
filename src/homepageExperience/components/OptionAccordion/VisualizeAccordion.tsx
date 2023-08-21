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

  const handleTableauClick = () => {
    event(`homeOptions.${optionId}.tableauDocs.clicked`)
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
                  href="https://docs.influxdata.com/influxdb/cloud-serverless/process-data/tools/pandas/"
                  onClick={handlePandasClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle={
              <>
                Grafana{' '}
                <strong className="option-accordion--tag">
                  New cloud plugin available
                </strong>
              </>
            }
            elementDescription="Set up Grafana Local or Grafana Cloud to visualize and alert on your data."
            cta={() => {
              return (
                <OptionLink
                  title="View Grafana Docs"
                  href="https://docs.influxdata.com/influxdb/cloud-serverless/process-data/visualize/grafana/"
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
                  href="https://docs.influxdata.com/influxdb/cloud-serverless/process-data/visualize/superset/"
                  onClick={handleSupersetClick}
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Tableau"
            elementDescription="Set up Tableau to visualize and alert on your data."
            cta={() => {
              return (
                <OptionLink
                  title="View Tableau Docs"
                  href="https://docs.influxdata.com/influxdb/cloud-serverless/process-data/visualize/tableau/"
                  onClick={handleTableauClick}
                />
              )
            }}
          />
        </>
      }
    />
  )
}
