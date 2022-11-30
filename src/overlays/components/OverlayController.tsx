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
import TelegrafConfigOverlay from 'src/telegrafs/components/TelegrafConfigOverlay'
import TelegrafOutputOverlay from 'src/telegrafs/components/TelegrafOutputOverlay'
import TelegrafInstructionsOverlay from 'src/telegrafs/components/TelegrafInstructionsOverlay'
import TelegrafUIRefreshWizard from 'src/dataLoaders/components/collectorsWizard/TelegrafUIRefreshWizard'
import OrgSwitcherOverlay from 'src/pageLayout/components/OrgSwitcherOverlay'
import CreateBucketOverlay from 'src/buckets/components/createBucketForm/CreateBucketOverlay'
import {AssetLimitOverlay} from 'src/cloud/components/AssetLimitOverlay'
import RateLimitOverlay from 'src/cloud/components/RateLimitOverlay'
import WriteLimitOverlay from 'src/cloud/components/WriteLimitOverlay'
import {AddAnnotationOverlay} from 'src/annotations/components/AddAnnotationOverlay'
import {ShowBucketSchemaOverlay} from 'src/buckets/components/schemaOverlay/ShowBucketSchemaOverlay'
import {EditAnnotationOverlay} from 'src/annotations/components/EditAnnotationOverlay'
import CreateVariableOverlay from 'src/variables/components/CreateVariableOverlay'
import RenameVariableOverlay from 'src/variables/components/RenameVariableOverlay'
import UpdateVariableOverlay from 'src/variables/components/UpdateVariableOverlay'
import NewThresholdCheckEO from 'src/checks/components/NewThresholdCheckEO'
import NewDeadmanCheckEO from 'src/checks/components/NewDeadmanCheckEO'
import AutoRefreshOverlay from 'src/dashboards/components/AutoRefreshOverlay'
import CellCloneOverlay from 'src/shared/components/cells/CellCloneOverlay'
import CustomApiTokenOverlay from 'src/authorizations/components/CustomApiTokenOverlay'
import DisplayTokenOverlay from 'src/authorizations/components/DisplayTokenOverlay'
import NewRuleOverlay from 'src/notifications/rules/components/NewRuleOverlay'
import CreateSecretOverlay from 'src/secrets/components/CreateSecret/CreateSecretOverlay'
import VariableImportOverlay from 'src/variables/components/VariableImportOverlay'
import ShareOverlay from 'src/flows/components/ShareOverlay'
import PayGSupportOverlay from 'src/support/components/PayGSupportOverlay'
import FreeAccountSupportOverlay from 'src/support/components/FreeAccountSupportOverlay'
import FeedbackQuestionsOverlay from 'src/support/components/FeedbackQuestionsOverlay'
import ConfirmationOverlay from 'src/support/components/ConfirmationOverlay'
import {CreateOrganizationOverlay} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationOverlay'
import {MarketoAccountUpgradeOverlay} from 'src/identity/components/MarketoAccountUpgradeOverlay'

// Actions
import {dismissOverlay} from 'src/overlays/actions/overlays'
import {ReplaceCertificateOverlay} from 'src/writeData/subscriptions/components/CertificateInput'

export interface OverlayContextType {
  onClose: () => void
  visibility: boolean
  overlayID: string
  params?: Record<string, any>
}

