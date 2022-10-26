import {CheckIcon} from './icon'
import {CheckProperties} from './properties'
import {Check} from './view'

export const view = {
  type: 'check',
  name: 'Check',
  disabled: true,
  graphic: CheckIcon,
  component: Check,
  initial: CheckProperties,
}
