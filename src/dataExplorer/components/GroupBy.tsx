import React, {FC, useContext, useMemo, useCallback, useEffect} from 'react'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {
  ButtonShape,
  SelectGroup,
  MultiSelectDropdown,
} from '@influxdata/clockface'

// Contexts
import {
  DEFAULT_COLUMNS,
  DEFAULT_GROUP_OPTIONS,
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
          resultOptions: {
            group: JSON.parse(JSON.stringify(DEFAULT_GROUP_OPTIONS)),
          },
        })
        return
      }

      setSelection({
        resultOptions: {
          group: {
            type: selectedGroupType,
            columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS)),
          },
        },
      })
      getGroupKeys(selection.bucket, selection.measurement)
    },
    // not including resetGroupKeys() and getGroupKeys() to avoid infinite loop
    [selection.bucket, selection.measurement]
  )

  const handleSelectGroupType = useCallback(
    (type: GroupType) => {
      setSelection({
        resultOptions: {
          group: {type, columns: JSON.parse(JSON.stringify(DEFAULT_COLUMNS))},
        },
      })
    },
    [setSelection]
  )

  const groupTypesButtons = useMemo(
    () => (
      <div className="result-options--item--row">
        <SelectGroup shape={ButtonShape.StretchToFit}>
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
      let selected: string[] = []
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
        {groupTypesButtons}
        {groupBySelector}
      </div>
    )
  }, [groupTypesButtons, groupBySelector])
}

export {GroupBy}
