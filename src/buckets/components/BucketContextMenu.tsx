// Libraries
import React, {PureComponent} from 'react'

// Components
import {
  ComponentColor,
  IconFont,
  ConfirmationButton,
  ComponentSize,
} from '@influxdata/clockface'

// Types
import {OwnBucket} from 'src/types'

interface Props {
  bucket: OwnBucket
  onDeleteBucket: (bucket: OwnBucket) => void
}

export default class BucketContextMenu extends PureComponent<Props> {
  public render() {
    const {bucket, onDeleteBucket} = this.props

    if (bucket.type !== 'user') {
      return null
    }

    return (
      <ConfirmationButton
        size={ComponentSize.ExtraSmall}
        text="Delete Bucket"
        color={ComponentColor.Danger}
        icon={IconFont.Trash}
        confirmationLabel="Are you sure? This cannot be undone"
        confirmationButtonText="Confirm"
        returnValue={bucket}
        onConfirm={onDeleteBucket}
        testID="context-delete"
      />
    )
  }
}
