// APIs
import {runQuery} from 'src/shared/apis/query'
import {fromFlux} from '@influxdata/giraffe'

// Utils
import {resolveSelectedKey} from 'src/variables/utils/resolveSelectedValue'
import {formatVarsOption} from 'src/variables/utils/formatVarsOption'
import {buildUsedVarsOption} from 'src/variables/utils/buildVarsOption'
import {event} from 'src/cloud/utils/reporting'

// Types
import {
  VariableAssignment,
  VariableValues,
  FluxColumnType,
  Variable,
} from 'src/types'
import {CancelBox} from 'src/types/promises'

const cacheKey = (
  url: string,
  orgID: string,
  query: string,
  variables: Variable[] | VariableAssignment[]
): string => {
  return `${query}\n\n${formatVarsOption(variables)}\n\n${orgID}\n\n${url}`
}

/*
  Given the CSV response for a Flux query, get the set of values from the first
  `_value` column in the response, as well as the column type of these values
  and a choice of selected value.

  The selected value must exist in the returned values for the response. We
  will first try to use the `prevSelection`, then the `defaultSelection`,
  before finally falling back to the first value returned in the response.
*/
export const extractValues = (
  csv: string,
  prevSelection?: string,
  defaultSelection?: string
): VariableValues => {
  const {table} = fromFlux(csv)
  if (!table || !table.getColumn('_value', 'string')) {
    return {
      values: [],
      valueType: 'string',
      selected: [],
    }
  }
  let values = table.getColumn('_value', 'string') || []
  values = [...new Set(values)]
  values.sort()

  return {
    values,
    valueType: table.getColumnType('_value') as FluxColumnType,
    selected: [resolveSelectedKey(values, prevSelection, defaultSelection)],
  }
}

export interface ValueFetcher {
  fetch: (
    url: string,
    orgID: string,
    query: string,
    variables: Variable[] | VariableAssignment[],
    prevSelection: string,
    defaultSelection: string,
    skipCache: boolean,
    controller?: AbortController
  ) => CancelBox<VariableValues>
}

export class DefaultValueFetcher implements ValueFetcher {
  private cache: {[cacheKey: string]: VariableValues} = {}

  public fetch(
    url,
    orgID,
    query,
    variables,
    prevSelection,
    defaultSelection,
    skipCache,
    abortController
  ) {
    const key = cacheKey(url, orgID, query, variables)

    if (!skipCache) {
      const cachedValues = this.cachedValues(
        key,
        prevSelection,
        defaultSelection
      )

      if (cachedValues) {
        return {promise: Promise.resolve(cachedValues), cancel: () => {}}
      }
    }

    const extern = buildUsedVarsOption(query, variables)
    const request = runQuery(orgID, query, extern, abortController)
    event('runQuery', {context: 'variables'})

    const promise = request.promise.then(result => {
      if (result.type !== 'SUCCESS') {
        return Promise.reject(result.message)
      }

      const values = extractValues(result.csv, prevSelection, defaultSelection)

      this.cache[key] = values

      return values
    })

    return {
      promise,
      cancel: request.cancel,
    }
  }

  private cachedValues(
    key: string,
    prevSelection: string,
    defaultSelection: string
  ): VariableValues {
    const cachedValues = this.cache[key]

    if (!cachedValues) {
      return null
    }

    return {
      ...cachedValues,
      selected: [
        resolveSelectedKey(
          cachedValues.values as string[],
          prevSelection,
          defaultSelection
        ),
      ],
    }
  }
}

export const valueFetcher = new DefaultValueFetcher()
