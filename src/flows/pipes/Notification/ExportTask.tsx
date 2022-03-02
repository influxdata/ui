import React, {FC, useContext, useCallback, useState} from 'react'
import {useDispatch} from 'react-redux'
import {parse, format_from_js_file} from '@influxdata/flux-lsp-browser'

// Components
import ExportTaskButton from 'src/flows/pipes/Schedule/ExportTaskButton'
import {ENDPOINT_DEFINITIONS} from 'src/flows/pipes/Notification/endpoints'

// Contexts
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {PipeContext} from 'src/flows/context/pipe'
import {remove} from 'src/shared/contexts/query'

// Types
import {
  deadmanType,
  THRESHOLD_TYPES,
} from 'src/flows/pipes/Visualization/threshold'
import {RemoteDataState} from 'src/types'
import {ImportDeclaration} from 'src/types/ast'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {notify} from 'src/shared/actions/notifications'
import {
  exportAlertToTaskSuccess,
  exportAlertToTaskFailure,
} from 'src/shared/copy/notifications'

function heuristicValidityCheck(query: string): boolean {
  // no undefined fields. e.g. `trigger = (r) => r["undefined"] > 0`
  // no empty strings. e.g. in `src/flows/pipes/Notification/endpoints`, we typically set the defaults as ''
  if (/('')|("undefined")|((\\"undefined\\"))/g.test(query)) {
    throw new Error(`Flux contains invalid values. Form fields may be empty.`)
  }
  return true
}

