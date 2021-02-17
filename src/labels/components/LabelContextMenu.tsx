// Libraries
import React, {PureComponent} from 'react'

// Components
import {
  IconFont,
  ComponentColor,
  ConfirmationButton,
  ComponentSize,
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
        size={ComponentSize.ExtraSmall}
        text="Delete"
        color={ComponentColor.Danger}
        icon={IconFont.Trash}
        confirmationLabel="Are you sure? This cannot be undone"
        confirmationButtonText="Confirm"
        returnValue={label.id}
        onConfirm={onDelete}
        testID="context-delete"
      />
    )
  }
}
