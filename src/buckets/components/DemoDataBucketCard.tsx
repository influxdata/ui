// Libraries
import React, {FC} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'
import {connect, ConnectedProps} from 'react-redux'

// Constants
import {
  copyToClipboardSuccess,
  copyToClipboardFailed,
} from 'src/shared/copy/notifications'

// Components
import {
  ResourceCard,
  Label,
  ComponentSize,
  ComponentColor,
  FlexDirection,
  FlexBox,
  IconFont,
  ConfirmationButton,
} from '@influxdata/clockface'

// Actions
import {deleteDemoDataBucketMembership} from 'src/cloud/actions/thunks'
import {notify as notifyAction} from 'src/shared/actions/notifications'

// Types
import {DemoBucket} from 'src/types'

interface OwnProps {
  bucket: DemoBucket
}
type ReduxProps = ConnectedProps<typeof connector>
type RouterProps = RouteComponentProps<{orgID: string}>
type Props = OwnProps & ReduxProps & RouterProps

const DemoDataBucketCard: FC<Props> = ({
  bucket,
  history,
  match: {
    params: {orgID},
  },
  removeBucket,
  notify,
}) => {
  const handleNameClick = () => {
    history.push(`/orgs/${orgID}/data-explorer?bucket=${bucket.name}`)
  }

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

  return (
    <ResourceCard
      testID={`bucket-card ${bucket.name}`}
      contextMenuInteraction="alwaysVisible"
      contextMenu={
        <ConfirmationButton
          size={ComponentSize.ExtraSmall}
          text="Delete Bucket"
          color={ComponentColor.Danger}
          icon={IconFont.Trash}
          confirmationLabel="Are you sure?"
          confirmationButtonText="Confirm"
          returnValue={bucket}
          onConfirm={removeBucket}
          testID="context-delete"
        />
      }
    >
      <ResourceCard.Name
        testID={`bucket--card--name ${bucket.name}`}
        onClick={handleNameClick}
        name={bucket.name}
      />
      <ResourceCard.Meta>
        <span
          className="system-bucket"
          key={`system-bucket-indicator-${bucket.name}`}
        >
          Demo Data Bucket
        </span>
        <>Retention: {bucket.readableRetention}</>
        <CopyToClipboard text={bucket.id} onCopy={handleCopyAttempt}>
          <span className="copy-bucket-id" title="Click to Copy to Clipboard">
            ID: {bucket.id}
            <span className="copy-bucket-id--helper">Copy to Clipboard</span>
          </span>
        </CopyToClipboard>
      </ResourceCard.Meta>
      <FlexBox
        direction={FlexDirection.Row}
        margin={ComponentSize.Small}
        style={{marginTop: '4px'}}
      >
        <Label
          id="1"
          key="1"
          name="No Cost"
          color="#757888"
          description=""
          onDelete={null}
          onClick={null}
        />
      </FlexBox>
    </ResourceCard>
  )
}

const mdtp = {
  removeBucket: deleteDemoDataBucketMembership,
  notify: notifyAction,
}

const connector = connect(null, mdtp)

export default connector(withRouter(DemoDataBucketCard))
