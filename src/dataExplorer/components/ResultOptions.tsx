import React, {FC} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import {FieldsAsColumns} from 'src/dataExplorer/components/FieldsAsColumns'
import {GroupBy} from 'src/dataExplorer/components/GroupBy'
import {Aggregate} from 'src/dataExplorer/components/Aggregate'

// Style
import './Sidebar.scss'

const ResultOptions: FC = () => {
  return (
    <Accordion className="result-options" expanded={true}>
      <Accordion.AccordionHeader className="result-options--header">
        Result Options
      </Accordion.AccordionHeader>
      <FieldsAsColumns />
      <GroupBy />
      <Aggregate />
    </Accordion>
  )
}

export {ResultOptions}
