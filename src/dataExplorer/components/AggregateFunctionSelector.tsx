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
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'

// Constants
import {AGGREGATE_FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

// Utilities
import {ComponentStatus} from '@influxdata/clockface'

export const AggregateFunctionsSelector: FC = () => {
  // Contexts
  const {selection, setSelection} = useContext(PersistanceContext)

  // State
  const [functionSearchTerm, setFunctionSearchTerm] = useState('')

  const {isOn, fn: selectedFunction}: AggregateWindow =
    selection?.resultOptions?.aggregateWindow || DEFAULT_AGGREGATE_WINDOW

  useEffect(() => {
    setFunctionSearchTerm('')
  }, [selection.bucket, selection.measurement])

  useEffect(() => {
    if (!isOn) {
      setFunctionSearchTerm('')
    }
  }, [isOn])

  const handleSelectFunction = useCallback(
    (fn: string) => {
      setSelection({
        resultOptions: {
          aggregateWindow: {
            ...selection?.resultOptions?.aggregateWindow,
            fn,
          },
        },
      })
      setFunctionSearchTerm('')
    },
    [selection.resultOptions.aggregateWindow, setSelection]
  )

  return useMemo(() => {
    return (
      isOn && (
        <div className="result-options--item--row">
          <SearchableDropdown
            options={AGGREGATE_FUNCTIONS.map(f => f.name)}
            selectedOption={selectedFunction || 'Select aggregate function'}
            onSelect={handleSelectFunction}
            searchPlaceholder="Search aggregate function"
            searchTerm={functionSearchTerm}
            onChangeSearchTerm={setFunctionSearchTerm}
            emptyText="No functions found"
            buttonStatus={ComponentStatus.Default}
            testID="aggregate-window--function--dropdown"
            buttonTestID="aggregate-window--function--dropdown-button"
            menuTestID="aggregate-window--function--dropdown-menu"
          />
        </div>
      )
    )
  }, [isOn, selectedFunction, functionSearchTerm, handleSelectFunction])
}
