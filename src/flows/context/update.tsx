import {
  patchApiV2privateFlowsOrgsFlow,
  PatchApiV2privateFlowsOrgsFlowParams,
} from 'src/client/flowsRoutes'

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

export const pooledUpdate = (flow: PatchApiV2privateFlowsOrgsFlowParams) => {
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

const updateAPI = async (flow: PatchApiV2privateFlowsOrgsFlowParams) => {
  const res = await patchApiV2privateFlowsOrgsFlow(flow)
  if (res.status != 200) {
    throw new Error(res.data.message)
  }
}
