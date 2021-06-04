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

// Selectors
import {getAllDashboards} from 'src/dashboards/selectors'

// Actions
import {createCellWithView, deleteCellAndView} from 'src/cells/actions/thunks'
import {getOverlayParams} from 'src/overlays/selectors'
import {getDashboards} from 'src/dashboards/actions/thunks'

// Types
import {AppState} from 'src/types'
const CellCloneOverlay: FC = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getDashboards())
  }, [dispatch])
  const {onClose} = useContext(OverlayContext)
  const dashboards = useSelector(getAllDashboards)
  const currentDashboardID = useSelector(
    (state: AppState) => state.currentDashboard.id
  )

  const otherDashboards = dashboards.filter(d => d.id !== currentDashboardID)

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
    dispatch(createCellWithView(destinationDashboardID, view, cell))
  }

  const selectedDashboard = otherDashboards.find(
    d => d.id === destinationDashboardID
  )?.name

  return (
    <Overlay.Container maxWidth={400}>
      <Overlay.Header title="Move Cell" onDismiss={onClose} />
      <Overlay.Body className="cellCloneOverlayBody">
        <Form.Element label="" className="otherDashboardDropdown">
          <Dropdown
            style={{width: '80%'}}
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
        <Form.Element label="" className="moveCellRemoveCurrent">
          <span className="moveType">Move type: </span>
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
