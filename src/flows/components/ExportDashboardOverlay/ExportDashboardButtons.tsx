import React, {FC, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {RouteProps, useHistory, useLocation} from 'react-router-dom'
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentStatus,
  Form,
  IconFont,
} from '@influxdata/clockface'
import {
  ExportToDashboard,
  DashboardOverlayContext,
  CREATE_CELL,
} from 'src/flows/context/dashboardOverlay'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {formatQueryText} from 'src/flows/shared/utils'
import {notify} from 'src/shared/actions/notifications'
import {getOrg} from 'src/organizations/selectors'
import {updateView} from 'src/dashboards/apis'
import {
  createCellWithView,
  createDashboardWithView,
} from 'src/cells/actions/thunks'
import {
  DEFAULT_DASHBOARD_NAME,
  DEFAULT_CELL_NAME,
} from 'src/dashboards/constants'

// Types
import {Notification, NotificationStyle, View} from 'src/types'

const ExportConfirmationNotification = (
  dashboardName: string
): Notification => {
  return {
    message: `Visualization added to ${dashboardName}`,
    style: NotificationStyle.Success,
    icon: IconFont.Checkmark,
    duration: 6666,
  }
}

const ExportDashboardButtons: FC = () => {
  const history = useHistory()
  const {
    activeTab,
    canSubmit,
    handleSetError,
    selectedCell,
    selectedDashboard,
    cellName,
    dashboardName,
  } = useContext(DashboardOverlayContext)

  const location: RouteProps['location'] = useLocation()
  const params = location.state
  const {queryText, properties} = params[0]

  const formattedQueryText = formatQueryText(queryText)

  const dispatch = useDispatch()
  const org = useSelector(getOrg)

  const onCreate = () => {
    event('Save Visualization to Dashboard')
    const view = {
      name: cellName || DEFAULT_CELL_NAME,
      properties: {
        ...properties,
        queries: [
          {
            text: formattedQueryText,
            editMode: 'advanced',
            name: '',
          },
        ],
      },
    } as View
    if (activeTab === ExportToDashboard.Update) {
      dispatch(createCellWithView(selectedDashboard.id, view))
      dispatch(notify(ExportConfirmationNotification(selectedDashboard.name)))
    } else {
      dispatch(
        createDashboardWithView(
          org.id,
          dashboardName || DEFAULT_DASHBOARD_NAME,
          view
        )
      )
      dispatch(notify(ExportConfirmationNotification(dashboardName)))
    }
    history.goBack()
  }

  const onUpdate = () => {
    event('Update Visualization to Dashboard')
    const view = {
      name: selectedCell?.name || DEFAULT_CELL_NAME, // TODO: fix this to handle overwriting or creating one
      properties: {
        ...properties,
        queries: [
          {
            text: formattedQueryText,
            editMode: 'advanced',
            name: '',
          },
        ],
      },
    } as View

    updateView(selectedDashboard.id, selectedCell.id, view)
    notify(ExportConfirmationNotification(selectedDashboard.name))
    history.goBack()
  }

  let onSubmit = onCreate
  if (
    activeTab === ExportToDashboard.Update &&
    selectedCell?.id !== CREATE_CELL
  ) {
    onSubmit = onUpdate
  }

  return (
    <Form.Footer>
      <Button
        text="Cancel"
        onClick={() => history.goBack()}
        titleText="Cancel"
        type={ButtonType.Button}
      />
      <Button
        text="Export to Dashboard"
        color={ComponentColor.Success}
        type={ButtonType.Submit}
        onClick={onSubmit}
        status={
          canSubmit() ? ComponentStatus.Default : ComponentStatus.Disabled
        }
        testID="button--dashboard-export"
      />
    </Form.Footer>
  )
}

export default ExportDashboardButtons
