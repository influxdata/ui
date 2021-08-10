import React, {FC} from 'react'

// Components
import {
  Accordion,
  FlexBox,
  AlignItems,
  FlexDirection,
  ComponentSize,
  JustifyContent,
  InputLabel,
  Toggle,
  InputToggleType,
} from '@influxdata/clockface'

interface OwnProps {
  resourceName: string
  permissions: any
}

export const ResourceAccordionHeader: FC<OwnProps> = props => {
  const {resourceName} = props
  const accordionHeader = (title: string) => {
    return (
      <FlexBox
        margin={ComponentSize.Small}
        justifyContent={JustifyContent.SpaceBetween}
        direction={FlexDirection.Row}
        stretchToFitWidth={true}
        alignItems={AlignItems.Center}
        style={{textAlign: 'start'}}
      >
        <FlexBox.Child basis={40} grow={8}>
          <InputLabel size={ComponentSize.Medium}>{title}</InputLabel>
        </FlexBox.Child>
        <FlexBox.Child grow={1}>
          <Toggle
            id="1"
            type={InputToggleType.Checkbox}
            onChange={() => {}}
            size={ComponentSize.ExtraSmall}
            checked={true}
            style={{marginRight: '10px'}}
            tabIndex={0}
            disabled={false}
            onKeyUp={(e: any) => {
              e.stopPropagation()
            }}
          ></Toggle>
        </FlexBox.Child>
        <FlexBox.Child grow={1}>
          <Toggle
            id="2"
            type={InputToggleType.Checkbox}
            onChange={() => {}}
            size={ComponentSize.ExtraSmall}
            checked={true}
            style={{marginRight: '10px'}}
            tabIndex={0}
            disabled={false}
            onKeyUp={(e: any) => {
              e.stopPropagation()
            }}
          ></Toggle>
        </FlexBox.Child>
      </FlexBox>
    )
  }

  return (
    <Accordion.AccordionHeader>
      {accordionHeader(resourceName)}
    </Accordion.AccordionHeader>
  )
}
