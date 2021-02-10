import {Overlay} from '@influxdata/clockface'
import React, {FC, useContext} from 'react'
import {CheckoutContext} from 'src/checkout/context/checkout'
import {RemoteDataState} from 'src/types'

const SuccessOverlay: FC = () => {
  const {checkoutStatus, onSuccessUrl} = useContext(CheckoutContext)
  const handleClick = () => (window.location.href = onSuccessUrl)

  return (
    <Overlay visible={checkoutStatus === RemoteDataState.Done}>
      <Overlay.Container maxWidth={600}>
        <Overlay.Header title="Ready To Rock!" />
        <Overlay.Body>
          <h4 className="checkout-overlay--title">
            You’ve successfully unleashed the full power of InfluxDB Cloud!
          </h4>
          <div className="checkout-overlay--view__empty"></div>
          <h5 className="checkout-overlay--sub-title">
            Two heads are better than one. InfluxDB Cloud has the collaboration
            tools you need to make working together in any size organization
            easy and productive.
          </h5>
        </Overlay.Body>
        <Overlay.Footer>
          <button
            className="cf-button cf-button-sm cf-button-primary"
            onClick={handleClick}
            title="Start building your team"
            tabIndex={0}
            type="button"
          >
            <span className="cf-button--label">Start building your team</span>
          </button>
        </Overlay.Footer>
      </Overlay.Container>
    </Overlay>
  )
}

export default SuccessOverlay
