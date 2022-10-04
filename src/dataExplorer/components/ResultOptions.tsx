import React, {useState} from 'react'

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
  FIELDS_AS_COLUMNS: `Tooltip content for Fields as Columns`,
}

const ResultOptions = () => {
  const [fieldsAsColumnsOn, setFieldsAsColumnsOn] = useState(false)

  const fieldsAsColumns = (
    <FlexBox>
      <SlideToggle
        active={fieldsAsColumnsOn}
        onChange={() => setFieldsAsColumnsOn(current => !current)}
      />
      <InputLabel>
        <SelectorTitle
          label="Fields as Columns"
          tooltipContents={TOOLTIP_CONTENT.FIELDS_AS_COLUMNS}
        />
      </InputLabel>
    </FlexBox>
  )

  return (
    <Accordion className="result-options" expanded={true}>
      <Accordion.AccordionHeader className="result-options--header">
        Result Options
      </Accordion.AccordionHeader>
      {fieldsAsColumns}
    </Accordion>
  )
}

export {ResultOptions}
