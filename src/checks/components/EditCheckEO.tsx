// Libraries
import React, {FunctionComponent, useEffect} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {connect, ConnectedProps, useDispatch, useSelector} from 'react-redux'
import {get} from 'lodash'

// Components
import {Overlay, SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'
import CheckEOHeader from 'src/checks/components/CheckEOHeader'
import TimeMachine from 'src/timeMachine/components/TimeMachine'

// Utils
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Actions
import {
  updateCheckFromTimeMachine,
  getCheckForTimeMachine,
} from 'src/checks/actions/thunks'
import {executeQueries} from 'src/timeMachine/actions/queries'
import {resetAlertBuilder, updateName} from 'src/alerting/actions/alertBuilder'

// Types
import {AppState, RemoteDataState} from 'src/types'
import {getOrg} from 'src/organizations/selectors'

type Props = ConnectedProps<typeof connector>

const EditCheckEditorOverlay: FunctionComponent<Props> = ({
  onUpdateAlertBuilderName,
  onResetAlertBuilder,
  onSaveCheckFromTimeMachine,
  activeTimeMachineID,
  status,
  checkName,
  loadedCheckID,
  view,
}) => {
  const history = useHistory()
  const {checkID} = useParams<{checkID}>()
  const orgID = useSelector(getOrg).id
  const dispatch = useDispatch()
  const query = get(view, 'properties.queries[0]', null)

  useEffect(() => {
    dispatch(getCheckForTimeMachine(checkID))
  }, [dispatch, checkID])

  useEffect(() => {
    dispatch(executeQueries())
  }, [dispatch, query])

  const handleClose = () => {
    history.push(`/orgs/${orgID}/alerting`)
    onResetAlertBuilder()
  }

  let loadingStatus = RemoteDataState.Loading

  if (status === RemoteDataState.Error) {
    loadingStatus = RemoteDataState.Error
  }
  if (
    status === RemoteDataState.Done &&
    activeTimeMachineID === 'alerting' &&
    loadedCheckID === checkID
  ) {
    loadingStatus = RemoteDataState.Done
  }

  return (
    <Overlay visible={true} className="veo-overlay">
      <div className="veo">
        <SpinnerContainer
          spinnerComponent={<TechnoSpinner />}
          loading={loadingStatus}
        >
          <CheckEOHeader
            name={checkName}
            onSetName={onUpdateAlertBuilderName}
            onCancel={handleClose}
            onSave={onSaveCheckFromTimeMachine}
          />
          <div className="veo-contents">
            <TimeMachine />
          </div>
        </SpinnerContainer>
      </div>
    </Overlay>
  )
}

const mstp = (state: AppState) => {
  const {
    timeMachines: {activeTimeMachineID},
    alertBuilder: {status, name, id},
  } = state

  const {view} = getActiveTimeMachine(state)

  return {
    loadedCheckID: id,
    checkName: name,
    status,
    activeTimeMachineID,
    view,
  }
}

const mdtp = {
  onSaveCheckFromTimeMachine: updateCheckFromTimeMachine,
  onResetAlertBuilder: resetAlertBuilder,
  onUpdateAlertBuilderName: updateName,
}

const connector = connect(mstp, mdtp)

export default connector(EditCheckEditorOverlay)
