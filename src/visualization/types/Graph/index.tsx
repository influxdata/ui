import {GraphIcon} from './icon'
import {GraphOptions} from './options'
import {GraphProperties} from './properties'
import {Graph} from './view'

export const view = {
  type: 'xy',
  name: 'Graph',
  graphic: GraphIcon,
  component: Graph,
  initial: GraphProperties,
  options: GraphOptions,
}
