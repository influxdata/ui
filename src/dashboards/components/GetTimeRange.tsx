// Libraries
import React, {FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useParams, useLocation} from 'react-router-dom'
import {getTimeRange} from 'src/dashboards/selectors'

// Actions
import {
  setDashboardTimeRange,
  updateQueryParams,
} from 'src/dashboards/actions/ranges'

const GetTimeRange: FC = () => {
  const {dashboardID} = useParams<{dashboardID: string}>()
  const location = useLocation()
  const dispatch = useDispatch()
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
