import view from './view'

export interface SimpleTableViewProperties {
    type: 'simple-table',
    offset?: number,
    height?: number
}

export default register => {
  register({
    type: 'simple-table',
    name: 'Simple Table',
    initial: { type: 'simple-table' },
    component: view,
  })
}
