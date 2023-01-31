// Libraries
import React, {FC} from 'react'

// Components
import DocSearch, {DocSearchType} from 'src/shared/search/DocSearch'

// Constants
import {CLOUD} from 'src/shared/constants'
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/me/components/DocSearchWidget.scss'

const supportLinks = [
  {
    link: 'https://university.influxdata.com',
    title: 'InfluxDB University',
    eventName: 'InfluxDBUniversity',
  },
  {
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/query-data/get-started/`,
    title: 'Get Started with Flux',
    eventName: 'QueryData',
  },
  {
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/query-data/execute-queries/data-explorer/`,
    title: 'Explore Metrics',
    eventName: 'DataExplorer',
  },
  {
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/visualize-data/dashboards/`,
    title: 'Build a Dashboard',
    eventName: 'Dashboards',
  },
  {
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/process-data/get-started/`,
    title: 'Write a Task',
    eventName: 'WriteTask',
  },
  {
    link: 'https://github.com/influxdata/ui/issues/new',
    title: 'Report a bug',
    eventName: 'GitBugs',
  },
  {
    link: 'https://community.influxdata.com',
    title: 'Community Forum',
    eventName: 'Community',
  },
  {
    link: 'https://github.com/influxdata/influxdb/issues/new?template=feature_request.md',
    title: 'Feature Requests',
    eventName: 'FeatureRequest',
  },
]

if (CLOUD) {
  supportLinks.push({
    link: 'https://www.influxdata.com/proof-of-concept/',
    title: 'Request Proof of Concept',
    eventName: 'POC',
  })
}

const handleEventing = eventName => {
  event(`HomePage.${eventName}.clicked`)
}

const DocSearchWidget: FC = () => {
  return (
    <div className="WidgetSearch">
      <DocSearch type={DocSearchType.Widget} />
      <p className="WidgetHelperText">Press CTRL + M on any page to search</p>
      <div className="useful-links">
        <h4 style={{textTransform: 'uppercase'}}>Useful Links</h4>
        <ul className="docslinks-list">
          {supportLinks.map(({link, title, eventName}) => (
            <li key={title}>
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleEventing(eventName)}
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default DocSearchWidget
