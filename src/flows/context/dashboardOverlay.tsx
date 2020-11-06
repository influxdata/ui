import React, {FC, useState, useCallback, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {View, Dashboard} from 'src/types'
import {getDashboards} from 'src/dashboards/actions/thunks'

export enum ExportToDashboard {
  Create = 'create',
  Update = 'update',
}

export interface DashboardOverlayContext {
  activeTab: ExportToDashboard
  canSubmit: () => boolean
  handleSetActiveTab: (tab: ExportToDashboard) => void
  handleSetCell: (cell: View) => void
  handleSetCellName: (value: string) => void
  handleSetDashboard: (dashboard: Dashboard) => void
  handleSetDashboardName: (value: string) => void
  cellName: string
  selectedCell: View | undefined
  selectedDashboard: Dashboard | undefined
  dashboardName: string
}

export const DEFAULT_CONTEXT: DashboardOverlayContext = {
  activeTab: ExportToDashboard.Create,
  canSubmit: () => false,
  handleSetActiveTab: () => {},
  handleSetCell: () => {},
  handleSetCellName: () => {},
  handleSetDashboard: () => {},
  handleSetDashboardName: () => {},
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
  const [selectedCell, setCell] = useState<View>(undefined)
  const [dashboardName, setDashboardName] = useState('')
  const [cellName, setCellName] = useState('')

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getDashboards())
  }, [dispatch])

  const handleSetActiveTab = useCallback((tab: ExportToDashboard): void => {
    setActiveTab(tab)
  }, [])

  const handleSetCellName = useCallback(
    (value: string): void => {
      setCellName(value)
    },
    [setCellName]
  )
  const handleSetDashboardName = useCallback(
    (value: string): void => {
      setDashboardName(value)
    },
    [setDashboardName]
  )

  const handleSetDashboard = useCallback(
    (dashboard: Dashboard): void => {
      if (dashboard?.id !== selectedDashboard?.id) {
        setDashboard(dashboard)
        // reset the selected cell when the dashboard selection changes
        setCell(undefined)
        setCellName('')
      }
    },
    [setCell, selectedDashboard]
  )
  const handleSetCell = useCallback(
    (cell: View): void => {
      setCell(cell)
    },
    [setCell]
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
        handleSetCell,
        handleSetCellName,
        handleSetDashboard,
        handleSetDashboardName,
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
