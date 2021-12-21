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

  const handleReadToggle = resourceName => {
    const {onToggleAll} = props
    onToggleAll(resourceName, 'read')
  }
  const handleWriteToggle = resourceName => {
    const {onToggleAll} = props
    onToggleAll(resourceName, 'write')
  }

  const handleFlexboxClick = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const readToggleStyle = {marginRight: '10px'}
  const writeToggleStyle = {marginRight: '0px'}

  const AllResourceAccordionBody = (permission?, resourceName?) => (
    <FlexBox
      margin={ComponentSize.Small}
      justifyContent={JustifyContent.SpaceBetween}
      direction={FlexDirection.Row}
      stretchToFitWidth={true}
      alignItems={AlignItems.Center}
    >
      <FlexBox.Child basis={40} grow={8}>
        <InputLabel size={ComponentSize.Small}>{`All ${
          resourceName ? resourceName : props.resourceName
        }`}</InputLabel>
      </FlexBox.Child>
      <FlexBox.Child grow={1} onClick={handleFlexboxClick}>
        <Toggle
          id={resourceName ? resourceName : props.resourceName}
          type={InputToggleType.Checkbox}
          onChange={handleReadToggle}
          size={ComponentSize.ExtraSmall}
          checked={permission ? permission.perm.read : permissions.read}
          value={permission ? permission.name : props.resourceName}
          style={readToggleStyle}
          tabIndex={0}
          disabled={disabled}
        ></Toggle>
      </FlexBox.Child>
      <FlexBox.Child grow={1} onClick={handleFlexboxClick}>
        <Toggle
          id={resourceName ? resourceName + 1 : props.resourceName + 1}
          type={InputToggleType.Checkbox}
          onChange={handleWriteToggle}
          size={ComponentSize.ExtraSmall}
          checked={permission ? permission.perm.write : permissions.write}
          value={permission ? permission.name : props.resourceName}
          style={writeToggleStyle}
          tabIndex={0}
          disabled={disabled}
        ></Toggle>
      </FlexBox.Child>
    </FlexBox>
  )

  const getAccordionBody = () => {
    return permissions.length !== 0 ? (
      Object.keys(permissions).map(key => {
        const names = permissions[key].name
        const resourceName = names.charAt(0).toUpperCase() + names.slice(1)

        return (
          <Accordion.AccordionBodyItem
            key={key}
            className="resource-accordion-body"
          >
            {AllResourceAccordionBody(permissions[key], resourceName)}
          </Accordion.AccordionBodyItem>
        )
      })
    ) : (
      <Accordion.AccordionBodyItem className="resource-accordion-error">
        {`No ${resourceName.replace('All ', '')} match your search term`}
      </Accordion.AccordionBodyItem>
    )
  }

  return (
    <>
      {resourceName === 'All Resources' ? (
        getAccordionBody()
      ) : (
        <Accordion.AccordionBodyItem className="resource-accordion-body">
          {AllResourceAccordionBody()}
        </Accordion.AccordionBodyItem>
      )}
    </>
  )
}
