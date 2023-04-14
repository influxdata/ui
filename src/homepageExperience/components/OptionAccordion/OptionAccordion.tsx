// Libraries
import React, {FC, useRef} from 'react'

// Components
import {
  Accordion,
  Direction,
  FlexBox,
  FlexBoxChild,
  Heading,
  HeadingElement,
  Icon,
  IconFont,
  InfluxColors,
} from '@influxdata/clockface'

// Styles
import 'src/homepageExperience/components/OptionAccordion/OptionAccordion.scss'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface OwnProps {
  headerIcon: IconFont
  headerIconColor?: InfluxColors | string
  headerTitle: string
  headerDescription?: string
  optionId?: string
  bodyContent: JSX.Element
}

export const OptionAccordion: FC<OwnProps> = ({
  headerIcon = IconFont.CuboSolid,
  headerIconColor = InfluxColors.White,
  headerTitle,
  headerDescription,
  optionId,
  bodyContent,
}) => {
  const accordionHeaderRef = useRef<HTMLButtonElement>(null)

  const handleEventing = () => {
    const action = accordionHeaderRef.current.classList.contains(
      'cf-accordion--header--active'
    )
      ? 'collapsed'
      : 'expanded'
    event(`homeOptions.${optionId}.${action}`)
  }

  return (
    <Accordion
      iconPlacement={Direction.Right}
      className="option-accordion"
      onChange={handleEventing}
    >
      <Accordion.AccordionHeader ref={accordionHeaderRef}>
        <FlexBox>
          <FlexBoxChild
            grow={0}
            basis={90}
            className="option-accordion-header--icon"
          >
            <Icon glyph={headerIcon} style={{color: headerIconColor}} />
          </FlexBoxChild>
          <FlexBoxChild className="option-accordion-header--content">
            <Heading
              element={HeadingElement.H3}
              className="option-accordion-header--title"
            >
              {headerTitle}
            </Heading>
            <p className="option-accordion-header--description">
              {headerDescription}
            </p>
          </FlexBoxChild>
        </FlexBox>
      </Accordion.AccordionHeader>
      {bodyContent}
    </Accordion>
  )
}
