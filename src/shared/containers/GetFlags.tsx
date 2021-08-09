// Libraries
import React, {useEffect, FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Switch, Route} from 'react-router-dom'
import GetOrganizations from 'src/shared/containers/GetOrganizations'

// Components
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Types
import {RemoteDataState, AppState} from 'src/types'

// Actions
import {getFlags} from 'src/shared/thunks/flags'

const GetFlags: FC = () => {
  const dispatch = useDispatch()
  const status = useSelector(
    (state: AppState) => state.flags.status || RemoteDataState.NotStarted
  )
  useEffect(() => {
    if (status === RemoteDataState.NotStarted) {
      dispatch(getFlags())
    }
  }, [dispatch, status])

  return (
    <SpinnerContainer loading={status} spinnerComponent={<TechnoSpinner />}>
      <Switch>
        <Route component={GetOrganizations} />
      </Switch>
    </SpinnerContainer>
  )
}

export default GetFlags
