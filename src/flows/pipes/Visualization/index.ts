import {VisTypeRegistration} from 'src/types'
import View from './view'
import './style.scss'

interface VisTypeRegistrationMap {
  [key: string]: VisTypeRegistration
}

export const TYPE_DEFINITIONS: VisTypeRegistrationMap = {}

const context = require.context('./types', true, /index\.(ts|tsx)$/)
context.keys().forEach(key => {
  const module = context(key)
  module.default((def: VisTypeRegistration) => {
    TYPE_DEFINITIONS[def.type] = def
  })
})

export default register => {
  register({
    type: 'visualization',
    family: 'passThrough',
    component: View,
    button: 'Visualization',
    initial: {
      panelVisibility: 'visible',
      panelHeight: 200,
      properties: TYPE_DEFINITIONS['xy'].initial,
    },
  })
}
