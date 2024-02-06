// Libraries
import React, {FC} from 'react'

// Components
import {AnnouncementBlock} from 'src/me/components/AnnouncementBlock'

// Assets
import influxdbu from 'assets/images/influxdbu.svg'

export const CurrentAnnouncement: FC = () => {
  const currentDate = new Date()
  const targetDate = new Date('2024-02-06T01:00:00-07:00')

  const outgoingAnnouncement = (
    <AnnouncementBlock
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

  const incomingAnnouncement = (
    <AnnouncementBlock
      image={
        <div className="announcement-block--image-spacer announcement-block--image-spacer__light">
          <img src={influxdbu} />
        </div>
      }
      body={
        <p>
          In this training, we'll learn about a variety of third-party solutions
          that can replace the task engine in InfluxDB 2.0. We'll also learn
          about the advantages of each solution and some of the advancements to
          the Python Client Library.
        </p>
      }
      ctaLink="https://www.influxdata.com/training/influxdb-3-0-task-engine-training/?utm_source=in-app&utm_medium=product&utm_campaign=2024-02-22_Training_InfluxDBTaskEngine"
      ctaText="Save Your Spot"
      icon={null}
      title="New Live Training: InfluxDB 3.0 Task Engine"
    />
  )

  return currentDate >= targetDate ? incomingAnnouncement : outgoingAnnouncement
}
