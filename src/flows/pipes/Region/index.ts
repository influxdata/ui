import {IconFont} from '@influxdata/clockface'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'region',
    family: 'context',
    component: View,
    featureFlag: 'flow-panel--remote',
    button: 'Remote Database',
    description: 'Query against another server using a token',
    icon: IconFont.Plus_New,
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
