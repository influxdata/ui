import React, {FC, useCallback, useContext} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'
import {event} from 'src/cloud/utils/reporting'

// Styles
import './Sidebar.scss'

const FieldsAsColumns: FC = () => {
  const {selection, setSelection} = useContext(PersistanceContext)

  const handleToggle = useCallback(() => {
    const value = !selection?.resultOptions?.fieldsAsColumn
    event('set fields as columns: ', {value: `${value}`})
    setSelection({
      resultOptions: {
        ...selection.resultOptions,
        fieldsAsColumn: value,
      },
    })
  }, [selection.resultOptions, setSelection])

  return (
    <ToggleWithLabelTooltip
      label="Fields as Columns"
      active={!!selection?.resultOptions?.fieldsAsColumn}
      onChange={handleToggle}
      tooltipContents={
        <>
          <code>schema.fieldsAsCols()</code> is a special application of{' '}
          <code>pivot()</code> that pivots input data on <code>_field</code> and{' '}
          <code>_time</code> columns to align fields within each input table
          that have the same timestamp.
        </>
      }
    />
  )
}

export {FieldsAsColumns}
