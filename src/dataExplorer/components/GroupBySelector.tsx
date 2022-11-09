import React, {FC, useCallback, useContext, useEffect, useMemo} from 'react'

// Components
import {MultiSelectDropdown} from '@influxdata/clockface'

// Contexts
import {
  GroupOptions,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'
import {GroupKeysContext} from 'src/dataExplorer/context/groupKeys'

// Utilies
import {toComponentStatus} from 'src/shared/utils/toComponentStatus'
import {event} from 'src/cloud/utils/reporting'

// Styles
import './Sidebar.scss'

export const GroupBySelector: FC = () => {
  const {groupKeys, loading, getGroupKeys, resetGroupKeys} =
    useContext(GroupKeysContext)
  const {selection, setSelection} = useContext(PersistanceContext)
  const {columns: selectedGroupKeys}: GroupOptions =
    selection.resultOptions.group

  useEffect(
    () => {
      if (!selection.bucket || !selection.measurement) {
        // empty the group keys list
        resetGroupKeys()
      } else {
        // update the group keys list whenever the selected measurement changes
        getGroupKeys(selection.bucket, selection.measurement)
      }
    },
    [selection.bucket, selection.measurement] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleSelectGroupKey = useCallback(
    (option: string): void => {
      let selected: string[] = []
      if (selectedGroupKeys.includes(option)) {
        selected = selectedGroupKeys.filter(item => item !== option)
        event('Deselect a group key', {selectedGroupKeyLength: selected.length})
      } else {
        selected = [...selectedGroupKeys, option]
        event('Select a group key', {selectedGroupKeyLength: selected.length})
      }
      setSelection({
        // TODO: check if type is overrite in session
        resultOptions: {group: {columns: selected}},
      })
    },
    [selectedGroupKeys, setSelection]
  )

  const _selectedGroupKeys = useMemo(
    () =>
      !selection.bucket || !selection.measurement ? [] : selectedGroupKeys,
    [selection.bucket, selection.measurement, selectedGroupKeys]
  )

  return useMemo(() => {
    return (
      <div className="result-options--item--row">
        <MultiSelectDropdown
          options={groupKeys}
          selectedOptions={_selectedGroupKeys}
          isSearchable={true}
          searchbarInputPlaceholder="Search the group keys"
          onSelect={handleSelectGroupKey}
          emptyText="Select group column values"
          buttonStatus={toComponentStatus(loading)}
        />
      </div>
    )
  }, [groupKeys, loading, _selectedGroupKeys, handleSelectGroupKey])
}
