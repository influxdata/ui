import React, {FC, useState} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'

// Styles
import './Sidebar.scss'

const FIELDS_AS_COLUMNS_TOOLTIP = `test`

const FieldsAsColumns: FC = () => {
  const [fieldsAsColumns, setFieldsAsColumns] = useState(false)

  return (
    <ToggleWithLabelTooltip
      label="Fields as Columns"
      active={fieldsAsColumns}
      onChange={() => setFieldsAsColumns(current => !current)}
      tooltipContents={FIELDS_AS_COLUMNS_TOOLTIP}
    />
  )
}

export {FieldsAsColumns}
