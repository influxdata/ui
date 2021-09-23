// Libraries
import React, {PureComponent} from 'react'

// Components
import {ButtonShape} from 'src/clockface'
<<<<<<< HEAD
import {IconFont, ComponentColor, ComponentSize, ConfirmationButton} from '@influxdata/clockface'
=======
import {
  IconFont,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
} from '@influxdata/clockface'
>>>>>>> chore: prettier

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
        confirmationLabel="Yes, Delete this Label"
        onConfirm={() => {
          onDelete(label.id)
        }}
        confirmationButtonText="Confirm"
        testID={`context-delete-label ${label.name}`}
      />
    )
  }
}
