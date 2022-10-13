import React, {
  FC,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {SelectGroup, MultiSelectDropdown} from '@influxdata/clockface'

// Contexts
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {GroupKeysContext} from 'src/dataExplorer/context/groupKeys'

// Utilies
import {toComponentStatus} from 'src/shared/utils/toComponentStatus'

// Styles
import './Sidebar.scss'

const GROUP_TOOLTIP = `test`

enum GroupOptions {
  Default = 'Default',
  GroupBy = 'Group By',
  Ungroup = 'Ungroup',
}

const GroupBy: FC = () => {
  const {groupKeys, getGroupKeys, loading} = useContext(GroupKeysContext)
  const {selection} = useContext(PersistanceContext)
  const [selectedGroupOption, setSelectedGroupOption] = useState<GroupOptions>(
    GroupOptions.Default
  )
  const [selectedGroupKeys, setSelectedGroupKeys] = useState([])

  useEffect(
    () => {
      if (
        !selection.bucket ||
        !selection.measurement ||
        selectedGroupOption !== GroupOptions.GroupBy
      ) {
        return
      }

      getGroupKeys(selection.bucket, selection.measurement)
    },
    // getGroupKeys() is not included to avoid infinite loop
    [selection.bucket, selection.measurement, selectedGroupOption]
  )

  const groupOptionsButtons = useMemo(
    () => (
      <div className="result-options--item--row">
        <SelectGroup>
          {(Object.keys(GroupOptions) as (keyof typeof GroupOptions)[]).map(
            key => (
              <SelectGroup.Option
                key={key}
                id={key}
                active={selectedGroupOption === GroupOptions[key]}
                value={GroupOptions[key]}
                onClick={setSelectedGroupOption}
              >
                {GroupOptions[key]}
              </SelectGroup.Option>
            )
          )}
        </SelectGroup>
      </div>
    ),
    [selectedGroupOption]
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
      setSelectedGroupKeys(selected)
    },
    [selectedGroupKeys]
  )

  const groupBySelector = useMemo(() => {
    return selectedGroupOption === GroupOptions.GroupBy ? (
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
    selectedGroupOption,
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
