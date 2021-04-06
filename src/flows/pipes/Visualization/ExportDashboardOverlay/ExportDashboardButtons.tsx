import React, {FC, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  Button,
  ButtonType,
  ComponentColor,
  Form,
  IconFont,
} from '@influxdata/clockface'
import {
  ExportToDashboard,
  Context,
  CREATE_CELL,
} from 'src/flows/pipes/Visualization/ExportDashboardOverlay/context'
import {PopupContext} from 'src/flows/context/popup'

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
  const {
    activeTab,
    validateForm,
    selectedCell,
    selectedDashboard,
    cellName,
    dashboardName,
  } = useContext(Context)
  const {data, closeFn} = useContext(PopupContext)

  const text = formatQueryText(data.query)

  const dispatch = useDispatch()
  const org = useSelector(getOrg)

  const onCreate = () => {
    event('notebook_export_to_dashboard', {exportType: 'create'})

    const view = {
      name: cellName || DEFAULT_CELL_NAME,
      properties: {
        ...data.properties,
        queries: [
          {
            text,
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

    closeFn()
  }

  const onUpdate = () => {
    event('notebook_export_to_dashboard', {exportType: 'update'})

    const view = {
      name: selectedCell?.name || DEFAULT_CELL_NAME, // TODO: fix this to handle overwriting or creating one
      properties: {
        ...data.properties,
        queries: [
          {
            text,
            editMode: 'advanced',
            name: '',
          },
        ],
      },
    } as View

    updateView(selectedDashboard.id, selectedCell.id, view)
    notify(ExportConfirmationNotification(selectedDashboard.name))

    closeFn()
  }

  const onSubmit = (): void => {
    if (validateForm()) {
      if (
        activeTab === ExportToDashboard.Update &&
        selectedCell?.id !== CREATE_CELL
      ) {
        onUpdate()
      } else {
        onCreate()
      }
    }
  }

  return (
    <Form.Footer>
      <Button
        text="Cancel"
        onClick={closeFn}
        titleText="Cancel"
        type={ButtonType.Button}
      />
      <Button
        text="Export to Dashboard"
        color={ComponentColor.Success}
        type={ButtonType.Submit}
        onClick={onSubmit}
        testID="button--dashboard-export"
      />
    </Form.Footer>
  )
}

export default ExportDashboardButtons
