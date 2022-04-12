// Libraries
import React, {FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useLocation, useParams} from 'react-router-dom'
import {getTimeRange} from 'src/dashboards/selectors'

// Actions
import {
  setDashboardTimeRange,
  updateQueryParams,
} from 'src/dashboards/actions/ranges'

const GetTimeRange: FC = () => {
  const dispatch = useDispatch()
  const {dashboardID} = useParams<{dashboardID}>()
  const location = useLocation()
  const timeRange = useSelector(getTimeRange)
  const isEditing = location.pathname.includes('edit')
  const isNew = location.pathname.includes('new')

  useEffect(() => {
    if (isEditing || isNew) {
      return
    }

    // TODO: map this to current contextID
    dispatch(setDashboardTimeRange(dashboardID, timeRange))
    const {lower, upper} = timeRange
    dispatch(
      updateQueryParams({
        lower,
        upper,
      })
    )
  }, [dispatch, isEditing, isNew, dashboardID, timeRange])

  return <div />
}

export default GetTimeRange
