// Libraries
import React, {FC, useContext, useState} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {
  AlignItems,
  Button,
  ComponentColor,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  Overlay,
  Icon,
  IconFont,
  Input,
  SquareButton,
} from '@influxdata/clockface'
import CopyToClipboard from 'src/shared/components/CopyToClipboard'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {OverlayContext} from 'src/overlays/components/OverlayController'
import {PROJECT_NAME} from 'src/flows'

// Actions
import {notify} from 'src/shared/actions/notifications'

// Notifications
import {
  copyToClipboardFailed,
  copyToClipboardSuccess,
} from 'src/shared/copy/notifications'

// Types
import {RemoteDataState} from 'src/types'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {deleteNotebooksShare} from 'src/client/notebooksRoutes'

// Styles
import './ShareOverlay.scss'

const ShareOverlay: FC = () => {
  const {onClose, params} = useContext(OverlayContext)
  const {share, onSetShare} = params
  const [linkDeleting, setLinkDeleting] = useState(RemoteDataState.NotStarted)
  const dispatch = useDispatch()
  const link = `${window.location.origin}/share/${share.accessID}`

  const handleCopy = (copiedText: string, isSuccessful: boolean): void => {
    event('Copy Notebook shared link to Clipboard Clicked')
    if (isSuccessful) {
      dispatch(notify(copyToClipboardSuccess(copiedText, 'Link')))
    } else {
      dispatch(notify(copyToClipboardFailed(copiedText, 'Link')))
    }
  }

  const deleteShare = () => {
    setLinkDeleting(RemoteDataState.Loading)
    deleteNotebooksShare({id: share.id})
      .then(() => {
        setLinkDeleting(RemoteDataState.Done)
        onSetShare(null)
        event('Delete Share Link')
        onClose()
      })
      .catch(err => {
        setLinkDeleting(RemoteDataState.Error)
        console.error('failed to delete share', err)
      })
  }

  return (
    <Overlay.Container maxWidth={800}>
      <Overlay.Header title={`Share ${PROJECT_NAME}`} onDismiss={onClose} />
      <Overlay.Body>
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.Stretch}
        >
          <FlexBox.Child className="share-section--alert">
            <Icon glyph={IconFont.AlertTriangle} />
            <span className="share-text">
              By sharing this link, your org may incur charges when a user
              visits the page and the query is run.
            </span>
          </FlexBox.Child>
          <FlexBox.Child className="share-section--link">
            <span className="share-section--link-label">Share Link</span>
            <FlexBox className="share-section--link-bar">
              <FlexBox.Child grow={2} shrink={0}>
                <Input
                  value={link}
                  onChange={() => {
                    // Do nothing. Read only
                  }}
                />
              </FlexBox.Child>
              <FlexBox.Child
                grow={0}
                shrink={0}
                basis={90}
                className="share-button--copy"
              >
                <CopyToClipboard text={link} onCopy={handleCopy}>
                  <Button
                    icon={IconFont.Clipboard_New}
                    text="Copy"
                    titleText="Copy"
                    color={ComponentColor.Primary}
                  />
                </CopyToClipboard>
              </FlexBox.Child>
              <FlexBox.Child grow={0} shrink={0} basis={40}>
                <SafeBlankLink href={link}>
                  <SquareButton
                    icon={IconFont.Export_New}
                    titleText="Open link in new tab"
                  />
                </SafeBlankLink>
              </FlexBox.Child>
            </FlexBox>
            <Icon glyph={IconFont.EyeOpen} />
            <span className="share-text">
              Anyone with this link can view this {PROJECT_NAME}, but will not
              have access to autorefresh updates.
            </span>
          </FlexBox.Child>
          <FlexBox.Child className="share-section--delete">
            <Button
              text="Delete Link"
              titleText="Delete Link"
              className="share-delete--color-red"
              icon={IconFont.Trash_New}
              color={ComponentColor.Tertiary}
              onClick={deleteShare}
              status={
                linkDeleting === RemoteDataState.Loading
                  ? ComponentStatus.Loading
                  : ComponentStatus.Default
              }
            />
            <span className="share-text">
              If deleted, viewers with this link will no longer have access.
            </span>
          </FlexBox.Child>
        </FlexBox>
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Done"
          titleText="Done"
          color={ComponentColor.Tertiary}
          onClick={onClose}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}

export default ShareOverlay
