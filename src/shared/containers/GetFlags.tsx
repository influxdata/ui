// Libraries
import React, {useEffect, FC} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {Switch, Route} from 'react-router-dom'
import GetOrganizations from 'src/shared/containers/GetOrganizations'

// Components
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Types
import {RemoteDataState} from 'src/types'

// Actions
import {getFlags} from 'src/shared/thunks/flags'

// Utils
import {activeFlags, getFlagStatus} from 'src/shared/selectors/flags'
import {updateReportingContext} from 'src/cloud/utils/reporting'

const GetFlags: FC = () => {
  const dispatch = useDispatch()
  const flags = useSelector(activeFlags)
  const status = useSelector(getFlagStatus)

  useEffect(() => {
    if (status === RemoteDataState.NotStarted) {
      dispatch(getFlags())
    }
  }, [dispatch, status])

  useEffect(() => {
    updateReportingContext(
      Object.entries(flags).reduce((prev, [key, val]) => {
        prev[`flag (${key})`] = val

        return prev
      }, {})
    )
  }, [flags])

  return (
    <SpinnerContainer loading={status} spinnerComponent={<TechnoSpinner />}>
      <Switch>
        <Route component={GetOrganizations} />
      </Switch>
    </SpinnerContainer>
  )
}

export default GetFlags
