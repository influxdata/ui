// Libraries
import React, {PureComponent} from 'react'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

const supportLinks = [
  {
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/`,
    title: '📜 Documentation',
  },
  {link: 'https://community.influxdata.com', title: '💭 Community Forum'},
  {
    link:
      'https://github.com/influxdata/influxdb/issues/new?template=feature_request.md',
    title: '✨ Feature Requests',
  },
  {
    link: 'https://github.com/influxdata/ui/issues/new',
    title: '🐛 Report a bug',
  },
]

export default class SupportLinks extends PureComponent {
  public render() {
    return (
      <ul className="useful-links">
        {supportLinks.map(({link, title}) => (
          <li key={title}>
            <a href={link} target="_blank" rel="noreferrer">
              {title}
            </a>
          </li>
        ))}
      </ul>
    )
  }
}
