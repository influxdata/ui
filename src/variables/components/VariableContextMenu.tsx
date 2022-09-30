// Libraries
import React, {createRef, PureComponent, RefObject} from 'react'

// Components
import {ButtonShape} from '@influxdata/clockface'
import {
  IconFont,
  ComponentColor,
  ConfirmationButton,
  ComponentSize,
  FlexBox,
  SquareButton,
  Popover,
  Appearance,
  List,
} from '@influxdata/clockface'

// Types
import {Variable} from 'src/types'

interface Props {
  variable: Variable
  onExport: () => void
  onRename: () => void
  onDelete: (variable: Variable) => void
}

export default class VariableContextMenu extends PureComponent<Props> {
  public render() {
    const {variable} = this.props

    const settingsRef: RefObject<HTMLButtonElement> = createRef()
    return (
      <FlexBox margin={ComponentSize.ExtraSmall}>
        <ConfirmationButton
          color={ComponentColor.Colorless}
          icon={IconFont.Trash_New}
          shape={ButtonShape.Square}
          size={ComponentSize.ExtraSmall}
          confirmationLabel="Yes, delete this variable"
          onConfirm={this.deleteVariable}
          confirmationButtonText="Confirm"
          testID={`context-delete-variable ${variable.name}`}
        />
        <SquareButton
          ref={settingsRef}
          size={ComponentSize.ExtraSmall}
          icon={IconFont.CogSolid_New}
          color={ComponentColor.Colorless}
          testID="context-menu-variable"
        />
        <Popover
          appearance={Appearance.Outline}
          enableDefaultStyles={false}
          style={{minWidth: '112px'}}
          contents={this.getPopoverMenuItems}
          triggerRef={settingsRef}
        />
      </FlexBox>
    )
  }

  private getPopoverMenuItems = () => {
    const {onExport, onRename} = this.props
    return (
      <List>
        <List.Item
          onClick={onExport}
          size={ComponentSize.Small}
          style={{fontWeight: 500}}
          testID="context-export-variable"
        >
          Export
        </List.Item>
        <List.Item
          onClick={onRename}
          size={ComponentSize.Small}
          style={{fontWeight: 500}}
          testID="context-rename-variable"
        >
          Rename
        </List.Item>
      </List>
    )
  }
  private deleteVariable = () => {
    const {onDelete, variable} = this.props
    onDelete(variable)
  }
}
