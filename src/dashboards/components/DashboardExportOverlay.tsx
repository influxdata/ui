import React, {FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'

// Components
import ExportOverlay from 'src/shared/components/ExportOverlay'

// Actions
import {convertToTemplate} from 'src/dashboards/actions/thunks'
import {clearExportTemplate} from 'src/templates/actions/thunks'
import {notify} from 'src/shared/actions/notifications'

// Types
import {AppState} from 'src/types'

import {dashboardCopySuccess} from 'src/shared/copy/notifications'

const DashboardExportOverlay: FC = () => {
  const {dashboardID} = useParams()
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    if (dashboardID) {
      dispatch(convertToTemplate(dashboardID))
    }
  }, [dashboardID])

  const status = useSelector(
    (state: AppState) => state.resources.templates.exportTemplate.status
  )
  const template = useSelector(
    (state: AppState) => state.resources.templates.exportTemplate.item
  )

  const notes = () => {
    dispatch(notify(dashboardCopySuccess()))
  }
  const dismiss = () => {
    history.goBack()
    dispatch(clearExportTemplate)
  }

  return (
    <ExportOverlay
      resourceName="Dashboard"
      resource={template}
      onDismissOverlay={dismiss}
      onCopy={notes}
      status={status}
    />
  )
}

export default DashboardExportOverlay
