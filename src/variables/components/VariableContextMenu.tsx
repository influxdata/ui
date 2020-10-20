// Libraries
import React, {PureComponent} from 'react'

// Components
import {
  Button,
  IconFont,
  ComponentColor,
  ConfirmationButton,
  ComponentSize,
  FlexBox,
  FlexDirection,
  AlignItems,
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
    const {variable, onExport, onRename, onDelete} = this.props

    return (
      <FlexBox
        alignItems={AlignItems.Center}
        direction={FlexDirection.Row}
        margin={ComponentSize.Small}
      >
        <Button
          onClick={onRename}
          text="Rename"
          icon={IconFont.Pencil}
          size={ComponentSize.ExtraSmall}
          testID="context-rename-variable"
        />
        <Button
          onClick={onExport}
          text="Export"
          icon={IconFont.Export}
          size={ComponentSize.ExtraSmall}
        />
        <ConfirmationButton
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Danger}
          icon={IconFont.Trash}
          text="Delete"
          confirmationLabel="Are you sure? This cannot be undone"
          confirmationButtonText="Confirm Delete"
          returnValue={variable}
          onConfirm={onDelete}
          testID="context-delete"
        />
      </FlexBox>
    )
  }
}
