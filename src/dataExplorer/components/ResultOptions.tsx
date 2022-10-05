import React, {FC, useState} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'

// Style
import './Sidebar.scss'

const TOOLTIP_CONTENT = {
  FIELDS_AS_COLUMNS: `test`,
  GROUP: `test`,
  AGGREGATE: `test`,
}

const ResultOptions: FC = () => {
  const [fieldsAsColumnsActive, setFieldsAsColumnsActive] = useState(false)
  const [groupActive, setGroupActive] = useState(false)
  const [aggregateActive, setAggregateActive] = useState(false)

  const fieldsAsColumns = (
    <ToggleWithLabelTooltip
      label="Fields as Columns"
      active={fieldsAsColumnsActive}
      onChange={() => setFieldsAsColumnsActive(current => !current)}
      tooltipContents={TOOLTIP_CONTENT.FIELDS_AS_COLUMNS}
    />
  )

  const group = (
    <ToggleWithLabelTooltip
      label="Group"
      active={groupActive}
      onChange={() => setGroupActive(current => !current)}
      tooltipContents={TOOLTIP_CONTENT.GROUP}
    />
  )

  const aggregate = (
    <ToggleWithLabelTooltip
      label="Aggregate"
      active={aggregateActive}
      onChange={() => setAggregateActive(current => !current)}
      tooltipContents={TOOLTIP_CONTENT.AGGREGATE}
    />
  )

  return (
    <Accordion className="result-options" expanded={true}>
      <Accordion.AccordionHeader className="result-options--header">
        Result Options
      </Accordion.AccordionHeader>
      {fieldsAsColumns}
      {group}
      {aggregate}
    </Accordion>
  )
}

export {ResultOptions}
