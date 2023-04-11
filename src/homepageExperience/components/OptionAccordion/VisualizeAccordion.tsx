// Libraries
import React, {FC} from 'react'

// Components
import {
  ComponentSize,
  IconFont,
  InfluxColors,
  LinkButton,
} from '@influxdata/clockface'
import {OptionAccordion} from 'src/homepageExperience/components/OptionAccordion/OptionAccordion'
import {OptionAccordionElement} from 'src/homepageExperience/components/OptionAccordion/OptionAccordionElement'

export const VisualizeAccordion: FC = () => {
  return (
    <OptionAccordion
      headerIcon={IconFont.GraphLine_New}
      headerIconColor={InfluxColors.Galaxy}
      headerTitle="Visualize & Alert"
      headerDescription="Integrate with 3rd party tools to visualize your data or set up alerts."
      bodyContent={
        <>
          <OptionAccordionElement
            elementTitle="Pandas"
            elementDescription="Use Pandas to analyze, process, and visualize your data."
            cta={() => {
              return (
                <LinkButton
                  text="View Pandas Docs"
                  size={ComponentSize.ExtraSmall}
                  href="https://docs.influxdata.com/influxdb/cloud-iox/query-data/tools/pandas/"
                  target="_blank"
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Grafana"
            elementDescription="Set up Grafana to visualize and alert on your data."
            cta={() => {
              return (
                <LinkButton
                  text="View Grafana Docs"
                  size={ComponentSize.ExtraSmall}
                  href="https://docs.influxdata.com/influxdb/cloud-iox/query-data/tools/grafana/"
                  target="_blank"
                />
              )
            }}
          />
          <OptionAccordionElement
            elementTitle="Superset"
            elementDescription="Set up Superset to visualize and alert on your data."
            cta={() => {
              return (
                <LinkButton
                  text="View Superset Docs"
                  size={ComponentSize.ExtraSmall}
                  href="https://docs.influxdata.com/influxdb/cloud-iox/query-data/tools/superset/"
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
