// Libraries
import React, {FC, useContext} from 'react'

// Components
import {
  AlignItems,
  FlexBox,
  FlexDirection,
  Overlay,
  Icon,
  IconFont,
  Button,
} from '@influxdata/clockface'

import {OverlayContext} from 'src/overlays/components/OverlayController'

import './ShareOverlay.scss'

const ShareOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  return (
    <Overlay.Container maxWidth={800}>
      <Overlay.Header title="Share Notebook" onDismiss={onClose} />
      <Overlay.Body>
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.Stretch}
        >
          <FlexBox.Child className="share-section--alert">
            <Icon glyph={IconFont.AlertTriangle_New} />
            <span className="share-text">
              By sharing this link, your org may incur charges when a user
              visits the page and the query is run.
            </span>
          </FlexBox.Child>
          <FlexBox.Child className="share-section--link">
            Share Link
            <Icon glyph={IconFont.Eye_New} />
            <span className="share-text">
              Anyone with this link can view this Notebook, but will not have
              access to autorefresh updates.
            </span>
          </FlexBox.Child>
          <FlexBox.Child className="share-section--delete">
            <Button text="Delete Link" icon={IconFont.Trash_New} />
            <span className="share-text">
              If deleted, viewers with this link will no longer have access.
            </span>
          </FlexBox.Child>
        </FlexBox>
      </Overlay.Body>
      <Overlay.Footer>Done</Overlay.Footer>
    </Overlay.Container>
  )
}

export default ShareOverlay
