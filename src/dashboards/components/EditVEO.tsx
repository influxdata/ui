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
import {disableUpdatedTimeRangeInVEO} from 'src/shared/actions/app'
import {setName} from 'src/timeMachine/actions'
import {saveVEOView} from 'src/dashboards/actions/thunks'
import {getViewAndResultsForVEO} from 'src/views/actions/thunks'

// Utils
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Types
import {AppState, RemoteDataState} from 'src/types'

const EditViewVEO: FunctionComponent = () => {
  const history = useHistory()
  const {view} = useSelector(getActiveTimeMachine)
  const {activeTimeMachineID} = useSelector(
    (state: AppState) => state.timeMachines
  )
  const {dashboardID, cellID, orgID} = useParams<{
    orgID: string
    cellID: string
    dashboardID: string
  }>()
  const dispatch = useDispatch()
  useEffect(() => {
    // TODO split this up into "loadView" "setActiveTimeMachine"
    // and something to tell the component to pull from the context
    // of the dashboardID
    dispatch(getViewAndResultsForVEO(dashboardID, cellID, 'veo'))
  }, [dispatch, dashboardID, cellID])

  const handleClose = () => {
    history.push(`/orgs/${orgID}/dashboards/${dashboardID}`)
    dispatch(disableUpdatedTimeRangeInVEO())
  }

  const handleSave = () => {
    try {
      dispatch(saveVEOView(dashboardID))
      handleClose()
    } catch (e) {}
  }

  const viewMatchesRoute = get(view, 'id', null) === cellID

  let loadingState = RemoteDataState.Loading
  if (activeTimeMachineID === 'veo' && viewMatchesRoute) {
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
            key={view?.name}
            name={view?.name}
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

export default EditViewVEO
