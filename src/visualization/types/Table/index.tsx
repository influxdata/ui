import {TableIcon} from './icon'
import {TableOptions} from './options'
import {TableProperties} from './properties'
import {Table} from './view'

export const view = {
  type: 'table',
  name: 'Table',
  graphic: TableIcon,
  initial: TableProperties,
  component: Table,
  options: TableOptions,
}
