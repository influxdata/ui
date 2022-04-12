// Libraries
import React, {FunctionComponent, useEffect} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {get} from 'lodash'

// Components
import {Overlay, SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'
import TimeMachine from 'src/timeMachine/components/TimeMachine'
import VEOHeader from 'src/dashboards/components/VEOHeader'

// Actions
import {loadNewVEO} from 'src/timeMachine/actions'
import {setName} from 'src/timeMachine/actions'
import {saveVEOView} from 'src/dashboards/actions/thunks'

// Utils
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Types
import {AppState, RemoteDataState} from 'src/types'

const NewViewVEO: FunctionComponent = () => {
  const {activeTimeMachineID} = useSelector(
    (state: AppState) => state.timeMachines
  )
  const {view} = useSelector(getActiveTimeMachine)
  const history = useHistory()
  const {orgID, dashboardID} = useParams<{orgID: string; dashboardID: string}>()
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(loadNewVEO())
  }, [dispatch, dashboardID])

  const handleClose = () => {
    history.push(`/orgs/${orgID}/dashboards/${dashboardID}`)
  }

  const handleSave = () => {
    try {
      dispatch(saveVEOView(dashboardID))
      handleClose()
    } catch (error) {
      console.error(error)
    }
  }

  let loadingState = RemoteDataState.Loading
  const viewIsNew = !get(view, 'id', null)
  if (activeTimeMachineID === 'veo' && viewIsNew) {
    loadingState = RemoteDataState.Done
  }

  return (
    <Overlay visible={true} className="veo-overlay">
      <div className="veo">
        <SpinnerContainer
          spinnerComponent={<TechnoSpinner />}
          loading={loadingState}
        >
          <VEOHeader
            key={view && view.name}
            name={view && view.name}
            onSetName={dispatch(setName)}
            onCancel={handleClose}
            onSave={handleSave}
          />
          <div className="veo-contents">
            <TimeMachine />
          </div>
        </SpinnerContainer>
      </div>
    </Overlay>
  )
}

export default NewViewVEO
