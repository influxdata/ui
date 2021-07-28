export interface Template {
  type: string // a unique string that identifies a visualization
  init: (...args: string[]) => any // returns a flow state that will pass the hydrate function in src/flows/context/flow.list.tsx
}

interface Templates {
  [type: string]: Template
}

export const TEMPLATES: Templates = {}

const templateDefintionContext = require.context('./types', true, /\.(ts|tsx)$/)
templateDefintionContext.keys().forEach(templateDefinitionIndexFile => {
  const templateDefinitionModule = templateDefintionContext(
    templateDefinitionIndexFile
  )
  templateDefinitionModule.default((def: Template) => {
    TEMPLATES[def.type] = def
  })
})
