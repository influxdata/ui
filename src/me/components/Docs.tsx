// Libraries
import React, {PureComponent} from 'react'

// Components
import {Panel, Heading, HeadingElement, FontWeight} from '@influxdata/clockface'

const supportLinks = [
  {
    link: 'https://docs.influxdata.com/influxdb/cloud/query-data/get-started/',
    title: 'Get Started with Flux',
  },
  {
    link:
      'https://docs.influxdata.com/influxdb/cloud/query-data/execute-queries/data-explorer/',
    title: 'Explore Metrics',
  },
  {
    link:
      'https://docs.influxdata.com/influxdb/cloud/visualize-data/dashboards/',
    title: 'Build a Dashboard',
  },
  {
    link:
      'https://docs.influxdata.com/influxdb/cloud/process-data/get-started/',
    title: 'Write a Task',
  },
]

export default class SupportLinks extends PureComponent {
  public render() {
    return (
      <Panel>
        <Panel.Header>
          <Heading
            element={HeadingElement.H2}
            weight={FontWeight.Light}
            className="cf-heading__h4"
          >
            Some Handy Guides and Tutorials
          </Heading>
        </Panel.Header>
        <Panel.Body>
          <ul className="tutorials-list">
            {supportLinks.map(({link, title}) => (
              <li key={title}>
                <a href={link} target="_blank" rel="noreferrer">
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </Panel.Body>
      </Panel>
    )
  }
}
