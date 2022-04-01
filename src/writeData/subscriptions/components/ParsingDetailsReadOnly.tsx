// Libraries
import React, {FC} from 'react'

// Components
import {Heading, HeadingElement, FontWeight} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

// Styles
import 'src/writeData/subscriptions/components/ParsingDetails.scss'

interface Props {
  currentSubscription: Subscription
}

const ParsingDetailsReadOnly: FC<Props> = ({currentSubscription}) => (
  <Heading
    element={HeadingElement.H4}
    weight={FontWeight.Regular}
    className="update-parsing-form__text"
  >
    Data format: {currentSubscription && currentSubscription.dataFormat}
  </Heading>
)

export default ParsingDetailsReadOnly
