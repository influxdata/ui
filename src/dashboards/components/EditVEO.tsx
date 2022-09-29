// Libraries
import React, {FC, useEffect} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'

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

// Types
import {AppState} from 'src/types'

const EditViewVEO: FC = () => {
  const {dashboardID, cellID} = useParams<{
    dashboardID: string
    cellID: string
  }>()

  const org = useSelector(getOrg)
  const {view} = useSelector((state: AppState) => getActiveTimeMachine(state))

  const dispatch = useDispatch()
  const history = useHistory()

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

export {EditViewVEO}

export default () => (
  <Overlay visible={true} className="veo-overlay">
    <EditViewVEO />
  </Overlay>
)
