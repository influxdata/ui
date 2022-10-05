import React, {FC, useState} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import {FieldsAsColumns} from 'src/dataExplorer/components/FieldsAsColumns'
import {GroupBy} from 'src/dataExplorer/components/GroupBy'

// Style
import './Sidebar.scss'

const TOOLTIP_CONTENT = {
  AGGREGATE: `test`,
}

const ResultOptions: FC = () => {
  const [aggregateActive, setAggregateActive] = useState(false)

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
      <FieldsAsColumns />
      <GroupBy />
      {aggregate}
    </Accordion>
  )
}

export {ResultOptions}
