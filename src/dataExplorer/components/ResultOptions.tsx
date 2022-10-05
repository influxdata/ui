import React, {FC, useState} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import {FieldsAsColumns} from 'src/dataExplorer/components/FieldsAsColumns'

// Style
import './Sidebar.scss'

const TOOLTIP_CONTENT = {
  GROUP: `test`,
  AGGREGATE: `test`,
}

const ResultOptions: FC = () => {
  const [groupActive, setGroupActive] = useState(false)
  const [aggregateActive, setAggregateActive] = useState(false)

  const fieldsAsColumns = <FieldsAsColumns />

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
