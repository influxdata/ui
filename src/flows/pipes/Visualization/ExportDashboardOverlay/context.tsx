import React, {FC, useState, useCallback, useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {View, Dashboard} from 'src/types'
import {getDashboards} from 'src/dashboards/actions/thunks'

export enum ExportToDashboard {
  Create = 'create',
  Update = 'update',
}

interface ContextType {
  activeTab: ExportToDashboard
  validateForm: () => boolean
  handleSetActiveTab: (tab: ExportToDashboard) => void
  handleSetCell: (cell: View) => void
  handleSetCellName: (value: string) => void
  handleSetDashboard: (dashboard: Dashboard) => void
  handleSetDashboardName: (value: string) => void
  cellName: string
  cellNameError: string
  selectedCell: View | undefined
  selectedCellError: string
  selectedDashboard: Dashboard | undefined
  selectedDashboardError: string
  dashboardName: string
  dashboardNameError: string
}

const DEFAULT_CONTEXT: ContextType = {
  activeTab: ExportToDashboard.Create,
  validateForm: () => false,
  handleSetActiveTab: () => {},
  handleSetCell: () => {},
  handleSetCellName: () => {},
  handleSetDashboard: () => {},
  handleSetDashboardName: () => {},
  cellName: '',
  cellNameError: '',
  selectedCell: undefined,
  selectedCellError: '',
  selectedDashboard: undefined,
  selectedDashboardError: '',
  dashboardName: '',
  dashboardNameError: '',
}

export const Context = React.createContext<ContextType>(DEFAULT_CONTEXT)

export const CREATE_CELL = 'CREATE_CELL'

export const Provider: FC = ({children}) => {
  const [activeTab, setActiveTab] = useState(ExportToDashboard.Create)
  const [selectedDashboard, setDashboard] = useState<Dashboard>(undefined)
  const [selectedDashboardError, setSelectedDashboardError] = useState<string>(
    ''
  )
  const [selectedCell, setCell] = useState<View>(undefined)
  const [selectedCellError, setSelectedCellError] = useState<string>('')
  const [dashboardName, setDashboardName] = useState<string>('')
  const [dashboardNameError, setDashboardNameError] = useState<string>('')
  const [cellName, setCellName] = useState<string>('')
  const [cellNameError, setCellNameError] = useState<string>('')

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getDashboards())
  }, [dispatch])

  const handleSetActiveTab = useCallback((tab: ExportToDashboard): void => {
    setActiveTab(tab)
  }, [])

  const handleSetCellName = useCallback(
    (value: string): void => {
      if (!!value) {
        setCellNameError('')
      }
      setCellName(value)
    },
    [setCellName]
  )

  const handleSetDashboardName = useCallback(
    (value: string): void => {
      if (!!value) {
        setDashboardNameError('')
      }
      setDashboardName(value)
    },
    [setDashboardName]
  )

  const handleSetDashboard = useCallback(
    (dashboard: Dashboard): void => {
      if (dashboard?.id !== selectedDashboard?.id) {
        setDashboard(dashboard)
        setSelectedDashboardError('')
        // reset the selected cell when the dashboard selection changes
        setCell(undefined)
        setCellName('')
      }
    },
    [setCell, selectedDashboard]
  )

  const handleSetCell = useCallback(
    (cell: View): void => {
      setSelectedCellError('')
      setCell(cell)
    },
    [setCell]
  )

  const validateCreateForm = (): boolean => {
    let valid = true
    if (!dashboardName) {
      setDashboardNameError('This field is required')
      valid = false
    } else {
      setDashboardNameError('')
    }

    if (!cellName) {
      setCellNameError('This field is required')
      valid = false
    } else {
      setCellNameError('')
    }

    return valid
  }

  const validateUpdateForm = (): boolean => {
    let valid = true

    if (!selectedDashboard) {
      valid = false
      setSelectedDashboardError('Choose a dashboard')
    } else {
      setSelectedDashboardError('')
    }

    if (!selectedCell) {
      valid = false
      setSelectedCellError('Choose a cell')
    } else {
      setSelectedCellError('')
    }

    if (!!selectedCell && selectedCell.id === CREATE_CELL && !cellName) {
      valid = false
      setCellNameError('This field is required')
    } else {
      setCellNameError('')
    }

    return valid
  }

  const validateForm = (): boolean => {
    if (activeTab == ExportToDashboard.Create) {
      return validateCreateForm()
    }

    return validateUpdateForm()
  }

  return (
    <Context.Provider
      value={{
        activeTab,
        validateForm,
        handleSetActiveTab,
        handleSetCell,
        handleSetCellName,
        handleSetDashboard,
        handleSetDashboardName,
        cellName,
        cellNameError,
        selectedCell,
        selectedCellError,
        selectedDashboard,
        selectedDashboardError,
        dashboardName,
        dashboardNameError,
      }}
    >
      {children}
    </Context.Provider>
  )
}
