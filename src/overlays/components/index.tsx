// Utils
import OverlayHandler, {
  RouteOverlay,
} from 'src/overlays/components/RouteOverlay'

// Constants
import {
  ORGS,
  SETTINGS,
  ANNOTATIONS,
  DATA_EXPLORER,
  DASHBOARDS,
} from 'src/shared/constants/routes'

export const AddNoteOverlay = RouteOverlay(
  OverlayHandler,
  'add-note',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/dashboards/${params.dashboardID}`)
  }
)
export const EditNoteOverlay = RouteOverlay(
  OverlayHandler,
  'edit-note',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/dashboards/${params.dashboardID}`)
  }
)
export const AllAccessTokenOverlay = RouteOverlay(
  OverlayHandler,
  'add-master-token',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/load-data/tokens`)
  }
)
export const BucketsTokenOverlay = RouteOverlay(
  OverlayHandler,
  'add-token',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/load-data/tokens`)
  }
)
export const TelegrafConfigOverlay = RouteOverlay(
  OverlayHandler,
  'telegraf-config',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/load-data/telegrafs`)
  }
)

export const TelegrafOutputOverlay = RouteOverlay(
  OverlayHandler,
  'telegraf-output',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/load-data/telegrafs`)
  }
)

export const CreateAnnotationStreamOverlay = RouteOverlay(
  OverlayHandler,
  'create-annotation-stream',
  (history, params) => {
    history.push(`/${ORGS}/${params.orgID}/${SETTINGS}/${ANNOTATIONS}`)
  }
)

export const UpdateAnnotationStreamOverlay = RouteOverlay(
  OverlayHandler,
  'update-annotation-stream',
  (history, params) => {
    history.push(`/${ORGS}/${params.orgID}/${SETTINGS}/${ANNOTATIONS}`)
  }
)

export const AddAnnotationDEOverlay = RouteOverlay(
  OverlayHandler,
  'add-annotation',
  (history, params) => {
    history.push(`/${ORGS}/${params.orgID}/${DATA_EXPLORER}`)
  }
)

export const AddAnnotationDashboardOverlay = RouteOverlay(
  OverlayHandler,
  'add-annotation',
  (history, params) => {
    history.push(`/${ORGS}/${params.orgID}/${DASHBOARDS}/${params.dashboardID}`)
  }
)

export const EditAnnotationDEOverlay = RouteOverlay(
  OverlayHandler,
  'edit-annotation',
  (history, params) => {
    history.push(`/${ORGS}/${params.orgID}/${DATA_EXPLORER}`)
  }
)

export const EditAnnotationDashboardOverlay = RouteOverlay(
  OverlayHandler,
  'edit-annotation',
  (history, params) => {
    history.push(`/${ORGS}/${params.orgID}/${DASHBOARDS}/${params.dashboardID}`)
  }
)

export const ThresholdCheckOverlay = RouteOverlay(
  OverlayHandler,
  'check-threshold',
  (history, params) => {
    history.push(`/${ORGS}/${params.orgID}/alerting`)
  }
)

export const DeadmanCheckOverlay = RouteOverlay(
  OverlayHandler,
  'deadman-check',
  (history, params) => {
    history.push(`/${ORGS}/${params.orgID}/alerting`)
  }
)

export const CreateVariableOverlay = RouteOverlay(
  OverlayHandler,
  'create-variable',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/settings/variables`)
  }
)

export const VariableImportOverlay = RouteOverlay(
  OverlayHandler,
  'import-variable',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/settings/variables`)
  }
)

export const RenameVariableOverlay = RouteOverlay(
  OverlayHandler,
  'rename-variable',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/settings/variables`)
  }
)

export const UpdateVariableOverlay = RouteOverlay(
  OverlayHandler,
  'update-variable',
  (history, params) => {
    history.push(`/orgs/${params.orgID}/settings/variables`)
  }
)
