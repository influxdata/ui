// Libraries
import React, {FunctionComponent, useEffect} from 'react'
import {connect, ConnectedProps, useDispatch, useSelector} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {Overlay} from '@influxdata/clockface'
import CheckEOHeader from 'src/checks/components/CheckEOHeader'
import TimeMachine from 'src/timeMachine/components/TimeMachine'

// Actions
import {createCheckFromTimeMachine} from 'src/checks/actions/thunks'
import {setActiveTimeMachine} from 'src/timeMachine/actions'
import {
  resetAlertBuilder,
  updateName,
  initializeAlertBuilder,
} from 'src/alerting/actions/alertBuilder'

// Utils
import {createView} from 'src/views/helpers'

// Types
import {AppState, CheckViewProperties} from 'src/types'

const NewCheckOverlay: FunctionComponent = () => {
  const dispatch = useDispatch()
  const checkName = useSelector((state: AppState) => state.alertBuilder.name)
  useEffect(() => {
    const view = createView<CheckViewProperties>('threshold')
    // dispatch(initializeAlertBuilder('threshold'))
    dispatch(
      setActiveTimeMachine('alerting', {
        view,
      })
    )
    return () => dispatch(resetAlertBuilder)
  }, [dispatch])

  return (
    <Overlay.Container>
      <Overlay.Body>
        <CheckEOHeader
          key={checkName}
          name={checkName}
          onSetName={() => dispatch(updateName)}
          // onCancel={handleClose}
          onSave={() => dispatch(createCheckFromTimeMachine as any)}
        />
        {/* <div className="veo-contents">
          <TimeMachine />
        </div> */}
      </Overlay.Body>
    </Overlay.Container>
  )
}

export default NewCheckOverlay
