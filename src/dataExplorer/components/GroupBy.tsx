import React, {FC, useState, useMemo, useCallback} from 'react'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {SelectGroup, MultiSelectDropdown} from '@influxdata/clockface'

// Styles
import './Sidebar.scss'

const GROUP_TOOLTIP = `test`

enum GroupOptions {
  Default = 'Default',
  GroupBy = 'Group By',
  Ungroup = 'Ungroup',
}

const GroupBy: FC = () => {
  const [selectedGroupOption, setSelectedGroupOption] = useState<GroupOptions>(
    GroupOptions.Default
  )
  const [selectedGroupKeys, setSelectedGroupKeys] = useState([])

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
          options={['opt1', 'opt2', 'opt3', 'opt4']}
          selectedOptions={selectedGroupKeys}
          onSelect={handleSelectGroupKey}
          emptyText="Select group column values"
        />
      </div>
    ) : null
  }, [selectedGroupKeys, handleSelectGroupKey, selectedGroupOption])

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
