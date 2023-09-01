// Libraries
import React, {FC} from 'react'

// Components
import {InfluxColors} from '@influxdata/clockface'
import {AnnouncementBlock} from 'src/me/components/AnnouncementBlock'

export const CurrentAnnouncement: FC = () => {
  const currentDate = new Date()
  const targetDate = new Date('2023-09-06T05:00:00-07:00')

  const outgoingAnnouncement = (
    <AnnouncementBlock
      body={
        <>
          <p>
            Grafana now has a community plugin that enables communication with
            Flight SQL-compatible databases.
          </p>
          <div>
            What does that mean for you?
            <ul>
              <li>InfluxDB 3.0 Support and Compatibility</li>
              <li>Easy Setup with Grafana Cloud</li>
              <li>Enhanced Data Querying and Visualization</li>
            </ul>
          </div>
        </>
      }
      ctaLink="https://www.influxdata.com/blog/now-available-flight-sql-plugin-grafana/?utm_source=in-app&utm_medium=product&utm_campaign=2023-04-35_blog_flight-sql-plugin-grafana"
      ctaText="Learn More"
      iconColor={InfluxColors.Chartreuse}
      title="Now Available: The Flight SQL Plugin for Grafana"
    />
  )

  const incomingAnnouncement = (
    <AnnouncementBlock
      body={
        <p>
          InfluxDB Clustered is the enterprise solution for organizations
          needing control over their data and underlying infrastructure.
          Clustered turns any InfluxDB instance into a production-ready cluster
          that can run anywhere - on-premises, in the cloud, or in hybrid
          environments.
        </p>
      }
      ctaLink="https://www.influxdata.com/blog/announcing-influxdb-clustered/?utm_source=in-app&utm_medium=product&utm_campaign=2023_09_launch_clustered"
      ctaText="Learn More Here"
      iconColor={InfluxColors.Chartreuse}
      title="Now Available: InfluxDB Clustered"
    />
  )

  return currentDate >= targetDate ? incomingAnnouncement : outgoingAnnouncement
}
