// Libraries
import React, {FunctionComponent, useEffect, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import CheckEOHeader from 'src/checks/components/CheckEOHeader'
import TimeMachine from 'src/timeMachine/components/TimeMachine'
import {AlertProvider} from 'src/checks/utils/context'
import {OverlayContext} from 'src/overlays/components/OverlayController'

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
  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()
  const checkName = useSelector((state: AppState) => state.alertBuilder.name)
  useEffect(() => {
    const view = createView<CheckViewProperties>('threshold')
    dispatch(initializeAlertBuilder('threshold'))
    dispatch(
      setActiveTimeMachine('alerting', {
        view,
      })
    )
    return () => dispatch(resetAlertBuilder)
  }, [dispatch])

  return (
    <div className="veo-overlay">
      <div className="veo">
        <CheckEOHeader
          key={checkName}
          name={checkName}
          onSetName={(newName: string) => dispatch(updateName(newName))}
          onCancel={onClose}
          onSave={() => dispatch(createCheckFromTimeMachine())}
        />
        <AlertProvider>
          <div className="veo-contents">
            <TimeMachine />
          </div>
        </AlertProvider>
      </div>
    </div>
  )
}

export default NewCheckOverlay
