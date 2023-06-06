import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// Components
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Contexts
import {
  AggregateWindow,
  DEFAULT_AGGREGATE_WINDOW,
  PersistenceContext,
} from 'src/dataExplorer/context/persistence'
import {ColumnsContext} from 'src/dataExplorer/context/columns'

// Utilities
import {toComponentStatus} from 'src/shared/utils/toComponentStatus'

// Styles
import './Sidebar.scss'

export const ColumnSelector: FC = () => {
  // Contexts
  const {selection, setSelection} = useContext(PersistenceContext)
  const {columns, loading, getColumns, resetColumns} =
    useContext(ColumnsContext)

  // States
  const [columnSearchTerm, setColumnSearchTerm] = useState('')
  const {isOn, column: selectedColumn}: AggregateWindow =
    selection.resultOptions?.aggregateWindow || DEFAULT_AGGREGATE_WINDOW

  useEffect(() => {
    if (!selection.bucket || !selection.measurement) {
      resetColumns()
    } else {
      getColumns(selection.bucket, selection.measurement)
    }

    setColumnSearchTerm('')
  }, [selection.bucket, selection.measurement])

  useEffect(() => {
    if (!isOn) {
      setColumnSearchTerm('')
    }
  }, [isOn])

  const handleSelectColumn = useCallback(
    (column: string) => {
      let _column = column
      if (selection.resultOptions?.aggregateWindow?.column === column) {
        _column = ''
      }
      setSelection({
        resultOptions: {
          aggregateWindow: {
            ...selection.resultOptions?.aggregateWindow,
            column: _column,
          },
        },
      })
      setColumnSearchTerm('')
    },
    [selection.resultOptions?.aggregateWindow, setSelection]
  )

  return useMemo(() => {
    return (
      isOn && (
        <div className="result-options--item--row">
          <SearchableDropdown
            options={columns}
            selectedOption={selectedColumn || 'Select column'}
            onSelect={handleSelectColumn}
            searchPlaceholder="Search columns"
            searchTerm={columnSearchTerm}
            onChangeSearchTerm={setColumnSearchTerm}
            emptyText="No columns found"
            buttonStatus={toComponentStatus(loading)}
            testID="aggregate-window--column--dropdown"
            buttonTestID="aggregate-window--column--dropdown-button"
            menuTestID="aggregate-window--column--dropdown-menu"
          />
        </div>
      )
    )
  }, [
    isOn,
    columns,
    loading,
    selectedColumn,
    columnSearchTerm,
    handleSelectColumn,
  ])
}
