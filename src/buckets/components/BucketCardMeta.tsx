// Libraries
import React, {FC} from 'react'
import {capitalize} from 'lodash'
import {connect, ConnectedProps} from 'react-redux'

// Constants
import {CLOUD} from 'src/shared/constants'
import {
  copyToClipboardSuccess,
  copyToClipboardFailed,
} from 'src/shared/copy/notifications'

// Actions
import {notify as notifyAction} from 'src/shared/actions/notifications'

// Components
import {ResourceCard} from '@influxdata/clockface'
import CopyToClipboard from 'src/shared/components/CopyToClipboard'

// Types
import {OwnBucket} from 'src/types'

interface OwnProps {
  bucket: OwnBucket
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const BucketCardMeta: FC<Props> = ({bucket, notify}) => {
  const handleCopyAttempt = (
    copiedText: string,
    isSuccessful: boolean
  ): void => {
    const text = copiedText.slice(0, 30).trimRight()
    const truncatedText = `${text}...`

    if (isSuccessful) {
      notify(copyToClipboardSuccess(truncatedText, 'Bucket ID'))
    } else {
      notify(copyToClipboardFailed(truncatedText, 'Bucket ID'))
    }
  }

  const persistentBucketMeta = (
    <span data-testid="bucket-retention" key="bucket-retention">
      Retention: {capitalize(bucket.readableRetention)}
    </span>
  )

  // if the schema type isn't present just default to implicit
  const schemaType = bucket?.schemaType || 'implicit'

  const schemaLabel = `Schema Type: ${capitalize(schemaType)}`
  const schemaBlock = (
    <span data-testid="bucket-schemaType" key="bucket-schemaType">
      {schemaLabel}
    </span>
  )
  const bucketID = (
    <CopyToClipboard
      text={bucket.id}
      onCopy={handleCopyAttempt}
      key={bucket.id}
    >
      <span className="copy-bucket-id" title="Click to Copy to Clipboard">
        ID: {bucket.id}
        <span className="copy-bucket-id--helper">Copy to Clipboard</span>
      </span>
    </CopyToClipboard>
  )

  const bucketInfo = CLOUD
    ? [persistentBucketMeta, schemaBlock, bucketID]
    : [persistentBucketMeta, bucketID]

  if (bucket.type === 'system') {
    return (
      <ResourceCard.Meta testID={`resourceCard-buckets-${bucket.id}`}>
        <span
          className="system-bucket"
          key={`system-bucket-indicator-${bucket.id}`}
        >
          System Bucket
        </span>
        {bucketInfo}
      </ResourceCard.Meta>
    )
  }

  return (
    <ResourceCard.Meta testID={`resourceCard-buckets-${bucket.id}`}>
      {bucketInfo}
    </ResourceCard.Meta>
  )
}

const mdtp = {
  notify: notifyAction,
}

const connector = connect(null, mdtp)

export default connector(BucketCardMeta)
