// Libraries
import React, {FC} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {
  Form,
  Heading,
  InfluxColors,
  HeadingElement,
} from '@influxdata/clockface'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

export const SeriesCardinalityIncreaseForm: FC = () => {
  const dispatch = useDispatch()

  const handleContactSupport = () => {
    dispatch(showOverlay('contact-support', null, dismissOverlay))
  }

  return (
    <div>
      <Form.Divider lineColor={InfluxColors.Grey15} />
      <Heading element={HeadingElement.H4}>
        Request Series Cardinality Limit Increase
      </Heading>
      <p>
        To request a cardinality limit increase, please{' '}
        <a href="#" onClick={handleContactSupport}>
          contact support
        </a>
        .
      </p>
    </div>
  )
}
