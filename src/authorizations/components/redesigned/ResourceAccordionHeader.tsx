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
  onToggleAll: (name: string, permission: string, value: boolean) => void
}

export const ResourceAccordionHeader: FC<OwnProps> = props => {
  const {resourceName} = props
  const readToggle = () => {
    const {permissions} = props
    let tag = true
    if (permissions && Object.keys(permissions).length > 0) {
      tag = !Object.keys(permissions).some(
        key => permissions[key].permissions.read === false
      )
    } else {
      return false
    }
    return tag
  }

  const writeToggle = () => {
    const {permissions} = props
    let tag = true
    if (permissions && Object.keys(permissions).length > 0) {
      tag = !Object.keys(permissions).some(
        key => permissions[key].permissions.write === false
      )
    } else {
      return false
    }
    return tag
  }

  const handleReadToggle = value => {
    const {onToggleAll, resourceName} = props
    onToggleAll(resourceName, 'read', value === 'true')
  }
  const handleWriteToggle = value => {
    const {onToggleAll, resourceName} = props
    onToggleAll(resourceName, 'write', value === 'true')
  }

  const accordionHeader = (title: string) => {
    return (
      <FlexBox
        margin={ComponentSize.Small}
        justifyContent={JustifyContent.SpaceBetween}
        direction={FlexDirection.Row}
        stretchToFitWidth={true}
        alignItems={AlignItems.Center}
        style={{textAlign: 'start'}}
        onClick={(e: any) => {
          e.stopPropagation()
        }}
      >
        <FlexBox.Child basis={40} grow={8}>
          <InputLabel size={ComponentSize.Medium}>{title}</InputLabel>
        </FlexBox.Child>
        <FlexBox.Child grow={1}>
          <Toggle
            id={resourceName}
            type={InputToggleType.Checkbox}
            onChange={handleReadToggle}
            size={ComponentSize.ExtraSmall}
            checked={readToggle()}
            value={readToggle().toString()}
            style={{marginRight: '10px'}}
            tabIndex={0}
            disabled={false}
          ></Toggle>
        </FlexBox.Child>
        <FlexBox.Child grow={1}>
          <Toggle
            id={resourceName + 1}
            type={InputToggleType.Checkbox}
            onChange={handleWriteToggle}
            size={ComponentSize.ExtraSmall}
            checked={writeToggle()}
            value={writeToggle().toString()}
            style={{marginRight: '10px'}}
            tabIndex={0}
            disabled={false}
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
