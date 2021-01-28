import {
  postApiV2privateFlowsOrgsFlow,
  PostApiV2privateFlowsOrgsFlowParams,
  PatchApiV2privateFlowsOrgsFlowParams,
  patchApiV2privateFlowsOrgsFlow,
  deleteApiV2privateFlowsOrgsFlow,
  getApiV2privateFlowsOrgsFlows,
  DeleteApiV2privateFlowsOrgsFlowParams,
} from 'src/client/flowsRoutes'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {v4 as UUID} from 'uuid'

const DEFAULT_API_FLOW: PatchApiV2privateFlowsOrgsFlowParams = {
  id: '',
  orgID: '',
  data: {},
}
let stagedFlow: PatchApiV2privateFlowsOrgsFlowParams = DEFAULT_API_FLOW
let reportDecayTimeout = null
let reportMaxTimeout = null

const REPORT_DECAY = 2000 // number of miliseconds to wait after last event before sending
const REPORT_MAX_WAIT = 5000 // max number of miliseconds to wait between sends

export const pooledUpdateAPI = (flow: PatchApiV2privateFlowsOrgsFlowParams) => {
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

export const updateAPI = async (flow: PatchApiV2privateFlowsOrgsFlowParams) => {
  if (isFlagEnabled('notebooks-api')) {
    const res = await patchApiV2privateFlowsOrgsFlow(flow)
    if (res.status != 200) {
      throw new Error(res.data.message)
    }
  }
}

export const createAPI = async (flow: PostApiV2privateFlowsOrgsFlowParams) => {
  if (isFlagEnabled('notebooks-api')) {
    const res = await postApiV2privateFlowsOrgsFlow(flow)

    if (res.status != 200) {
      throw new Error(res.data.message)
    }
    return res.data.id
  }
  return `local_${UUID()}`
}

export const deleteAPI = async (ids: DeleteApiV2privateFlowsOrgsFlowParams) => {
  if (isFlagEnabled('notebooks-api')) {
    const res = await deleteApiV2privateFlowsOrgsFlow(ids)

    if (res.status != 200) {
      throw new Error(res.data.message)
    }
  }
}

export const getAllAPI = async orgID => {
  if (isFlagEnabled('notebooks-api')) {
    const res = await getApiV2privateFlowsOrgsFlows({orgID})
    if (res.status != 200) {
      throw new Error(res.data.message)
    }
    return res.data
  }
  return {}
}
