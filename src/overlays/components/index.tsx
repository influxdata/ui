// Utils
import OverlayHandler, {
  RouteOverlay,
} from 'src/overlays/components/RouteOverlay'

// Constants
import {ORGS, SETTINGS, ANNOTATIONS} from 'src/shared/constants/routes'

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