export const DEFAULT_OVERLAY_CONTEXT = {
  onClose: () => {},
  visibility: false,
  overlayID: '',
  params: {},
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
        activeOverlay.current = <NoteEditorOverlay onClose={onClose} />
        break
      case 'edit-note':
        activeOverlay.current = <NoteEditorOverlay onClose={onClose} />
        break
      case 'add-master-token':
        activeOverlay.current = <AllAccessTokenOverlay onClose={onClose} />
        break
      case 'add-custom-token':
        activeOverlay.current = <CustomApiTokenOverlay onClose={onClose} />
        break
      case 'access-cloned-token':
        activeOverlay.current = <DisplayTokenOverlay />
        break
      case 'access-token':
        activeOverlay.current = <DisplayTokenOverlay />
        break
      case 'telegraf-config':
        activeOverlay.current = <TelegrafConfigOverlay />
        break
      case 'telegraf-output':
        activeOverlay.current = <TelegrafOutputOverlay onClose={onClose} />
        break
      case 'telegraf-instructions':
        activeOverlay.current = (
          <TelegrafInstructionsOverlay onClose={onClose} />
        )
        break
      case 'telegraf-wizard':
        activeOverlay.current = <TelegrafUIRefreshWizard onClose={onClose} />
        break
      case 'switch-organizations':
        activeOverlay.current = <OrgSwitcherOverlay onClose={onClose} />
        break
      case 'create-bucket':
        activeOverlay.current = <CreateBucketOverlay />
        break
      case 'asset-limit':
        activeOverlay.current = <AssetLimitOverlay onClose={onClose} />
        break
      case 'rate-limit':
        activeOverlay.current = <RateLimitOverlay onClose={onClose} />
        break
      case 'write-limit':
        activeOverlay.current = <WriteLimitOverlay />
        break
      case 'add-annotation':
        activeOverlay.current = <AddAnnotationOverlay />
        break
      case 'edit-annotation':
        activeOverlay.current = <EditAnnotationOverlay />
        break
      case 'bucket-schema-show':
        activeOverlay.current = <ShowBucketSchemaOverlay />
        break
      case 'check-threshold':
        activeOverlay.current = <NewThresholdCheckEO />
        break
      case 'deadman-check':
        activeOverlay.current = <NewDeadmanCheckEO />
        break
      case 'create-variable':
        activeOverlay.current = <CreateVariableOverlay />
        break
      case 'import-variable':
        activeOverlay.current = <VariableImportOverlay />
        break
      case 'rename-variable':
        activeOverlay.current = <RenameVariableOverlay />
        break
      case 'update-variable':
        activeOverlay.current = <UpdateVariableOverlay />
        break
      case 'toggle-auto-refresh':
        activeOverlay.current = <AutoRefreshOverlay />
        break
      case 'cell-copy-overlay':
        activeOverlay.current = <CellCloneOverlay />
        break
      case 'create-rule':
        activeOverlay.current = <NewRuleOverlay />
        break
      case 'create-secret':
        activeOverlay.current = <CreateSecretOverlay />
        break
      case 'share-overlay':
        activeOverlay.current = <ShareOverlay />
        break
      case 'payg-support':
        activeOverlay.current = <PayGSupportOverlay onClose={onClose} />
        break
      case 'free-account-support':
        activeOverlay.current = <FreeAccountSupportOverlay onClose={onClose} />
        break
      case 'feedback-questions':
        activeOverlay.current = <FeedbackQuestionsOverlay onClose={onClose} />
        break
      case 'help-bar-confirmation':
        activeOverlay.current = <ConfirmationOverlay onClose={onClose} />
        break
      case 'subscription-replace-certificate':
        activeOverlay.current = <ReplaceCertificateOverlay onClose={onClose} />
        break
      case 'create-organization':
        activeOverlay.current = <CreateOrganizationOverlay />
        break
      case 'upgrade-to-contract-overlay':
        activeOverlay.current = <MarketoAccountUpgradeOverlay />
        break
      default:
        activeOverlay.current = null
        break
    }

    return activeOverlay.current
  }, [onClose, overlayID])

  return (
    <Overlay visible={!!overlayID} onEscape={onClose}>
      {activeOverlay.current}
    </Overlay>
  )
}

const OverlayProvider: FunctionComponent = props => {
  const {overlayID, onClose, params} = useSelector((state: AppState) => {
    const {id, onClose, params} = state.overlays

    return {
      overlayID: id,
      onClose,
      params,
    }
  })
  const dispatch = useDispatch()
  const {children} = props

  const closer = useCallback(() => {
    dispatch(dismissOverlay())
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }, [onClose, dispatch])

  return (
    <OverlayContext.Provider
      value={{onClose: closer, visibility: !!overlayID, overlayID, params}}
    >
      {children}
    </OverlayContext.Provider>
  )
}

export const OverlayProviderComp = OverlayProvider
