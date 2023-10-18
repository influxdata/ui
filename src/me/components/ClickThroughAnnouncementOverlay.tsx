// Libraries
import React, {useEffect} from 'react'
import {useSelector} from 'react-redux'

// Components
import {Overlay, Button, ComponentColor} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Selectors
import {selectCurrentOrg, selectUser} from 'src/identity/selectors'

interface ClickThroughAnnouncementOverlayProps {
  onClose: () => void
}

export const ClickThroughAnnouncementOverlay: React.FC<
  ClickThroughAnnouncementOverlayProps
> = ({onClose}) => {
  useEffect(() => {
    event(`pricingClickThroughAnnouncement.displayed`)
  }, [])

  const org = useSelector(selectCurrentOrg)
  const user = useSelector(selectUser)

  const handlePricingAnnouncementClick = () => {
    event(`pricingClickThroughAnnouncement.details.clicked`)
  }

  const handleContactUsClick = () => {
    event(`pricingClickThroughAnnouncement.contactUs.clicked`)
  }

  const handleAcknowledgeClick = () => {
    event(`pricingClickThroughAnnouncement.acknowledge.clicked`)
    onClose()
  }

  return (
    <Overlay visible={true}>
      <Overlay.Container>
        <Overlay.Header title="Notice: Your Plan Pricing is Changing" />
        <Overlay.Body>
          <p>
            Starting on <strong>December 1, 2023</strong> there will be an
            increase in to your usage-based pricing.
          </p>
          <p>
            Your monthly charges will continue to be based on your actual
            consumption of the four billable usage vectors: Data In, Query
            Count, Storage and Data Out. This is unchanged. However, unit
            pricing for two of these vectors will be increased beginning{' '}
            <strong>December 1, 2023</strong>:
          </p>
          <ul>
            <li>
              Data In will increase from $0.002 to $0.0025 per MB ingested
            </li>
            <li>
              Query Count will increase from $0.01 to $0.012 per 100 executed
            </li>
          </ul>
          <p>
            This increase to your total monthly charges will depend on the
            specific distribution of your workload across the billable vectors.
            Most customers will experience an increase between 14% - 24%.
          </p>
          <p>
            Please feel free to{' '}
            <SafeBlankLink
              href={`mailto:payg-price-change@influxdata.com?
                &subject=PAYG%20price%20change%20inquiry
                &body=User%20ID:%20${user.email}%0D%0AOrg%20ID:%20${org.id}%0D%0A%0D%0APlease%20describe%20your%20inquiry%20here.`}
              onClick={handleContactUsClick}
            >
              contact us
            </SafeBlankLink>{' '}
            with questions or refer to our website for{' '}
            <SafeBlankLink
              href="https://www.influxdata.com/influxdb-pricing"
              onClick={handlePricingAnnouncementClick}
            >
              additional information
            </SafeBlankLink>
            .
          </p>
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            text="Acknowledge"
            color={ComponentColor.Primary}
            onClick={handleAcknowledgeClick}
          />
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}
