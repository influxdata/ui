import {FunctionComponent, ComponentClass} from 'react'
import {ViewProperties} from 'src/types'
import View from './view'
import './style.scss'

export interface VisTypeRegistration {
  type: string // a unique string that identifies a visualization
  name: string // the name that shows up in the dropdown
  graphic: JSX.Element // the icon that shows up in the dropdown
  disabled?: boolean // if you should show it or not
  featureFlag?: string // designates a flag that should enable the panel type
  initial: ViewProperties // the default state
  options?: FunctionComponent<any> | ComponentClass<any> // the view component for rendering the interface
}

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
