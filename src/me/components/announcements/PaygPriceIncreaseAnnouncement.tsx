// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'

// Components
import {Overlay, Button, ComponentColor} from '@influxdata/clockface'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Selectors
import {selectCurrentOrg, selectUser} from 'src/identity/selectors'

interface PaygPriceIncreaseAnnouncementProps {
  handleDetailsClick: () => void
  handleContactUsClick: () => void
  handleAcknowledgeClick: () => void
}

export const PaygPriceIncreaseAnnouncement: FC<
  PaygPriceIncreaseAnnouncementProps
> = ({handleDetailsClick, handleContactUsClick, handleAcknowledgeClick}) => {
  const org = useSelector(selectCurrentOrg)
  const user = useSelector(selectUser)

  const encodedSubject = encodeURI('PAYG Pricing Increase')
  const encodedBody = encodeURI(`User ID: ${user.email}
Org ID: ${org.id}

Please describe your inquiry here.`)

  return (
    <>
      <Overlay.Header title="Notice: Your Plan Pricing is Changing" />
      <Overlay.Body>
        <p>
          Starting on <strong>December 1, 2023</strong> there will be an
          increase in to your usage-based pricing.
        </p>
        <p>
          Your monthly charges will continue to be based on your actual
          consumption of the four billable usage vectors: Data In, Query Count,
          Storage and Data Out. This is unchanged. However, unit pricing for two
          of these vectors will be increased beginning{' '}
          <strong>December 1, 2023</strong>:
        </p>
        <ul>
          <li>Data In will increase from $0.002 to $0.0025 per MB ingested</li>
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
                &subject=${encodedSubject}
                &body=${encodedBody}`}
            onClick={handleContactUsClick}
          >
            contact us
          </SafeBlankLink>{' '}
          with questions or refer to our website for{' '}
          <SafeBlankLink
            href="https://www.influxdata.com/influxdb-pricing"
            onClick={handleDetailsClick}
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
    </>
  )
}
