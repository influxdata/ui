import React, {FC, useState, useContext, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Context
import {OverlayContext} from 'src/overlays/components/OverlayController'
// Clockface
import {
  Dropdown,
  Button,
  Overlay,
  ComponentColor,
  InputLabel,
  SlideToggle,
  Form,
} from '@influxdata/clockface'

// Actions
import {createCellWithView, deleteCellAndView} from 'src/cells/actions/thunks'
import {getOverlayParams} from 'src/overlays/selectors'
import {getDashboardIDs} from 'src/dashboards/utils/getDashboardIds'
import {getOrg} from 'src/organizations/selectors'

// Types
import {AppState} from 'src/types'

// Metrics
import {event} from 'src/cloud/utils/reporting'
import {Dashboard} from 'src/client'
import {notify} from 'src/shared/actions/notifications'
import {
  dashboardsGetFailed,
  cellCloneSuccess,
} from 'src/shared/copy/notifications'

const CellCloneOverlay: FC = () => {
  const [otherDashboards, setOtherDashboards] = useState<Dashboard[]>([])
  const dispatch = useDispatch()
  const {id: orgID} = useSelector(getOrg)

  const currentDashboardID = useSelector(
    (state: AppState) => state.currentDashboard.id
  )

  useEffect(() => {
    getDashboardIDs(orgID)
      .then(retrievedBoards => {
        setOtherDashboards(
          retrievedBoards.filter(board => board.id !== currentDashboardID)
        )
      })
      .catch(err => {
        event('dashboards.cloneCell.getDashboardsFailed', {
          context: JSON.stringify(err),
        })
        dispatch(notify(dashboardsGetFailed(err)))
      })
  }, [])

  const {onClose} = useContext(OverlayContext)

  const {view, cell} = useSelector(getOverlayParams)

  const [destinationDashboardID, setDestinationDashboardID] = useState<string>(
    ''
  )
  const [removeFromCurrentBoard, setRemoveFromCurrentBoard] = useState<boolean>(
    false
  )

  const handleDeleteCell = (): void => {
    dispatch(deleteCellAndView(currentDashboardID, cell.id, view.id))
  }

  const copyCellToDashboard = () => {
    dispatch(
      createCellWithView(
        destinationDashboardID,
        {...view, dashboardID: destinationDashboardID},
        {...cell, dashboardID: destinationDashboardID},
        null,
        null,
        true
      )
    )
    dispatch(
      notify(
        cellCloneSuccess(
          destinationDashboardID,
          removeFromCurrentBoard ? 'moved' : 'copied',
          cell.name ?? null
        )
      )
    )
  }

  const selectedDashboard = otherDashboards.find(
    d => d.id === destinationDashboardID
  )?.name

  return (
    <Overlay.Container maxWidth={400}>
      <Overlay.Header title="Move Cell" onDismiss={onClose} />
      <Overlay.Body className="dashboard-clonecell--overlayopen">
        <Form.Element label="" className="dashboard-clonecell--dropdownopen">
          <Dropdown
            className="dashboard-clonecell--dropdownopen"
            button={(active, onClick) => (
              <Dropdown.Button
                active={active}
                onClick={onClick}
                testID="clone-to-other-dashboard"
              >
                {selectedDashboard ?? 'Choose a Destination Dashboard'}
              </Dropdown.Button>
            )}
            menu={onCollapse => (
              <Dropdown.Menu
                onCollapse={onCollapse}
                testID="copy-dashboard-cell--dropdown-menu"
              >
                {otherDashboards.map(d => {
                  return (
                    <Dropdown.Item
                      key={d.id}
                      value={d.id}
                      onClick={id => setDestinationDashboardID(id)}
                      selected={d.id === destinationDashboardID}
                      testID={`other-dashboard-${d.id}`}
                    >
                      {d.name ?? 'Name this Dashboard'}
                    </Dropdown.Item>
                  )
                })}
              </Dropdown.Menu>
            )}
          />
        </Form.Element>
        <Form.Element label="" className="dashboard-clonecell--removecurrent">
          <span className="dashboard-clonecell--movetype">Move type: </span>
          <InputLabel
            active={!removeFromCurrentBoard}
            className="refresh-form-time-label"
          >
            Copy
          </InputLabel>
          <SlideToggle
            active={removeFromCurrentBoard}
            onChange={() => setRemoveFromCurrentBoard(!removeFromCurrentBoard)}
            testID="clone-cell-type-toggle"
            className="dashboard-clonecell--typetoggle"
          />
          <InputLabel
            active={removeFromCurrentBoard}
            className="refresh-form-time-label"
          >
            Move
          </InputLabel>
        </Form.Element>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          onClick={() => {
            onClose()
          }}
          color={ComponentColor.Default}
          text="Cancel"
          testID="copy-cell-cancel-button"
        />
        <Button
          onClick={() => {
            event('relocating cell', {
              operationType: removeFromCurrentBoard ? 'Move' : 'Copy',
            })

            copyCellToDashboard()
            if (removeFromCurrentBoard) {
              handleDeleteCell()
            }
            onClose()
          }}
          color={ComponentColor.Primary}
          text="Confirm"
          testID="confirm-clone-cell-button"
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default CellCloneOverlay
