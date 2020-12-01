// Libraries
import React, {FunctionComponent, createContext} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Types
import {AppState} from 'src/types'

// Components
import {Overlay} from '@influxdata/clockface'
import NoteEditorOverlay from 'src/dashboards/components/NoteEditorOverlay'
import AllAccessTokenOverlay from 'src/authorizations/components/AllAccessTokenOverlay'
import BucketsTokenOverlay from 'src/authorizations/components/BucketsTokenOverlay'
import TelegrafConfigOverlay from 'src/telegrafs/components/TelegrafConfigOverlay'
import TelegrafOutputOverlay from 'src/telegrafs/components/TelegrafOutputOverlay'
import OrgSwitcherOverlay from 'src/pageLayout/components/OrgSwitcherOverlay'
import CreateBucketOverlay from 'src/buckets/components/CreateBucketOverlay'
import AssetLimitOverlay from 'src/cloud/components/AssetLimitOverlay'
import {CreateAnnotationStreamOverlay} from 'src/annotations/components/overlay/CreateAnnotationStreamOverlay'
import {UpdateAnnotationStreamOverlay} from 'src/annotations/components/overlay/UpdateAnnotationStreamOverlay'
import {AddAnnotationOverlay} from 'src/annotations/components/AddAnnotationOverlay'
import {EditAnnotationOverlay} from 'src/annotations/components/EditAnnotationOverlay'

// Actions
import {dismissOverlay} from 'src/overlays/actions/overlays'

type ReduxProps = ConnectedProps<typeof connector>
type OverlayControllerProps = ReduxProps

export interface OverlayContextType {
  onClose: () => void
}

export const DEFAULT_OVERLAY_CONTEXT = {
  onClose: () => {},
}

export const OverlayContext = createContext<OverlayContextType>(
  DEFAULT_OVERLAY_CONTEXT
)

const OverlayController: FunctionComponent<OverlayControllerProps> = props => {
  let activeOverlay = <></>
  let visibility = true

  const {overlayID, onClose, clearOverlayControllerState} = props

  const closer = () => {
    clearOverlayControllerState()
    if (onClose) {
      onClose()
    }
  }

  // TODO: Alex Paxton
  // Probably should refactor these overlays to use the context instead of prop
  // drilling onClose into them

  switch (overlayID) {
    case 'add-note':
    case 'edit-note':
      activeOverlay = <NoteEditorOverlay onClose={closer} />
      break
    case 'add-master-token':
      activeOverlay = <AllAccessTokenOverlay onClose={closer} />
      break
    case 'add-token':
      activeOverlay = <BucketsTokenOverlay onClose={closer} />
      break
    case 'telegraf-config':
      activeOverlay = <TelegrafConfigOverlay />
      break
    case 'telegraf-output':
      activeOverlay = <TelegrafOutputOverlay onClose={closer} />
      break
    case 'switch-organizations':
      activeOverlay = <OrgSwitcherOverlay onClose={closer} />
      break
    case 'create-bucket':
      activeOverlay = <CreateBucketOverlay onClose={closer} />
      break
    case 'asset-limit':
      activeOverlay = <AssetLimitOverlay onClose={closer} />
      break
    case 'create-annotation-stream':
      activeOverlay = <CreateAnnotationStreamOverlay />
      break
    case 'update-annotation-stream':
      activeOverlay = <UpdateAnnotationStreamOverlay />
      break
    case 'add-annotation':
      activeOverlay = <AddAnnotationOverlay />
      break
    case 'edit-annotation':
      activeOverlay = <EditAnnotationOverlay />
      break
    default:
      visibility = false
  }

  return (
    <OverlayContext.Provider value={{onClose: closer}}>
      <Overlay visible={visibility}>{activeOverlay}</Overlay>
    </OverlayContext.Provider>
  )
}

const mstp = (state: AppState) => {
  const id = state.overlays.id
  const onClose = state.overlays.onClose

  return {
    overlayID: id,
    onClose,
  }
}

const mdtp = {
  clearOverlayControllerState: dismissOverlay,
}

const connector = connect(mstp, mdtp)
export default connector(OverlayController)
