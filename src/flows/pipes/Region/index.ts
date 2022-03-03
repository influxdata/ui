import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'region',
    family: 'context',
    component: View,
    featureFlag: 'flow-panel--remote',
    button: 'Remote Database',
    description: 'Queries a remote region using a token',
    initial: {
      type: 'static',
      region: '',
      token: '',
      org: '',
    },
    readOnlyComponent: ReadOnly,

    scope: (data, prev) => {
      return {
        ...prev,
        region: data.region,
        token: data.token,
        org: data.org,
      }
    },
  })
}
