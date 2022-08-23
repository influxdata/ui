// Libraries
import React, {FC, useState, memo, useEffect, ChangeEvent} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {isEmpty} from 'lodash'

// Selectors
import {getActiveTimeMachine, getSaveableView} from 'src/timeMachine/selectors'
import {getOrg} from 'src/organizations/selectors'
import {getAll} from 'src/resources/selectors'
import {sortDashboardByName} from 'src/dashboards/selectors'

// Components
import {Form, Input, Button, Grid} from '@influxdata/clockface'
import DashboardsDropdown from 'src/dataExplorer/components/DashboardsDropdown'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

import {
  DashboardTemplate,
  DEFAULT_DASHBOARD_NAME,
  DEFAULT_CELL_NAME,
} from 'src/dashboards/constants'

// Actions
import {getDashboards} from 'src/dashboards/actions/thunks'
import {
  createCellWithView,
  createDashboardWithView,
} from 'src/cells/actions/thunks'
import {setActiveTimeMachine} from 'src/timeMachine/actions'

// Types
import {AppState, Dashboard, View, ResourceType} from 'src/types'
import {
  Columns,
  InputType,
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'

// Utils
import {initialStateHelper} from 'src/timeMachine/reducers'
import {event, normalizeEventName} from 'src/cloud/utils/reporting'
import {chartTypeName} from 'src/visualization/utils/chartTypeName'

interface Props {
  dismiss: () => void
}

const SaveAsCellForm: FC<Props> = ({dismiss}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const view = useSelector(getSaveableView)
  const orgID = useSelector(getOrg)?.id ?? ''
  const dashboards = useSelector((state: AppState) => {
    const resources = getAll<Dashboard>(state, ResourceType.Dashboards)
    return sortDashboardByName(resources)
  })
  const timeRange = useSelector(getActiveTimeMachine).timeRange
  const [targetDashboardIDs, setTargetDashboardIDs] = useState([])
  const [cellName, setCellName] = useState('')
  const [isNameDashVisible, setIsNameDashVisible] = useState(false)
  const [newDashboardName, setNewDashboardName] = useState(
    DEFAULT_DASHBOARD_NAME
  )

  const handleSelectDashboardID = (selectedIDs: string[], value: Dashboard) => {
    if (value.id === DashboardTemplate.id) {
      setIsNameDashVisible(selectedIDs.includes(DashboardTemplate.id))
    }
    setTargetDashboardIDs(selectedIDs)
  }

  const handleChangeDashboardName = (e: ChangeEvent<HTMLInputElement>) => {
    setNewDashboardName(e.target.value)
  }

  const handleChangeCellName = (e: ChangeEvent<HTMLInputElement>) => {
    setCellName(e.target.value)
  }

  useEffect(() => {
    dispatch(getDashboards())
  }, [dispatch])

  const resetForm = () => {
    setTargetDashboardIDs([])
    setCellName('')
    setIsNameDashVisible(false)
    setNewDashboardName(DEFAULT_DASHBOARD_NAME)
  }

  const handleSubmit = () => {
    event('Data Explorer Save as Dashboard Submitted')
    const name = cellName || DEFAULT_CELL_NAME
    const dashboardName = newDashboardName || DEFAULT_DASHBOARD_NAME

    const viewWithProps: View = {...view, name: name}
    const redirectHandler = (dashboardId: string): void =>
      history.push(`/orgs/${orgID}/dashboards/${dashboardId}`)

    try {
      targetDashboardIDs.forEach((dashID, i) => {
        const toRedirect =
          i === targetDashboardIDs.length - 1 ? redirectHandler : undefined
        if (dashID === DashboardTemplate.id) {
          dispatch(
            createDashboardWithView(
              orgID,
              dashboardName,
              viewWithProps,
              toRedirect,
              timeRange
            )
          )
          return
        }

        const selectedDashboard = dashboards.find(d => d.id === dashID)
        dispatch(
          createCellWithView(
            selectedDashboard.id,
            viewWithProps,
            null,
            toRedirect,
            timeRange
          )
        )
      })
      dispatch(setActiveTimeMachine('de', initialStateHelper()))
      event(`data_explorer.save.as_dashboard_cell.success`, {
        which: normalizeEventName(chartTypeName(view?.properties?.type)),
      })
    } catch (error) {
      event(`data_explorer.save.as_dashboard_cell.failure`, {
        which: normalizeEventName(chartTypeName(view?.properties?.type)),
      })
      console.error(error)
      dismiss()
    } finally {
      resetForm()
    }
  }

  return (
    <ErrorBoundary>
      <Form onSubmit={handleSubmit}>
        <Grid>
          <Grid.Row>
            <Grid.Column widthXS={Columns.Twelve}>
              <Form.Element label="Target Dashboard(s)">
                <DashboardsDropdown
                  onSelect={handleSelectDashboardID}
                  selectedIDs={targetDashboardIDs}
                  dashboards={dashboards}
                  newDashboardName={newDashboardName}
                />
              </Form.Element>
            </Grid.Column>
            {isNameDashVisible && (
              <Grid.Column widthXS={Columns.Twelve}>
                <Form.Element label="New Dashboard Name">
                  <Input
                    type={InputType.Text}
                    placeholder="Add dashboard name"
                    name="dashboardName"
                    value={newDashboardName}
                    onChange={handleChangeDashboardName}
                    testID="save-as-dashboard-cell--dashboard-name"
                  />
                </Form.Element>
              </Grid.Column>
            )}
            <Grid.Column widthXS={Columns.Twelve}>
              <Form.Element label="Cell Name">
                <Input
                  type={InputType.Text}
                  placeholder="Add optional cell name"
                  name="cellName"
                  value={cellName}
                  onChange={handleChangeCellName}
                  testID="save-as-dashboard-cell--cell-name"
                />
              </Form.Element>
            </Grid.Column>
            <Grid.Column widthXS={Columns.Twelve}>
              <Form.Footer>
                <Button
                  text="Cancel"
                  onClick={dismiss}
                  titleText="Cancel save"
                  type={ButtonType.Button}
                  color={ComponentColor.Tertiary}
                  testID="save-as-dashboard-cell--cancel"
                />
                <Button
                  text="Save as Dashboard Cell"
                  testID="save-as-dashboard-cell--submit"
                  color={ComponentColor.Success}
                  type={ButtonType.Submit}
                  onClick={handleSubmit}
                  status={
                    !isEmpty(targetDashboardIDs)
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                />
              </Form.Footer>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </ErrorBoundary>
  )
}

export default memo(SaveAsCellForm)
