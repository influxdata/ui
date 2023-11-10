// Libraries
import React, {FC} from 'react'

// Components
import {Accordion, Overlay, Button, ComponentColor} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

interface MqttEolAnnouncementProps {
  handleAcknowledgeClick: () => void
  handleDetailsClick: () => void
}

export const MqttEolAnnouncement: FC<MqttEolAnnouncementProps> = ({
  handleAcknowledgeClick,
  handleDetailsClick,
}) => {
  return (
    <>
      <Overlay.Header title="Deprecation Notice: MQTT Native Collector" />
      <Overlay.Body>
        <p>
          The Native Collector - MQTT feature is being deprecated and will stop
          functioning on <strong>April 30, 2024</strong>.
        </p>
        <p>
          Please refer to the FAQ below for more details and guidance on
          alternate solutions currently available.
        </p>
        <Accordion>
          <Accordion.AccordionHeader>
            <span>
              <strong>Q: </strong>What is the Native Collector - MQTT Feature?
            </span>
          </Accordion.AccordionHeader>
          <Accordion.AccordionBodyItem>
            <span>
              <strong>A: </strong>The Native Collector - MQTT feature was
              introduced in InfluxDB Cloud in 2022 as a way to ingest data
              directly from MQTT sources into InfluxDB Cloud. This feature has
              been removed and is no longer available to new customers or
              existing customers who have not been using it. It was only
              available to a limited number of existing customers who were
              actively using it.
            </span>
          </Accordion.AccordionBodyItem>
        </Accordion>
        <Accordion>
          <Accordion.AccordionHeader>
            <span>
              <strong>Q: </strong>Why is this feature being EOLed?
            </span>
          </Accordion.AccordionHeader>
          <Accordion.AccordionBodyItem>
            <span>
              <strong>A: </strong>The adoption of this feature was lower than
              anticipated given most customers continued to use Telegraf,
              InfluxData's data collection agent, which provides more features
              for MQTT ingestion than this feature did. After a thorough
              assessment, we determined that our customers can have a similar -
              and superior - experience with the MQTT Consumer Telegraf Input
              Plugin.
            </span>
          </Accordion.AccordionBodyItem>
        </Accordion>
        <Accordion>
          <Accordion.AccordionHeader>
            <span>
              <strong>Q: </strong>What alternatives are available in light of
              this EOL announcement?
            </span>
          </Accordion.AccordionHeader>
          <Accordion.AccordionBodyItem>
            <span>
              <strong>A: </strong>We recommend using the MQTT Consumer Telegraf
              Input Plugin as an alternative to the Native Collector - MQTT
              feature. It's free to use and is available for download{' '}
              <SafeBlankLink
                href="https://www.influxdata.com/integration/mqtt-telegraf-consumer/"
                onClick={handleDetailsClick}
              >
                here
              </SafeBlankLink>
              . Telegraf is InfluxData's very popular open source data
              collection agent with 300+ plugins, including MQTT.
            </span>
          </Accordion.AccordionBodyItem>
        </Accordion>
        <Accordion>
          <Accordion.AccordionHeader>
            <span>
              <strong>Q: </strong>What are the expected next steps?
            </span>
          </Accordion.AccordionHeader>
          <Accordion.AccordionBodyItem>
            <span>
              <strong>A: </strong>The Native Collector - MQTT feature will
              continue to work and function until{' '}
              <strong>April 30th, 2024</strong>. We will not be doing any new
              product development or enhancements to the feature in the
              meantime. After the EOL date, it will be decommissioned and any
              MQTT subscriptions that you have made will no longer receive and
              ingest data into InfluxDB.
            </span>
          </Accordion.AccordionBodyItem>
        </Accordion>
        <Accordion>
          <Accordion.AccordionHeader>
            <span>
              <strong>Q: </strong>Will I lose any data already ingested?
            </span>
          </Accordion.AccordionHeader>
          <Accordion.AccordionBodyItem>
            <span>
              <strong>A: </strong>No, already ingested data will not be affected
              by this change.
            </span>
          </Accordion.AccordionBodyItem>
        </Accordion>
        <Accordion>
          <Accordion.AccordionHeader>
            <span>
              <strong>Q: </strong>Where can I get more information on using
              Telegraf as a replacement for Native Collector - MQTT?
            </span>
          </Accordion.AccordionHeader>
          <Accordion.AccordionBodyItem>
            <span>
              <strong>A: </strong>You can obtain more information about using
              Telegraf with MQTT and download the MQTT Consumer Telegraf Input
              Plugin{' '}
              <SafeBlankLink
                href="https://www.influxdata.com/integration/mqtt-telegraf-consumer/"
                onClick={handleDetailsClick}
              >
                here
              </SafeBlankLink>
              .
            </span>
          </Accordion.AccordionBodyItem>
        </Accordion>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Acknowledge"
          color={ComponentColor.Primary}
          onClick={handleAcknowledgeClick}
        />
      </Overlay.Footer>
    </>
  )
}
