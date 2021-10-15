// Libraries
import React, {PureComponent} from 'react'

// Components
import {Member} from 'src/types'

import CloudExclude from 'src/shared/components/cloud/CloudExclude'
import {
  IconFont,
  ComponentColor,
  ConfirmationButton,
  ButtonShape,
  ComponentSize,
} from '@influxdata/clockface'

interface Props {
  member: Member
  onDelete: (member: Member) => void
}

export default class MemberContextMenu extends PureComponent<Props> {
  public render() {
    const {member} = this.props

    return (
      <CloudExclude>
        <ConfirmationButton
          color={ComponentColor.Colorless}
          icon={IconFont.Trash_New}
          shape={ButtonShape.Square}
          size={ComponentSize.ExtraSmall}
          confirmationLabel="Yes, delete this scraper"
          onConfirm={() => {
            this.handleDelete(member)
          }}
          confirmationButtonText="Confirm"
          testID="context-delete-menu"
        />
      </CloudExclude>
    )
  }

  private handleDelete = (member: Member) => {
    const {onDelete} = this.props
    onDelete(member)
  }
}
