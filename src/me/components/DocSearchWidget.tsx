// Libraries
import React, {FC} from 'react'

// Components
import DocSearch, {DocSearchType} from 'src/shared/search/DocSearch'

// Constants
import {CLOUD} from 'src/shared/constants'
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {event, normalizeEventName} from 'src/cloud/utils/reporting'

import 'src/me/components/DocSearchWidget.scss'

const supportLinks = [
  {
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/query-data/get-started/`,
    title: 'Get Started with Flux',
  },
  {
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/query-data/execute-queries/data-explorer/`,
    title: 'Explore Metrics',
  },
  {
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/visualize-data/dashboards/`,
    title: 'Build a Dashboard',
  },
  {
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/process-data/get-started/`,
    title: 'Write a Task',
  },
  {
    link: 'https://github.com/influxdata/ui/issues/new',
    title: 'Report a bug',
  },
  {link: 'https://community.influxdata.com', title: 'Community Forum'},
  {
    link:
      'https://github.com/influxdata/influxdb/issues/new?template=feature_request.md',
    title: 'Feature Requests',
  },
]

if (CLOUD && isFlagEnabled('requestPoc')) {
  supportLinks.push({
    link: 'https://www.influxdata.com/proof-of-concept/',
    title: 'Request Proof of Concept',
  })
}

const handleEventing = title => {
  const eventDescription = normalizeEventName(title)
  event(`HomePage.${eventDescription}.clicked`)
}

const DocSearchWidget: FC = () => {
  return (
    <div className="WidgetSearch">
      <DocSearch type={DocSearchType.Widget} />
      <p className="WidgetHelperText">Press CTRL + M on any page to search</p>
      <div className="useful-links">
        <h4 style={{textTransform: 'uppercase'}}>Useful Links</h4>
        <ul className="docslinks-list">
          {supportLinks.map(({link, title}) => (
            <li key={title}>
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleEventing(title)}
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
