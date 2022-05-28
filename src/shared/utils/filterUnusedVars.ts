// Utils
import {parseASTIM} from 'src/variables/utils/astim'

// Types
import {QueryViewProperties, View, ViewProperties, Variable} from 'src/types'

function isQueryViewProperties(vp: ViewProperties): vp is QueryViewProperties {
  return (vp as QueryViewProperties).queries !== undefined
}

export const getAllUsedVars = (
  variables: Variable[],
  usedVars: Variable[],
  cache: {[name: string]: boolean}
): Variable[] => {
  const vars = usedVars.slice()
  let varsInUse = []
  usedVars.forEach((vari: Variable) => {
    if (vari.arguments.type === 'query') {
      const queryText = vari?.arguments?.values?.query || ''
      const astim = parseASTIM(queryText)
      const usedV = variables.filter(variable =>
        astim.hasVariable(variable.name)
      )
      varsInUse = varsInUse.concat(usedV)
    }
  })

  varsInUse.forEach((v: Variable) => {
    if (!cache[v.name]) {
      vars.push(v)
      cache[v.name] = true
    }
  })

  if (vars.length !== usedVars.length) {
    return getAllUsedVars(variables, vars, cache)
  }

  return vars
}

/*
  Creates an initial cache of the variables used at the root level in a query
*/
export const createdUsedVarsCache = (variables: Variable[]) => {
  return variables.reduce((cache, curr) => {
    cache[curr.name] = true
    return cache
  }, {})
}

// TODO: use scope-appropriate de-duping of the allVariables
export const filterUnusedVarsBasedOnQuery = (
  variables: Variable[],
  queryTexts: string[]
): Variable[] => {
  const astims = queryTexts.map(query => parseASTIM(query))
  const varsInUse = variables.filter(variable =>
    astims.some(astim => astim.hasVariable(variable.name))
  )
  const cachedVars = createdUsedVarsCache(varsInUse)

  return getAllUsedVars(variables, varsInUse, cachedVars)
}

/*
  Given a collection variables and a collection of views, return only the
  variables that are used in at least one of the view queries.
*/
export const filterUnusedVars = (
  variables: Variable[],
  views: View[]
): Variable[] => {
  const viewProperties = views.map(v => v.properties).filter(vp => !!vp)
  const queryViewProperties = viewProperties.filter(isQueryViewProperties)

  const queryTexts = queryViewProperties.reduce(
    (acc, vp) => [...acc, ...(vp.queries || []).map(query => query.text)],
    [] as Array<string>
  )

  return filterUnusedVarsBasedOnQuery(variables, queryTexts)
}
