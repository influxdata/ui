// Libraries
import React, {FC, useEffect} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import {get} from 'lodash'

// Components
import {
  Overlay,
  Page,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import TimeMachine from 'src/timeMachine/components/TimeMachine'
import VEOHeader from 'src/dashboards/components/VEOHeader'

// Actions
import {setName} from 'src/timeMachine/actions'
import {saveVEOView} from 'src/dashboards/actions/thunks'
import {getViewAndResultsForVEO} from 'src/views/actions/thunks'

// Utils
import {getActiveTimeMachine} from 'src/timeMachine/selectors'
import {getOrg} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {AppState, RemoteDataState} from 'src/types'

const EditViewVEO: FC = () => {
  const {dashboardID, cellID} = useParams<{
    dashboardID: string
    cellID: string
  }>()

  const org = useSelector(getOrg)
  const {view} = useSelector((state: AppState) => getActiveTimeMachine(state))
  const {activeTimeMachineID} = useSelector(
    (state: AppState) => state.timeMachines
  )

  const dispatch = useDispatch()
  const history = useHistory()
  const viewMatchesRoute = get(view, 'id', null) === cellID

  useEffect(() => {
    // TODO split this up into "loadView" "setActiveTimeMachine"
    // and something to tell the component to pull from the context
    // of the dashboardID
    dispatch(getViewAndResultsForVEO(dashboardID, cellID, 'veo'))
  }, [dispatch, dashboardID, cellID])

  const handleClose = () => {
    history.push(`/orgs/${org.id}/dashboards/${dashboardID}`)
  }

  const handleSave = () => {
    try {
      dispatch(saveVEOView(dashboardID))
      handleClose()
    } catch (e) {}
  }

  let loadingState = RemoteDataState.Loading
  if (activeTimeMachineID === 'veo' && viewMatchesRoute) {
    loadingState = RemoteDataState.Done
  }

  if (isFlagEnabled('openCellPage')) {
    return (
      <Page>
        <SpinnerContainer
          spinnerComponent={<TechnoSpinner />}
          loading={view.status}
        >
          <VEOHeader
            key={view && view.name}
            name={view && view.name}
            onSetName={(name: string) => dispatch(setName(name))}
            onCancel={handleClose}
            onSave={handleSave}
          />
          <div className="veo-contents">
            <TimeMachine />
          </div>
        </SpinnerContainer>
      </Page>
    )
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
            onSetName={(name: string) => dispatch(setName(name))}
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

export {EditViewVEO}

export default () => (
  <Overlay visible={true} className="veo-overlay">
    <EditViewVEO />
  </Overlay>
)
