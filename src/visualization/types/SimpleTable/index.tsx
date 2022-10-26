import {SimpleTableIcon} from './icon'
import {SimpleTableOptions} from './options'
import {SimpleTableProperties} from './properties'
import {SimpleTable} from './view'

export const view = {
  type: 'simple-table',
  name: 'Simple Table',
  graphic: SimpleTableIcon,
  initial: SimpleTableProperties,
  component: SimpleTable,
  options: SimpleTableOptions,
}
