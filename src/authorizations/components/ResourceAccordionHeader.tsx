import React, {FC} from 'react'
import 'src/authorizations/components/customApiTokenOverlay.scss'

// Components
import {
  Accordion,
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
  JustifyContent,
  InputLabel,
} from '@influxdata/clockface'

interface OwnProps {
  resourceName: string
}

export const ResourceAccordionHeader: FC<OwnProps> = props => {
  const {resourceName} = props

  return (
    <Accordion.AccordionHeader>
      <FlexBox
        margin={ComponentSize.Small}
        justifyContent={JustifyContent.SpaceBetween}
        direction={FlexDirection.Row}
        stretchToFitWidth={true}
        alignItems={AlignItems.Center}
        style={{textAlign: 'start'}}
      >
        <FlexBox.Child basis={40} grow={8}>
          <InputLabel size={ComponentSize.Medium}>{resourceName}</InputLabel>
        </FlexBox.Child>
      </FlexBox>
    </Accordion.AccordionHeader>
  )
}
