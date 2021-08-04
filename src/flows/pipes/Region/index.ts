import View from './view'

export default register => {
  register({
    type: 'region',
    family: 'inputs',
    component: View,
    button: 'Remote Region',
    description: 'Queries a remote region using a token',
    initial: {
      type: 'static',
      region: '',
      token: ''
    },

    context: (data, prev) => {
      return {
        ...prev,
        region: data.region,
        token: data.token,
        org: data.org
      }
    }
}
