import React, {FC, useCallback, useContext, useMemo} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'

// Contexts
import {
  AggregateWindow,
  DEFAULT_AGGREGATE_WINDOW,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'

// Styles
import './Sidebar.scss'

export const FillValuesToggle: FC = () => {
  const {selection, setSelection} = useContext(PersistanceContext)
  const {isOn, createEmpty}: AggregateWindow =
    selection.resultOptions?.aggregateWindow || DEFAULT_AGGREGATE_WINDOW

  const handleToggleCreateEmpty = useCallback(() => {
    const createEmpty = !selection.resultOptions?.aggregateWindow?.createEmpty
    setSelection({
      resultOptions: {
        aggregateWindow: {
          ...selection.resultOptions?.aggregateWindow,
          createEmpty,
        },
      },
    })
  }, [selection.resultOptions?.aggregateWindow, setSelection])

  return useMemo(() => {
    return (
      isOn && (
        <ToggleWithLabelTooltip
          label="Fill missing values"
          active={createEmpty}
          onChange={handleToggleCreateEmpty}
        />
      )
    )
  }, [isOn, createEmpty, handleToggleCreateEmpty])
}
