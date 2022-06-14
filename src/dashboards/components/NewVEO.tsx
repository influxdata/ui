// Libraries
import React, {FC, useEffect} from 'react'
import {useParams, useHistory} from 'react-router-dom'
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
import {getOrg} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {AppState, RemoteDataState} from 'src/types'

const NewViewVEO: FC = () => {
  const {dashboardID} = useParams<{dashboardID: string}>()

  const org = useSelector(getOrg)
  const {view} = useSelector((state: AppState) => getActiveTimeMachine(state))
  const {activeTimeMachineID} = useSelector(
    (state: AppState) => state.timeMachines
  )

  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    dispatch(loadNewVEO())
  }, [dispatch, dashboardID])

  const handleClose = () => {
    history.push(`/orgs/${org.id}/dashboards/${dashboardID}`)
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

  if (isFlagEnabled('openCellPage')) {
    return (
      <div className="veo">
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
      </div>
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

export {NewViewVEO}

export default () => (
  <Overlay visible={true} className="veo-overlay">
    <NewViewVEO />
  </Overlay>
)
