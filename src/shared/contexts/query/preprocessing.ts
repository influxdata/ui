import {
  parse,
  format_from_js_file,
} from 'src/languageSupport/languages/flux/parser'

import {propertyTime} from 'src/shared/utils/getMinDurationFromAST'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types and Constants
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {File, OwnBucket} from 'src/types'
import {QueryScope} from 'src/shared/contexts/query'

const DESIRED_POINTS_PER_GRAPH = 360
const FALLBACK_WINDOW_PERIOD = 15000

// Finds all instances of nodes that match with the test function
// and returns them as an array
export const find = (node: File, test, acc = []) => {
  if (!node) {
    return acc
  }

  if (test(node)) {
    acc.push(node)
  }

  Object.values(node).forEach(val => {
    if (Array.isArray(val)) {
      val.forEach(_val => {
        find(_val, test, acc)
      })
    } else if (typeof val === 'object') {
      find(val, test, acc)
    }
  })

  return acc
}

// Removes all instances of nodes that match with the test function
// and returns the nodes that were returned as an array
export const remove = (node: File, test, acc = []) => {
  if (!node) {
    return acc
  }

  Object.entries(node).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      let ni = 0
      while (ni < val.length) {
        if (test(val[ni])) {
          acc.push(val[ni])
          val.splice(ni, 1)
          continue
        }
        remove(val[ni], test, acc)
        ni++
      }
    } else if (typeof val === 'object') {
      if (val && test(val)) {
        delete node[key]
      } else {
        remove(val, test, acc)
      }
    }
  })

  return acc
}

const _addWindowPeriod = (ast, optionAST): void => {
  const NOW = Date.now()

  const queryRanges = find(
    ast,
    node =>
      node?.callee?.type === 'Identifier' && node?.callee?.name === 'range'
  ).map(node => {
    return (node.arguments[0]?.properties || []).reduce(
      (acc, curr) => {
        if (curr.key.name === 'start') {
          acc.start = propertyTime(ast, curr.value, NOW)
        }

        if (curr.key.name === 'stop') {
          acc.stop = propertyTime(ast, curr.value, NOW)
        }

        return acc
      },
      {
        start: '',
        stop: NOW,
      }
    )
  })

  const windowPeriod = find(
    optionAST,
    node => node?.type === 'Property' && node?.key?.name === 'windowPeriod'
  )

  if (!queryRanges.length) {
    windowPeriod.forEach(node => {
      node.value = {
        type: 'DurationLiteral',
        values: [{magnitude: FALLBACK_WINDOW_PERIOD, unit: 'ms'}],
      }
    })

    return
  }

  const starts = queryRanges.map(t => t.start)
  const stops = queryRanges.map(t => t.stop)
  const cartesianProduct = starts.map(start => stops.map(stop => [start, stop]))

  const durations = []
    .concat(...cartesianProduct)
    .map(([start, stop]) => stop - start)
    .filter(d => d > 0)

  const queryDuration = Math.min(...durations)
  const foundDuration = SELECTABLE_TIME_RANGES.find(
    tr => tr.seconds * 1000 === queryDuration
  )

  if (foundDuration) {
    windowPeriod.forEach(node => {
      node.value = {
        type: 'DurationLiteral',
        values: [{magnitude: foundDuration.windowPeriod, unit: 'ms'}],
      }
    })

    return
  }

  windowPeriod.forEach(node => {
    node.value = {
      type: 'DurationLiteral',
      values: [
        {
          magnitude: Math.round(queryDuration / DESIRED_POINTS_PER_GRAPH),
          unit: 'ms',
        },
      ],
    }
  })
}

const joinOption = (
  ast: any,
  optionName: string,
  defaults: Record<string, string> = {}
) => {
  // remove and join duplicate options declared in the query
  const joinedOption = remove(
    ast,
    node =>
      node.type === 'OptionStatement' && node.assignment.id.name === optionName
  ).reduce((acc, curr) => {
    // eslint-disable-next-line no-extra-semi
    ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
      if (_curr.key?.name && _curr.value?.location?.source) {
        _acc[_curr.key.name] = _curr.value.location.source
      }

      return _acc
    }, acc)

    return acc
  }, defaults)

  const optionVals = Object.entries(joinedOption)
    .map(([k, v]) => `${k}: ${v}`)
    .join(',\n')
  if (!optionVals.length) {
    return null
  }

  return isFlagEnabled('fastFlows')
    ? parseQuery(`option ${optionName} = {\n${optionVals}\n}\n`)
    : parse(`option ${optionName} = {\n${optionVals}\n}\n`)
}

export const simplify = (text, vars = {}, params = {}) => {
  try {
    const ast = isFlagEnabled('fastFlows') ? parseQuery(text) : parse(text)

    // find all `v.varname` references and apply
    // their default value from `vars`
    // filtering this way prevents flooding the query with all
    // variable definitions on accident and simplifies the filtering
    // logic required to support that by centralizing it here
    const referencedVars = find(
      ast,
      node => node?.type === 'MemberExpression' && node?.object?.name === 'v'
    )
      .map(node => node.property.name)
      .reduce((acc, curr) => {
        acc[curr] = vars[curr]
        return acc
      }, {})

    const variableOption = joinOption(ast, 'v', referencedVars)

    if (variableOption) {
      ast.body.unshift(variableOption.body[0])
    }

    // load in windowPeriod at the last second, because it needs to self reference all the things
    if (referencedVars.hasOwnProperty('windowPeriod')) {
      _addWindowPeriod(ast, variableOption)
    }

    // give the same treatment to parameters
    const referencedParams = find(
      ast,
      node =>
        node?.type === 'MemberExpression' && node?.object?.name === 'param'
    )
      .map(node => node.property.name)
      .reduce((acc, curr) => {
        acc[curr] = params[curr]
        return acc
      }, {})

    const paramOption = joinOption(ast, 'param', referencedParams)

    if (paramOption) {
      ast.body.unshift(paramOption.body[0])
    }

    // Join together any duplicate task options
    const taskOption = joinOption(ast, 'task')
    if (taskOption) {
      ast.body.unshift(taskOption.body[0])
    }

    // turn it back into a query
    return format_from_js_file(ast)
  } catch {
    return ''
  }
}

