import React, {FC} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from './SelectorTitle'

const FieldsSelector: FC = () => {
  return (
    <div>
      <SelectorTitle title="Fields" />
      <div>[ fields list... ]</div>
      <div>Load More</div>
      <Accordion>
        <Accordion.AccordionHeader>header</Accordion.AccordionHeader>
        <Accordion.AccordionBodyItem>example 1</Accordion.AccordionBodyItem>
        <Accordion.AccordionBodyItem>example 2</Accordion.AccordionBodyItem>
      </Accordion>
    </div>
  )
}

export default FieldsSelector
