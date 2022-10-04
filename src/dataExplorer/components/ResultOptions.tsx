import React, {FC, useState} from 'react'

// Components
import {
  Accordion,
  FlexBox,
  InputLabel,
  SlideToggle,
} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Style
import './Sidebar.scss'

const TOOLTIP_CONTENT = {
  FIELDS_AS_COLUMNS: `test`,
  GROUP: `test`,
  AGGREGATE: `test`,
}

interface ToggleWithLabelToolTipProps {
  label: string
  active: boolean
  onChange: () => void
  tooltipContents?: string | JSX.Element
}

const ToggleWithLabelToolTip: FC<ToggleWithLabelToolTipProps> = ({
  label,
  active,
  onChange,
  tooltipContents = '',
}) => {
  return (
    <FlexBox>
      <SlideToggle active={active} onChange={onChange} />
      <InputLabel>
        <SelectorTitle label={label} tooltipContents={tooltipContents} />
      </InputLabel>
    </FlexBox>
  )
}

const ResultOptions: FC = () => {
  const [fieldsAsColumnsActive, setFieldsAsColumnsActive] = useState(false)
  const [groupActive, setGroupActive] = useState(false)
  const [aggregateActive, setAggregateActive] = useState(false)

  const fieldsAsColumns = (
    <FlexBox>
      <SlideToggle
        active={fieldsAsColumnsActive}
        onChange={() => setFieldsAsColumnsActive(current => !current)}
      />
      <InputLabel>
        <SelectorTitle
          label="Fields as Columns"
          tooltipContents={TOOLTIP_CONTENT.FIELDS_AS_COLUMNS}
        />
      </InputLabel>
    </FlexBox>
  )

  const group = (
    <ToggleWithLabelToolTip
      label="Group"
      active={groupActive}
      onChange={() => setGroupActive(current => !current)}
      tooltipContents={TOOLTIP_CONTENT.GROUP}
    />
  )

  const aggregate = (
    <ToggleWithLabelToolTip
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
