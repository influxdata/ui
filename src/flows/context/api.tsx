import {
  postFlowsOrgsFlow,
  PostFlowsOrgsFlowParams,
  PatchFlowsOrgsFlowParams,
  patchFlowsOrgsFlow,
  deleteFlowsOrgsFlow,
  getFlowsOrgsFlows,
  DeleteFlowsOrgsFlowParams,
} from 'src/client/flowsRoutes'
import {notebookUpdateFail} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

const DEFAULT_API_FLOW: PatchFlowsOrgsFlowParams = {
  id: '',
  orgID: '',
  data: {},
}
let stagedFlow: PatchFlowsOrgsFlowParams = DEFAULT_API_FLOW
let reportDecayTimeout = null
let reportMaxTimeout = null

const REPORT_DECAY = 500 // number of miliseconds to wait after last event before sending
const REPORT_MAX_WAIT = 5000 // max number of miliseconds to wait between sends

export const pooledUpdateAPI = (flow: PatchFlowsOrgsFlowParams) => {
  stagedFlow = flow

  if (!!reportDecayTimeout) {
    clearTimeout(reportDecayTimeout)
    reportDecayTimeout = null
  }

  if (!reportMaxTimeout) {
    reportMaxTimeout = setTimeout(() => {
      reportMaxTimeout = null

      // flow already synced
      if (stagedFlow === DEFAULT_API_FLOW) {
        return
      }

      clearTimeout(reportDecayTimeout)
      reportDecayTimeout = null
      updateAPI(stagedFlow)

      stagedFlow = DEFAULT_API_FLOW
    }, REPORT_MAX_WAIT)
  }

  reportDecayTimeout = setTimeout(() => {
    updateAPI(stagedFlow)

    stagedFlow = DEFAULT_API_FLOW
  }, REPORT_DECAY)
}

export const updateAPI = async (flow: PatchFlowsOrgsFlowParams) => {
  const res = await patchFlowsOrgsFlow(flow)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
}

export const createAPI = async (flow: PostFlowsOrgsFlowParams) => {
  const res = await postFlowsOrgsFlow(flow)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data.id
}

export const deleteAPI = async (ids: DeleteFlowsOrgsFlowParams) => {
  const res = await deleteFlowsOrgsFlow(ids)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
}

export const getAllAPI = async (orgID: string) => {
  const res = await getFlowsOrgsFlows({orgID})
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const migrateLocalFlowsToAPI = async (
  orgID: string,
  flows: {},
  serialize: Function,
  dispatch: Function
) => {
  const localFlows = Object.keys(flows).filter(id => id.includes('local'))
  if (localFlows.length) {
    await Promise.all(
      localFlows.map(async localID => {
        const flow = flows[localID]
        const apiFlow: PostFlowsOrgsFlowParams = {
          orgID: orgID,
          data: {
            orgID: orgID,
            name: flow.name,
            spec: serialize(flow),
          },
        }
        const id = await createAPI(apiFlow)
        delete flows[localID]
        flows[id] = flow
      })
    ).catch(() => {
      // do not throw the error because some flows might have saved and we
      // need to save the new IDs to avoid creating duplicates next time.
      dispatch(notify(notebookUpdateFail()))
    })
  }
  return flows
}
