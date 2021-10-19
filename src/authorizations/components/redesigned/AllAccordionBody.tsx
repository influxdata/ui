import React, {FC, MouseEvent} from 'react'
import 'src/authorizations/components/redesigned/customApiTokenOverlay.scss'

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
  onToggleAll?: (name: string, permission: string) => void
  disabled: boolean
}

export const AllAccordionBody: FC<OwnProps> = props => {
  const {resourceName, disabled, permissions} = props

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

  return (
    <>
      <Accordion.AccordionBodyItem className="resource-accordion-body">
        <FlexBox
          margin={ComponentSize.Small}
          justifyContent={JustifyContent.SpaceBetween}
          direction={FlexDirection.Row}
          stretchToFitWidth={true}
          alignItems={AlignItems.Center}
          style={{textAlign: 'start'}}
        >
          <FlexBox.Child basis={40} grow={8}>
            <InputLabel
              size={ComponentSize.Small}
            >{`All ${resourceName}`}</InputLabel>
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
      </Accordion.AccordionBodyItem>
    </>
  )
}