export const parseQuery = (() => {
  const qs = {}

  return q => {
    const key = btoa(q)
    if (!qs[key]) {
      qs[key] = parse(q)
    }

    return qs[key]
  }
})()

export const updateWindowPeriod = (
  query: string,
  override: QueryScope = {},
  mode: 'json' | 'ast' = 'ast'
) => {
  const options: Record<string, any> = {}

  if (Object.keys(override?.vars ?? {}).length) {
    options.v = override.vars
  }
  if (Object.keys(override?.params ?? {}).length) {
    options.params = override.params
  }
  if (Object.keys(override?.task ?? {}).length) {
    options.task = override.task
  }

  const optionTexts = Object.entries(options)
    .map(([k, v]) => {
      const vals = Object.entries(v).map(([_k, _v]) => `  ${_k}: ${_v}`)
      return `option ${k} =  {${vals.join(',\n')}}`
    })
    .join('\n\n')

  const queryAST = parse(query)
  let optionAST = parse(optionTexts)

  // only run this if the query need a windowPeriod
  if (
    !find(
      queryAST,
      node =>
        node?.type === 'MemberExpression' &&
        node?.object?.name === 'v' &&
        node?.property?.name === 'windowPeriod'
    ).length
  ) {
    if (mode === 'ast') {
      return optionAST
    }

    return options
  } else if (isFlagEnabled('dontSolveWindowPeriod')) {
    if (options?.v?.timeRangeStart && options?.v?.timeRangeStop) {
      const NOW = Date.now()
      const range = find(
        optionAST,
        node =>
          node?.type === 'OptionStatement' && node?.assignment?.id?.name === 'v'
      ).reduce(
        (acc, curr) => {
          acc.start =
            find(
              curr,
              n => n.type === 'Property' && n?.key?.name === 'timeRangeStart'
            )[0]?.value ?? acc.start

          acc.stop =
            find(
              curr,
              n => n.type === 'Property' && n?.key?.name === 'timeRangeStop'
            )[0]?.value ?? acc.stop

          return acc
        },
        {
          start: null,
          stop: null,
        }
      )
      const duration =
        propertyTime(queryAST, range.stop, NOW) -
        propertyTime(queryAST, range.start, NOW)
      const foundDuration = SELECTABLE_TIME_RANGES.find(
        tr => tr.seconds * 1000 === duration
      )

      if (foundDuration) {
        options.v.windowPeriod = `${foundDuration.windowPeriod} ms`
      } else {
        options.v.windowPeriod = `${Math.round(
          duration / DESIRED_POINTS_PER_GRAPH
        )} ms`
      }
    } else {
      options.v.windowPeriod = `${FALLBACK_WINDOW_PERIOD} ms`
    }

    // write the mutations back out into the AST
    optionAST = parse(
      Object.entries(options)
        .map(([k, v]) => {
          const vals = Object.entries(v).map(([_k, _v]) => `  ${_k}: ${_v}`)
          return `option ${k} =  {${vals.join(',\n')}}`
        })
        .join('\n\n')
    )
  }

  try {
    const _optionAST = JSON.parse(JSON.stringify(optionAST))
    // make sure there's a variable in there named windowPeriod so later logic doesnt bail
    find(
      _optionAST,
      node =>
        node?.type === 'OptionStatement' && node?.assignment?.id?.name === 'v'
    ).forEach(node => {
      if (
        find(
          node,
          n => n.type === 'Property' && n?.key?.name === 'windowPeriod'
        ).length
      ) {
        return
      }

      if (isFlagEnabled('dontSolveWindowPeriod')) {
        throw new Error('v.windowPeriod is used and not defined')
      }

      node.assignment.init.properties.push({
        type: 'Property',
        key: {
          type: 'Identifier',
          name: 'windowPeriod',
        },
        value: {
          type: 'DurationLiteral',
          values: [{magnitude: FALLBACK_WINDOW_PERIOD, unit: 'ms'}],
        },
      })
    })

    const substitutedAST = {
      package: '',
      type: 'Package',
      files: [queryAST, _optionAST],
    }

    // use the whole query to get that option set by reference
    _addWindowPeriod(substitutedAST, _optionAST)

    if (mode === 'ast') {
      return _optionAST
    }

    // TODO write window period back out to json object
    return options
  } catch (e) {
    // there's a bunch of weird errors until we replace windowPeriod
    console.error(e)
    if (mode === 'ast') {
      return optionAST
    }
    return options
  }
}

export const sqlAsFlux = (text: string, bucket: OwnBucket) => {
  return `import "experimental/iox"

iox.sql(bucket: "${bucket.name}", query: ${JSON.stringify(text)})
  `
}
