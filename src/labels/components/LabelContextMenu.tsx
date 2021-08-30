// Libraries
import React, {PureComponent} from 'react'

// Components
import {Context} from 'src/clockface'
import {
  IconFont,
  ComponentColor,
  FlexBox,
  ConfirmationButton,
  ComponentSize,
  ButtonShape,
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
      <FlexBox>
        <ConfirmationButton
          color={ComponentColor.Colorless}
          size={ComponentSize.ExtraSmall}
          shape={ButtonShape.Square}
          icon={IconFont.Trash_New}
          confirmationLabel={'Yes, Delete this label'}
          onConfirm={() => {
            onDelete(label.id)
          }}
          confirmationButtonText={'Confirm'}
          testID={`context-delete-label`}
        ></ConfirmationButton>{' '}
      </FlexBox>
    )
  }
}
