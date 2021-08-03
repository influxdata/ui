// Libraries
import React, {FC} from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {capitalize} from 'lodash'
import {connect, ConnectedProps} from 'react-redux'

// Constants
import {
  copyToClipboardSuccess,
  copyToClipboardFailed,
} from 'src/shared/copy/notifications'

// Actions
import {notify as notifyAction} from 'src/shared/actions/notifications'

// Components
import {ResourceCard} from '@influxdata/clockface'

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
    <span data-testid="bucket-retention">
      Retention: {capitalize(bucket.readableRetention)}
    </span>
  )

  // need to create an array here; and add the schemaType if present
  // if instead schemaType was null and had content if present, then if it is null
  // the resourcecard.meta makes a 'null' child out of it and creates an extra space.
  // so putting the type, if present into an array solves that problem.
  const metaBlocks = [persistentBucketMeta]

  // if the schema type isn't present it just doesn't get displayed.
  // so future/current proof (works fine without it, works well with it)
  const schemaType = bucket?.schemaType

  if (schemaType) {
    const schemaLabel = `${capitalize(schemaType)} Schema Type`
    const schemaBlock = (
      <span data-testid="bucket-schemaType"> {schemaLabel} </span>
    )
    metaBlocks.push(schemaBlock)
  }

  if (bucket.type === 'system') {
    return (
      <ResourceCard.Meta testID={`resourceCard-buckets-${bucket.id}`}>
        <span
          className="system-bucket"
          key={`system-bucket-indicator-${bucket.id}`}
        >
          System Bucket
        </span>
        {metaBlocks}
      </ResourceCard.Meta>
    )
  }

  return (
    <ResourceCard.Meta testID={`resourceCard-buckets-${bucket.id}`}>
      {metaBlocks}
      <CopyToClipboard text={bucket.id} onCopy={handleCopyAttempt}>
        <span className="copy-bucket-id" title="Click to Copy to Clipboard">
          ID: {bucket.id}
          <span className="copy-bucket-id--helper">Copy to Clipboard</span>
        </span>
      </CopyToClipboard>
    </ResourceCard.Meta>
  )
}

const mdtp = {
  notify: notifyAction,
}

const connector = connect(null, mdtp)

export default connector(BucketCardMeta)
