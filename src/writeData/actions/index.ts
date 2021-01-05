export const SET_INTEGRATION_TOKEN = 'SET_INTEGRATION_TOKEN'
export const setIntegrationToken = (integration: string, token: string) => ({
  type: SET_INTEGRATION_TOKEN,
  payload: {integration, token},
})
