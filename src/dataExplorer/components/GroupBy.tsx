import React, {FC, useState, useMemo} from 'react'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {SelectGroup} from '@influxdata/clockface'

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

  const groupOptionsButtons = (
    <SelectGroup>
      {(Object.keys(GroupOptions) as (keyof typeof GroupOptions)[]).map(key => (
        <SelectGroup.Option
          key={key}
          id={key}
          active={selectedGroupOption === GroupOptions[key]}
          value={GroupOptions[key]}
          onClick={setSelectedGroupOption}
        >
          {GroupOptions[key]}
        </SelectGroup.Option>
      ))}
    </SelectGroup>
  )

  const groupBySelector =
    selectedGroupOption === GroupOptions.GroupBy ? <div>dropdown</div> : null

  return useMemo(() => {
    return (
      <div className="result-options--item">
        <SelectorTitle label="Group" tooltipContents={GROUP_TOOLTIP} />
        {groupOptionsButtons}
        {groupBySelector}
      </div>
    )
  }, [selectedGroupOption])
}

export {GroupBy}
