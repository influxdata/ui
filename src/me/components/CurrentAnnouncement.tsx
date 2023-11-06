// Libraries
import React, {FC} from 'react'

// Components
import {InfluxColors} from '@influxdata/clockface'
import {AnnouncementBlock} from 'src/me/components/AnnouncementBlock'

// Assets
import iiotWebinarBanner from 'assets/images/iiot-webinar-banner.png'

export const CurrentAnnouncement: FC = () => {
  const currentDate = new Date()
  const targetDate = new Date('2023-11-06T05:00:00-07:00')

  const outgoingAnnouncement = (
    <AnnouncementBlock
      body={
        <p>
          InfluxDB Clustered is the solution for organizations needing control
          over their data and underlying infrastructure. Clustered turns any
          InfluxDB instance into a production-ready cluster that can run
          on-premises or in your private cloud. Keep your time series data where
          you need it.
        </p>
      }
      ctaLink="https://www.influxdata.com/blog/announcing-influxdb-clustered?utm_source=in-app&utm_medium=product&utm_campaign=2023_09_launch_clustered"
      ctaText="Learn More Here"
      iconColor={InfluxColors.Chartreuse}
      title="Announcing InfluxDB Clustered"
    />
  )

  const incomingAnnouncement = (
    <AnnouncementBlock
      image={<img src={iiotWebinarBanner} />}
      body={
        <p>
          Discover through real-life use cases how companies use InfluxDB for
          IIoT.
        </p>
      }
      ctaLink="https://www.influxdata.com/resources/industrial-iot-or-live-demo/"
      ctaText="Save Your Spot"
      icon={null}
      title="Live Demo"
    />
  )

  return currentDate >= targetDate ? incomingAnnouncement : outgoingAnnouncement
}
