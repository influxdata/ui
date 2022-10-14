import React, {FC, useContext, useMemo, useCallback, useEffect} from 'react'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {SelectGroup, MultiSelectDropdown} from '@influxdata/clockface'

// Contexts
import {
  GroupType,
  GroupOptions,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'
import {GroupKeysContext} from 'src/dataExplorer/context/groupKeys'

// Utilies
import {toComponentStatus} from 'src/shared/utils/toComponentStatus'

// Styles
import './Sidebar.scss'

const GROUP_TOOLTIP = `test`

const GroupBy: FC = () => {
  const {groupKeys, loading, getGroupKeys, resetGroupKeys} =
    useContext(GroupKeysContext)
  const {selection, setSelection} = useContext(PersistanceContext)
  const {type: selectedGroupType, columns: selectedGroupKeys}: GroupOptions =
    selection.resultOptions.group

  useEffect(
    () => {
      if (!selection.bucket || !selection.measurement) {
        resetGroupKeys()
        setSelection({
          resultOptions: {group: {type: GroupType.Default, columns: []}},
        })
        return
      }

      setSelection({
        resultOptions: {group: {type: selectedGroupType, columns: []}},
      })
      getGroupKeys(selection.bucket, selection.measurement)
    },
    // not including resetGroupKeys() and getGroupKeys() to avoid infinite loop
    [selection.bucket, selection.measurement]
  )

  const handleSelectGroupType = useCallback(
    (type: GroupType) => {
      if (type === GroupType.GroupBy) {
        setSelection({resultOptions: {group: {type, columns: []}}})
      } else {
        setSelection({resultOptions: {group: {type}}})
      }
    },
    [setSelection]
  )

  const groupOptionsButtons = useMemo(
    () => (
      <div className="result-options--item--row">
        <SelectGroup>
          {(Object.keys(GroupType) as (keyof typeof GroupType)[]).map(key => {
            const type: GroupType = GroupType[key]
            return (
              <SelectGroup.Option
                key={key}
                id={key}
                active={selectedGroupType === type}
                value={type}
                onClick={handleSelectGroupType}
              >
                {type}
              </SelectGroup.Option>
            )
          })}
        </SelectGroup>
      </div>
    ),
    [selectedGroupType, handleSelectGroupType]
  )

  const handleSelectGroupKey = useCallback(
    (option: string): void => {
      let selected = []
      if (selectedGroupKeys.includes(option)) {
        // de-select
        selected = selectedGroupKeys.filter(item => item !== option)
      } else {
        selected = [...selectedGroupKeys, option]
      }
      setSelection({
        resultOptions: {group: {type: selectedGroupType, columns: selected}},
      })
    },
    [selectedGroupType, selectedGroupKeys, setSelection]
  )

  const groupBySelector = useMemo(() => {
    return selectedGroupType === GroupType.GroupBy ? (
      <div className="result-options--item--row">
        <MultiSelectDropdown
          options={groupKeys}
          selectedOptions={selectedGroupKeys}
          onSelect={handleSelectGroupKey}
          emptyText="Select group column values"
          buttonStatus={toComponentStatus(loading)}
        />
      </div>
    ) : null
  }, [
    groupKeys,
    loading,
    selectedGroupKeys,
    handleSelectGroupKey,
    selectedGroupType,
  ])

  return useMemo(() => {
    return (
      <div className="result-options--item">
        <SelectorTitle label="Group" tooltipContents={GROUP_TOOLTIP} />
        {groupOptionsButtons}
        {groupBySelector}
      </div>
    )
  }, [groupOptionsButtons, groupBySelector])
}

export {GroupBy}
