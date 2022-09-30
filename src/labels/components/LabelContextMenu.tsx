// Libraries
import React, {PureComponent} from 'react'

// Components
import {ButtonShape} from '@influxdata/clockface'
import {
  IconFont,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
} from '@influxdata/clockface'

// Types
import {Label} from 'src/types'

interface Props {
  label: Label
  onDelete: (labelID: string) => void
}

export default class LabelContextMenu extends PureComponent<Props> {
  public render() {
    const {label, onDelete} = this.props

    return (
      <ConfirmationButton
        color={ComponentColor.Colorless}
        icon={IconFont.Trash_New}
        shape={ButtonShape.Square}
        size={ComponentSize.ExtraSmall}
        confirmationLabel="Yes, delete this label"
        onConfirm={() => {
          onDelete(label.id)
        }}
        confirmationButtonText="Confirm"
        testID={`context-delete-label ${label.name}`}
      />
    )
  }
}
