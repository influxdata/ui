import React, {FC, useState, useCallback, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {Cell, Dashboard} from 'src/types'
import {getDashboards} from 'src/dashboards/actions/thunks'

export enum ExportToDashboard {
  Create = 'create',
  Update = 'update',
}

export interface DashboardOverlayContext {
  activeTab: ExportToDashboard
  canSubmit: () => boolean
  handleSetActiveTab: (tab: ExportToDashboard) => void
  handleSetError: (value: boolean) => void
  handleSetCell: (cell: Cell) => void
  handleSetCellName: (value: string) => void
  handleSetDashboard: (dashboard: Dashboard) => void
  handleSetDashboardName: (value: string) => void
  hasError: boolean
  cellName: string
  selectedCell: Cell | undefined
  selectedDashboard: Dashboard | undefined
  dashboardName: string
}

export const DEFAULT_CONTEXT: DashboardOverlayContext = {
  activeTab: ExportToDashboard.Create,
  canSubmit: () => false,
  handleSetActiveTab: () => {},
  handleSetError: () => {},
  handleSetCell: () => {},
  handleSetCellName: () => {},
  handleSetDashboard: () => {},
  handleSetDashboardName: () => {},
  hasError: false,
  cellName: '',
  selectedCell: undefined,
  selectedDashboard: undefined,
  dashboardName: '',
}

export const DashboardOverlayContext = React.createContext<
  DashboardOverlayContext
>(DEFAULT_CONTEXT)

export const CREATE_CELL = 'CREATE_CELL'

const DashboardOverlayProvider: FC = ({children}) => {
  const [activeTab, setActiveTab] = useState(ExportToDashboard.Create)
  const [selectedDashboard, setDashboard] = useState<Dashboard>(undefined)
  const [selectedCell, setCell] = useState<Cell>(undefined)
  const [hasError, setHasError] = useState(false)
  const [dashboardName, setDashboardName] = useState('')
  const [cellName, setCellName] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getDashboards())
  }, [dispatch])

  const handleSetActiveTab = useCallback((tab: ExportToDashboard): void => {
    setActiveTab(tab)
  }, [])

  const handleSetError = useCallback((value: boolean): void => {
    setHasError(value)
  }, [])

  const handleSetCellName = useCallback(
    (value: string): void => {
      if (hasError) {
        setHasError(false)
      }
      setCellName(value)
    },
    [hasError]
  )
  const handleSetDashboardName = useCallback(
    (value: string): void => {
      if (hasError) {
        setHasError(false)
      }
      setDashboardName(value)
    },
    [hasError]
  )

  const handleSetDashboard = useCallback(
    (dashboard: Dashboard): void => {
      if (hasError) {
        setHasError(false)
      }
      if (dashboard?.id !== selectedDashboard?.id) {
        setDashboard(dashboard)
        // reset the selected cell when the dashboard selection changes
        setCell(undefined)
        setCellName('')
      }
    },
    [hasError, selectedDashboard]
  )
  const handleSetCell = useCallback(
    (cell: Cell): void => {
      if (hasError) {
        setHasError(false)
      }
      setCell(cell)
    },
    [hasError]
  )

  const canSubmit = useCallback(() => {
    if (activeTab === ExportToDashboard.Create) {
      return !!dashboardName && cellName !== ''
    }
    if (selectedCell?.id === CREATE_CELL) {
      return cellName !== '' && !!selectedDashboard?.name
    }
    return !!selectedDashboard?.name && !!selectedCell?.name
  }, [activeTab, dashboardName, cellName, selectedCell, selectedDashboard])

  return (
    <DashboardOverlayContext.Provider
      value={{
        activeTab,
        canSubmit,
        handleSetActiveTab,
        handleSetError,
        handleSetCell,
        handleSetCellName,
        handleSetDashboard,
        handleSetDashboardName,
        hasError,
        cellName,
        selectedCell,
        selectedDashboard,
        dashboardName,
      }}
    >
      {children}
    </DashboardOverlayContext.Provider>
  )
}

export default DashboardOverlayProvider
