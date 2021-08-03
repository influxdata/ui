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

import GetResources from 'src/resources/components/GetResources'
import {ResourceType} from 'src/types'
import TelegrafAccordion from './TelegrafAccordion'
import BucketAccordion from './BucketAccordion'
import ResourceAccordion from './ResourceAccordion'

interface OwnProps {
  resource: string
}

export const ResourceAccordionHeader: FC<OwnProps> = props => {
  const {resource} = props

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
  const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1)
  console.log('resourceName', resourceName)

  return (
    <Accordion key={resource}>
      <Accordion.AccordionHeader>
        {accordionHeader(resourceName)}
      </Accordion.AccordionHeader>
      <GetResources resources={[ResourceType[resourceName]]}>
        <ResourceAccordion resource={resource} />
        {/* {resourceName === 'Telegrafs' ? (
          <TelegrafAccordion />
        ) : (
          <BucketAccordion />
        )} */}
      </GetResources>
    </Accordion>
  )
}
