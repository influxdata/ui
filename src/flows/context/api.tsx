import {
  PatchNotebookParams,
  patchNotebook,
  PostNotebookParams,
  postNotebook,
  DeleteNotebookParams,
  deleteNotebook,
  getNotebooks,
} from 'src/client/notebooksRoutes'
import {notebookUpdateFail} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'
import {getErrorMessage} from 'src/utils/api'

const DEFAULT_API_FLOW: PatchNotebookParams = {
  id: '',
  data: {},
}
let stagedFlow: PatchNotebookParams = DEFAULT_API_FLOW
let reportDecayTimeout = null
let reportMaxTimeout = null

const REPORT_DECAY = 500 // number of miliseconds to wait after last event before sending
const REPORT_MAX_WAIT = 5000 // max number of miliseconds to wait between sends

export const pooledUpdateAPI = (flow: PatchNotebookParams) => {
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

export const updateAPI = async (flow: PatchNotebookParams) => {
  const res = await patchNotebook(flow)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
}

export const createAPI = async (flow: PostNotebookParams) => {
  const res = await postNotebook(flow)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
  return res.data
}

export const deleteAPI = async (ids: DeleteNotebookParams) => {
  const res = await deleteNotebook(ids)
  if (res.status != 204) {
    throw new Error(res.data.message)
  }
}

export const getAllAPI = async (orgID: string) => {
  const res = await getNotebooks({query: {orgID}})
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
        const apiFlow: PostNotebookParams = serialize(flow, orgID)
        const {id} = await createAPI(apiFlow)
        delete flows[localID]
        flows[id] = flow
      })
    ).catch(err => {
      // do not throw the error because some flows might have saved and we
      // need to save the new IDs to avoid creating duplicates next time.
      dispatch(notify(notebookUpdateFail(getErrorMessage(err))))
    })
  }
  return flows
}
