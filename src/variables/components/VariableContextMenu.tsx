// Libraries
import React, {PureComponent} from 'react'

// Components
import {ButtonShape, Context} from 'src/clockface'
import {
  IconFont,
  ComponentColor,
  ConfirmationButton,
  ComponentSize,
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
      <Context>
        <Context.Menu icon={IconFont.CogSolid_New}>
          <Context.Item label="Export" action={onExport} />
          <Context.Item
            label="Rename"
            action={onRename}
            testID="context-rename-variable"
          />
        </Context.Menu>
        <ConfirmationButton
          color={ComponentColor.Colorless}
          icon={IconFont.Trash_New}
          shape={ButtonShape.Square}
          size={ComponentSize.ExtraSmall}
          confirmationLabel="Yes, Delete this Variable"
          onConfirm={() => {
            onDelete(variable)
          }}
          confirmationButtonText="Confirm"
          testID={`context-delete-menu ${variable.name}`}
        />
      </Context>
    )
  }
}
