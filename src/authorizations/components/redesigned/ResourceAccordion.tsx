// Libraries
import React, {PureComponent} from 'react'
import {connect} from 'react-redux'

// Clockface
import {
  Accordion,
  FlexBox,
  ComponentSize,
  JustifyContent,
  FlexDirection,
  AlignItems,
  InputLabel,
  Toggle,
  InputToggleType,
} from '@influxdata/clockface'

// Types
import {AppState, Telegraf, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'

interface Props {
  resources: any[]
}

export class ResourceAccordion extends PureComponent<Props, {}> {
  public render() {
    const {resources} = this.props
    console.log(resources)
    const accordionBody = title => (
      <FlexBox
        margin={ComponentSize.Small}
        justifyContent={JustifyContent.SpaceBetween}
        direction={FlexDirection.Row}
        stretchToFitWidth={true}
        alignItems={AlignItems.Center}
        /* onClick={(e: MouseEvent<HTMLElement>) => {
          e.stopPropagation()
        }} */
        style={{textAlign: 'start'}}
      >
        <FlexBox.Child basis={40} grow={8}>
          <InputLabel size={ComponentSize.Medium}>{title}</InputLabel>
        </FlexBox.Child>
        <FlexBox.Child grow={1}>
          <Toggle
            id="0"
            type={InputToggleType.Checkbox}
            onChange={() => {}}
            size={ComponentSize.ExtraSmall}
            checked={true}
            style={{marginRight: '10px'}}
            tabIndex={0}
            disabled={false}
          ></Toggle>
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
          ></Toggle>
        </FlexBox.Child>
      </FlexBox>
    )

    return (
      <>
        <Accordion.AccordionBodyItem>
          Individual Telegraf Configurations
        </Accordion.AccordionBodyItem>
        {resources.map(telegraf => (
          <Accordion.AccordionBodyItem key={telegraf.id}>
            {accordionBody(telegraf.name)}
          </Accordion.AccordionBodyItem>
        ))}
      </>
    )
  }
}
