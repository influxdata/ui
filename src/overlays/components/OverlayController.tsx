// Libraries
import React, {
  FunctionComponent,
  createContext,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import {useDispatch, useSelector} from 'react-redux'

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
import NewThresholdCheckEO from 'src/checks/components/NewThresholdCheckEO'

// Actions
import {dismissOverlay} from 'src/overlays/actions/overlays'

export interface OverlayContextType {
  onClose: () => void
  visibility: boolean
  overlayID: string
}

export const DEFAULT_OVERLAY_CONTEXT = {
  onClose: () => {},
  visibility: false,
  overlayID: '',
}

export const OverlayContext = createContext<OverlayContextType>(
  DEFAULT_OVERLAY_CONTEXT
)

export const OverlayController: FunctionComponent = () => {
  const activeOverlay = useRef(<></>)
  const {onClose, overlayID} = useContext(OverlayContext)
  useMemo(() => {
    switch (overlayID) {
      case 'add-note':
      case 'edit-note':
        activeOverlay.current = <NoteEditorOverlay onClose={onClose} />
        break
      case 'add-master-token':
        activeOverlay.current = <AllAccessTokenOverlay onClose={onClose} />
        break
      case 'add-token':
        activeOverlay.current = <BucketsTokenOverlay onClose={onClose} />
        break
      case 'telegraf-config':
        activeOverlay.current = <TelegrafConfigOverlay />
        break
      case 'telegraf-output':
        activeOverlay.current = <TelegrafOutputOverlay onClose={onClose} />
        break
      case 'switch-organizations':
        activeOverlay.current = <OrgSwitcherOverlay onClose={onClose} />
        break
      case 'create-bucket':
        activeOverlay.current = <CreateBucketOverlay onClose={onClose} />
        break
      case 'asset-limit':
        activeOverlay.current = <AssetLimitOverlay onClose={onClose} />
        break
      case 'create-annotation-stream':
        activeOverlay.current = <CreateAnnotationStreamOverlay />
        break
      case 'update-annotation-stream':
        activeOverlay.current = <UpdateAnnotationStreamOverlay />
        break
      case 'add-annotation':
        activeOverlay.current = <AddAnnotationOverlay />
        break
      case 'edit-annotation':
        activeOverlay.current = <EditAnnotationOverlay />
        break
      case 'check-threshold':
        activeOverlay.current = <NewThresholdCheckEO />
        break
      default:
        activeOverlay.current = null
        break
    }

    return activeOverlay.current
  }, [onClose, overlayID])
  // console.log(overlayID, 'IN CONTROLLER')
  return (
    <Overlay visible={!!overlayID} onEscape={onClose}>
      {activeOverlay.current}
    </Overlay>
  )
}

const OverlayProvider: FunctionComponent = props => {
  const {overlayID, onClose} = useSelector((state: AppState) => {
    const id = state.overlays.id
    const onClose = state.overlays.onClose

    return {
      overlayID: id,
      onClose,
    }
  })
  const dispatch = useDispatch()
  const {children} = props

  const closer = useCallback(() => {
    dispatch(dismissOverlay())
    if (onClose) {
      onClose()
    }
  }, [onClose, dispatch])

  // TODO: Alex Paxton
  // Probably should refactor these overlays to use the context instead of prop
  // drilling onClose into them

  return (
    <OverlayContext.Provider
      value={{onClose: closer, visibility: !!overlayID, overlayID}}
    >
      {children}
    </OverlayContext.Provider>
  )
}

export const OverlayProviderComp = OverlayProvider
