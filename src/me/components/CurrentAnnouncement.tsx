// Libraries
import React, {FC} from 'react'

// Components
import {AnnouncementBlock} from 'src/me/components/AnnouncementBlock'

// Assets
import influxdbu from 'assets/images/influxdbu.svg'

export const CurrentAnnouncement: FC = () => {
  const currentDate = new Date()
  const targetDate = new Date('2024-03-26T01:00:00-07:00')

  const outgoingAnnouncement = (
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

  const incomingAnnouncement = (
    <AnnouncementBlock
      image={
        <div className="announcement-block--image-spacer announcement-block--image-spacer__light">
          <img src={influxdbu} />
        </div>
      }
      body={
        <p>
          Learn how to translate Flux queries to InfluxQL, SQL, and Python in
          this technical tutorial. We cover some basic Flux queries and their
          translations, discuss the limitations of SQL and InfluxQL, and make
          the case for using Pandas and Polars. Discover the advantages and
          limitations of each language and get examples of Flux to InfluxQL,
          SQL, and Python translations.
        </p>
      }
      ctaLink="https://university.influxdata.com/courses/flux-to-influxql-sql-python/?utm_source=inapp&utm_medium=product&utm_campaign=2024_influxdbu"
      ctaText="Start Learning"
      icon={null}
      title="New Training: Flux to InfluxQL, SQL, and Python"
    />
  )

  return currentDate >= targetDate ? incomingAnnouncement : outgoingAnnouncement
}
