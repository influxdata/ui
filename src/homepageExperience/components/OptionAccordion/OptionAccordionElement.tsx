// Libraries
import React, {FC} from 'react'

// Components
import {Accordion, Heading, HeadingElement} from '@influxdata/clockface'

interface OwnProps {
  elementTitle: string | JSX.Element
  elementDescription?: string
  bodyContent?: () => JSX.Element
  cta?: () => JSX.Element
}

export const OptionAccordionElement: FC<OwnProps> = ({
  elementTitle,
  elementDescription,
  bodyContent,
  cta,
}) => {
  return (
    <Accordion.AccordionBodyItem className="option-accordion-element">
      <div className="option-accordion-element--content">
        <Heading
          element={HeadingElement.H4}
          className="option-accordion-element--header"
        >
          {elementTitle}
        </Heading>
        {elementDescription && (
          <p className="option-accordion-element--description">
            {elementDescription}
          </p>
        )}
        {bodyContent && bodyContent()}
      </div>
      {cta && cta()}
    </Accordion.AccordionBodyItem>
  )
}