const ExportTask: FC = () => {
  const dispatch = useDispatch()
  const {id, data} = useContext(PipeContext)
  const {simplify, getPanelQueries} = useContext(FlowQueryContext)
  const [status, setStatus] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  const queryText = getPanelQueries(id)?.source

  const generateDeadmanTask = useCallback(() => {
    // simplify takes care of all the variable nonsense in the query
    const ast = parse(simplify(queryText))

    const [deadman] = data.thresholds

    const vars = remove(
      ast,
      node => node.type === 'OptionStatement' && node.assignment.id.name === 'v'
    ).reduce((acc, curr) => {
      // eslint-disable-next-line no-extra-semi
      ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
        if (_curr.key?.name && _curr.value?.location?.source) {
          _acc[_curr.key.name] = _curr.value.location.source
        }

        return _acc
      }, acc)

      return acc
    }, {})

    vars.timeRangeStart = `-${deadman?.deadmanStopValue}`

    const params = remove(
      ast,
      node =>
        node.type === 'OptionStatement' && node.assignment.id.name === 'task'
    ).reduce((acc, curr) => {
      // eslint-disable-next-line no-extra-semi
      ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
        if (_curr.key?.name && _curr.value?.location?.source) {
          _acc[_curr.key.name] = _curr.value.location.source
        }

        return _acc
      }, acc)

      return acc
    }, {})

    const conditions = THRESHOLD_TYPES[deadmanType].condition(deadman)
    const imports = parse(`
import "strings"
import "regexp"
import "influxdata/influxdb/monitor"
import "influxdata/influxdb/schema"
import "influxdata/influxdb/secrets"
import "experimental"
${ENDPOINT_DEFINITIONS[data.endpoint]?.generateImports()}`)

    imports.imports = Object.values(
      imports.imports.concat(ast.imports || []).reduce((acc, curr) => {
        acc[curr.path.value] = curr
        return acc
      }, {})
    ).sort((a: ImportDeclaration, b: ImportDeclaration) =>
      b.path.value.toLowerCase().localeCompare(a.path.value.toLowerCase())
    )

    ast.imports = []

    const newQuery = `
${format_from_js_file(imports)}

check = {
    _check_id: "${id}",
    _check_name: "Notebook Generated Deadman Check",
    _type: "deadman",
    tags: {},
}

notification = {
    _notification_rule_id: "${id}",
    _notification_rule_name: "Notebook Generated Rule",
    _notification_endpoint_id: "${id}",
    _notification_endpoint_name: "Notebook Generated Endpoint",
}

task_data = ${format_from_js_file(ast)}
trigger = ${conditions}
messageFn = (r) => ("${data.message}")

${ENDPOINT_DEFINITIONS[data.endpoint]?.generateQuery(data.endpointData)}
|> monitor["deadman"](t: experimental["subDuration"](from: now(), d: ${
      deadman.deadmanCheckValue
    }))`

    const newAST = parse(newQuery)

    if (!params.name) {
      params.name = `"Notebook Deadman Task for ${id}"`
    }

    if (data.interval) {
      params.every = data.interval
    }

    if (data.offset) {
      params.offset = data.offset
    }

    if (Object.keys(vars).length) {
      const varString = Object.entries(vars)
        .map(([key, val]) => `${key}: ${val}`)
        .join(',\n')
      const varHeader = parse(`option v = {${varString}}\n`)
      newAST.body.unshift(varHeader.body[0])
    }

    const paramString = Object.entries(params)
      .map(([key, val]) => `${key}: ${val}`)
      .join(',\n')
    const taskHeader = parse(`option task = {${paramString}}\n`)
    newAST.body.unshift(taskHeader.body[0])

    return format_from_js_file(newAST)
  }, [
    id,
    queryText,
    data.every,
    data.offset,
    data.endpointData,
    data.endpoint,
    data.thresholds,
    data.message,
  ])

  const generateThresholdTask = useCallback(() => {
    // simplify takes care of all the variable nonsense in the query
    const ast = parse(simplify(queryText))

    const vars = remove(
      ast,
      node => node.type === 'OptionStatement' && node.assignment.id.name === 'v'
    ).reduce((acc, curr) => {
      // eslint-disable-next-line no-extra-semi
      ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
        if (_curr.key?.name && _curr.value?.location?.source) {
          _acc[_curr.key.name] = _curr.value.location.source
        }

        return _acc
      }, acc)

      return acc
    }, {})
    const params = remove(
      ast,
      node =>
        node.type === 'OptionStatement' && node.assignment.id.name === 'task'
    ).reduce((acc, curr) => {
      // eslint-disable-next-line no-extra-semi
      ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
        if (_curr.key?.name && _curr.value?.location?.source) {
          _acc[_curr.key.name] = _curr.value.location.source
        }

        return _acc
      }, acc)

      return acc
    }, {})

    const conditions = data.thresholds
      .map(threshold => THRESHOLD_TYPES[threshold.type].condition(threshold))
      .join(' and ')

    const imports = parse(`
import "strings"
import "regexp"
import "influxdata/influxdb/monitor"
import "influxdata/influxdb/schema"
import "influxdata/influxdb/secrets"
import "experimental"
${ENDPOINT_DEFINITIONS[data.endpoint]?.generateImports()}`)

    imports.imports = Object.values(
      imports.imports.concat(ast.imports || []).reduce((acc, curr) => {
        acc[curr.path.value] = curr
        return acc
      }, {})
    ).sort((a: ImportDeclaration, b: ImportDeclaration) =>
      b.path.value.toLowerCase().localeCompare(a.path.value.toLowerCase())
    )

    ast.imports = []

    const newQuery = `
${format_from_js_file(imports)}

check = {
    _check_id: "${id}",
    _check_name: "Notebook Generated Check",
    _type: "custom",
    tags: {},
}
notification = {
    _notification_rule_id: "${id}",
    _notification_rule_name: "Notebook Generated Rule",
    _notification_endpoint_id: "${id}",
    _notification_endpoint_name: "Notebook Generated Endpoint",
}

task_data = ${format_from_js_file(ast)}
trigger = ${conditions}
messageFn = (r) => ("${data.message}")

${ENDPOINT_DEFINITIONS[data.endpoint]?.generateQuery(data.endpointData)}`

    const newAST = parse(newQuery)

    if (!params.name) {
      params.name = `"Notebook Task for ${id}"`
    }

    if (data.interval) {
      params.every = data.interval
    }

    if (data.offset) {
      params.offset = data.offset
    }

    if (Object.keys(vars).length) {
      const varString = Object.entries(vars)
        .map(([key, val]) => `${key}: ${val}`)
        .join(',\n')
      const varHeader = parse(`option v = {${varString}}\n`)
      newAST.body.unshift(varHeader.body[0])
    }

    const paramString = Object.entries(params)
      .map(([key, val]) => `${key}: ${val}`)
      .join(',\n')
    const taskHeader = parse(`option task = {${paramString}}\n`)
    newAST.body.unshift(taskHeader.body[0])

    return format_from_js_file(newAST)
  }, [
    id,
    queryText,
    data.every,
    data.offset,
    data.endpointData,
    data.endpoint,
    data.thresholds,
    data.message,
  ])

  const generateTask = useCallback(() => {
    event('Alert Panel (Notebooks) - Export Alert Task Clicked')

    if (data.thresholds[0].type === deadmanType) {
      return generateDeadmanTask()
    } else {
      return generateThresholdTask()
    }
  }, [generateDeadmanTask, generateThresholdTask, data.thresholds])

  const validateTask = (queryText: string): boolean => {
    try {
      setStatus(RemoteDataState.Loading)
      // TODO: use full sematic validation, once this is done:
      // https://github.com/influxdata/ui/issues/3926
      // temporary check:
      heuristicValidityCheck(queryText)

      setStatus(RemoteDataState.Done)
      dispatch(notify(exportAlertToTaskSuccess(data.endpoint)))
      return true
    } catch {
      setStatus(RemoteDataState.Error)
      dispatch(notify(exportAlertToTaskFailure(data.endpoint)))
      return false
    }
  }

  const handleTaskCreation = _ => {
    dispatch(notify(exportAlertToTaskSuccess(data.endpoint)))
  }

  return (
    <ExportTaskButton
      loading={status == RemoteDataState.Loading}
      generate={generateTask}
      validate={validateTask}
      onCreate={handleTaskCreation}
      text="Export Alert Task"
      type="alert"
    />
  )
}

export default ExportTask
