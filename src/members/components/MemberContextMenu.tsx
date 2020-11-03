// Libraries
import React, {PureComponent} from 'react'

// Components
import {Member} from 'src/types'
import CloudExclude from 'src/shared/components/cloud/CloudExclude'
import {
  IconFont,
  ComponentColor,
  ConfirmationButton,
  ComponentSize,
  ButtonShape,
} from '@influxdata/clockface'

interface Props {
  member: Member
  onDelete: (member: Member) => void
}

export default class MemberContextMenu extends PureComponent<Props> {
  public render() {
    const {member, onDelete} = this.props

    return (
      <CloudExclude>
        <ConfirmationButton
          color={ComponentColor.Danger}
          icon={IconFont.Trash}
          size={ComponentSize.ExtraSmall}
          shape={ButtonShape.Square}
          returnValue={member}
          onConfirm={onDelete}
          confirmationButtonText="Delete"
          confirmationLabel="Really delete member?"
          testID="delete-member"
        />
      </CloudExclude>
    )
  }
}
