import React, {FC, useContext, useMemo, useCallback, useEffect} from 'react'

// Components
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import {GroupBySelector} from 'src/dataExplorer/components/GroupBySelector'
import {ButtonShape, SelectGroup} from '@influxdata/clockface'

// Contexts
import {
  DEFAULT_GROUP_OPTIONS,
  GroupType,
  GroupOptions,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'

// Utilies
import {event} from 'src/cloud/utils/reporting'

// Styles
import './Sidebar.scss'

const GROUP_TOOLTIP = `test`
const DEFAULT_COLUMNS: string[] = ['_measurement', '_field'] // only use this when the GroupType.GroupBy is selected

const GroupBy: FC = () => {
  const {selection, setSelection} = useContext(PersistanceContext)
  const {type: selectedGroupType}: GroupOptions = selection.resultOptions.group

  useEffect(
    () => {
      setSelection({
        resultOptions: {
          group: JSON.parse(JSON.stringify(DEFAULT_GROUP_OPTIONS)),
        },
      })
    },
    [selection.bucket, selection.measurement] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const handleSelectGroupType = useCallback(
    (type: GroupType) => {
      event('Select a group type', {groupType: type})
      const columns: string[] =
        type === GroupType.GroupBy
          ? JSON.parse(JSON.stringify(DEFAULT_COLUMNS))
          : []
      setSelection({
        resultOptions: {
          group: {type, columns},
        },
      })
    },
    [setSelection]
  )

  const groupTypesButtons = useMemo(
    () => (
      <div className="result-options--item--row">
        <SelectGroup shape={ButtonShape.StretchToFit}>
          {Object.entries(GroupType).map(([key, type]) => (
            <SelectGroup.Option
              key={key}
              id={key}
              active={selectedGroupType === type}
              value={type}
              onClick={handleSelectGroupType}
            >
              {type}
            </SelectGroup.Option>
          ))}
        </SelectGroup>
      </div>
    ),
    [selectedGroupType, handleSelectGroupType]
  )

  return useMemo(() => {
    return (
      <div className="result-options--item">
        <SelectorTitle label="Group" tooltipContents={GROUP_TOOLTIP} />
        {groupTypesButtons}
        <GroupBySelector />
      </div>
    )
  }, [groupTypesButtons])
}

export {GroupBy}
