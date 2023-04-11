// Libraries
import React, {FC, useEffect, useState, useRef} from 'react'

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

// Types
import {FlexBoxChildRef} from '@influxdata/clockface'

interface OwnProps {
  headerIcon: IconFont
  headerIconColor?: InfluxColors | string
  headerTitle: string
  headerDescription?: string
  bodyContent: JSX.Element
}

export const OptionAccordion: FC<OwnProps> = ({
  headerIcon = IconFont.CuboSolid,
  headerIconColor = InfluxColors.White,
  headerTitle,
  headerDescription,
  bodyContent,
}) => {
  const accordionHeadeIconRef = useRef<FlexBoxChildRef>(null)
  const [iconHeight, setIconHeight] = useState(0)

  useEffect(() => {
    accordionHeadeIconRef.current &&
      setIconHeight(accordionHeadeIconRef.current.clientHeight)
  })

  return (
    <Accordion iconPlacement={Direction.Right} className="option-accordion">
      <Accordion.AccordionHeader>
        <FlexBox>
          <FlexBoxChild
            grow={0}
            basis={iconHeight}
            className="option-accordion-header--icon"
            ref={accordionHeadeIconRef}
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
