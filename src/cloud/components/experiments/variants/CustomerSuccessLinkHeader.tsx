// Libraries
import React, {FC} from 'react'

// Components
import {
  ButtonShape,
  ComponentColor,
  ComponentSize,
  FlexBox,
  Heading,
  HeadingElement,
  IconFont,
  JustifyContent,
  LinkButton,
} from '@influxdata/clockface'

export const CustomerSuccessLinkHeader: FC<{}> = () => {
  return (
    <FlexBox
      justifyContent={JustifyContent.FlexEnd}
      margin={ComponentSize.Medium}
    >
      <Heading element={HeadingElement.H5}>Need help loading data?</Heading>
      <LinkButton
        className="load-data--contact-button"
        color={ComponentColor.Primary}
        icon={IconFont.Chat}
        shape={ButtonShape.Default}
        size={ComponentSize.Small}
        text="Speak with an Expert"
        href="https://calendly.com/c/EDCUW4IQ7Z4ZWYSB"
        target="_blank"
      />
    </FlexBox>
  )
}
