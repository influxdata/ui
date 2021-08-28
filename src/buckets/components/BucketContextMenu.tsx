// Libraries
import React, {PureComponent} from 'react'

// Components
import {ComponentSize} from 'src/clockface'

import {
  FlexBox,
  ConfirmationButton,
  ComponentColor,
  IconFont,
} from '@influxdata/clockface'

// Types
import {OwnBucket} from 'src/types'

interface Props {
  bucket: OwnBucket
  onDeleteBucket: (bucket: OwnBucket) => void
}

export default class BucketContextMenu extends PureComponent<Props> {
  public render() {
    return (
      <>
        <FlexBox margin={ComponentSize.ExtraSmall}>{this.deleteButton}</FlexBox>
      </>
    )
  }

  private get deleteButton() {
    const {bucket, onDeleteBucket} = this.props
    if (bucket.type === 'user') {
      return (
        <ConfirmationButton
          color={ComponentColor.Tertiary}
          icon={IconFont.Trash_New}
          confirmationLabel="Yes, Delete this bucket"
          onConfirm={() => {
            onDeleteBucket(bucket)
          }}
          confirmationButtonText="Confirm"
          testID={`context-delete-menu ${bucket.name}`}
        />
      )
    } else {
      return null
    }
  }
}
