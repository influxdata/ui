import React, {FC, MouseEvent} from 'react'

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
  onToggleAll: (name: string, permission: string) => void
  disabled: boolean
}

export const ResourceAccordionHeader: FC<OwnProps> = props => {
  const {resourceName, disabled} = props

  const handleReadToggle = () => {
    const {onToggleAll, resourceName} = props
    onToggleAll(resourceName, 'read')
  }
  const handleWriteToggle = () => {
    const {onToggleAll, resourceName} = props
    onToggleAll(resourceName, 'write')
  }

  const handleFlexboxClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const accordionHeader = (title: string) => {
    const {permissions} = props
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
        <FlexBox.Child grow={1} onClick={handleFlexboxClick}>
          <Toggle
            id={resourceName}
            type={InputToggleType.Checkbox}
            onChange={handleReadToggle}
            size={ComponentSize.ExtraSmall}
            checked={permissions.read}
            value={permissions.read.toString()}
            style={{marginRight: '10px'}}
            tabIndex={0}
            disabled={disabled}
          ></Toggle>
        </FlexBox.Child>
        <FlexBox.Child grow={1} onClick={handleFlexboxClick}>
          <Toggle
            id={resourceName + 1}
            type={InputToggleType.Checkbox}
            onChange={handleWriteToggle}
            size={ComponentSize.ExtraSmall}
            checked={permissions.write}
            value={permissions.write.toString()}
            style={{marginRight: '0px'}}
            tabIndex={0}
            disabled={disabled}
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
