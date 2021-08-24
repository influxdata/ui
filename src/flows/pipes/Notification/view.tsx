// Libraries
import React, {FC, useContext, useCallback, useMemo} from 'react'
import {parse, format_from_js_file} from '@influxdata/flux'
import {
  ComponentStatus,
  Form,
  FlexBox,
  Input,
  InputType,
  Icon,
  IconFont,
  ComponentSize,
  Panel,
  TextArea,
  AlignItems,
  JustifyContent,
  Dropdown,
} from '@influxdata/clockface'
import {RemoteDataState} from 'src/types'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {remove} from 'src/flows/context/query'

import Threshold, {
  THRESHOLD_TYPES,
} from 'src/flows/pipes/Notification/Threshold'
import {DEFAULT_ENDPOINTS} from 'src/flows/pipes/Notification/Endpoints'
import ExportTaskButton from 'src/flows/pipes/Schedule/ExportTaskButton'

// Types
import {PipeProp} from 'src/types/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Styles
import 'src/flows/pipes/Notification/styles.scss'

const Notification: FC<PipeProp> = ({Context}) => {
  const {id, data, update, results, loading} = useContext(PipeContext)
  const {simplify, getPanelQueries} = useContext(FlowQueryContext)

  let intervalError = ''
  let offsetError = ''

  if (!data.interval) {
    intervalError = 'Required'
  } else if (
    data.interval !==
    data.interval.match(/(?:(\d+(y|mo|s|m|w|h){1}))/g)?.join('')
  ) {
    intervalError = 'Invalid Time'
  }

  if (
    data.offset &&
    data.offset !== data.offset.match(/(?:(\d+(y|mo|s|m|w|h){1}))/g)?.join('')
  ) {
    offsetError = 'Invalid Time'
  }

  const loadingText = useMemo(() => {
    if (loading === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (loading === RemoteDataState.NotStarted) {
      return 'This cell will display results from the previous cell'
    }

    return 'No Data Returned'
  }, [loading])

  const queryText = getPanelQueries(id, true).source
  const hasTaskOption = useMemo(
    () =>
      !!Object.keys(
        remove(
          parse(simplify(queryText)),
          node =>
            node.type === 'OptionStatement' &&
            node.assignment.id.name === 'task'
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
      ).length,
    [queryText]
  )

  const numericColumns = (results?.parsed?.table?.columnKeys || []).filter(
    key => {
      if (key === 'result' || key === 'table') {
        return false
      }

      const columnType = results.parsed.table.getColumnType(key)

      return columnType === 'time' || columnType === 'number'
    }
  )

  const updateMessage = evt => {
    update({
      message: evt.target.value,
    })
  }

  const updateInterval = evt => {
    update({
      interval: evt.target.value,
    })
  }

  const updateOffset = evt => {
    update({
      offset: evt.target.value,
    })
  }

  const updateEndpoint = which => {
    event('Changed Notification Endpoint', {which})

    update({
      endpoint: which,
      endpointData: DEFAULT_ENDPOINTS[which].data,
    })
  }

  const warningMessage = useMemo(() => {
    if (!hasTaskOption) {
      return
    }

    return (
      <div className="flow-error">
        <div className="flow-error--header">
          <Icon
            glyph={IconFont.AlertTriangle}
            className="flow-error--vis-toggle"
          />
        </div>
        <div className="flow-error--body">
          <h1>The task option is reserved</h1>
          <p>
            This panel will take precedence over any task configuration and
            overwrite the option. Remove it from your source query to remove
            this message
          </p>
        </div>
      </div>
    )
  }, [hasTaskOption])

  const avail = Object.keys(DEFAULT_ENDPOINTS).map(k => (
    <Dropdown.Item
      key={k}
      id={k}
      onClick={() => updateEndpoint(k)}
      selected={data.endpoint === k}
    >
      {DEFAULT_ENDPOINTS[k].name}
    </Dropdown.Item>
  ))

  const generateTask = useCallback(() => {
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

    const newQuery = `
import "strings"
import "regexp"
import "influxdata/influxdb/monitor"
import "influxdata/influxdb/schema"
import "influxdata/influxdb/secrets"
import "experimental"
${DEFAULT_ENDPOINTS[data.endpoint]?.generateImports()}

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

${DEFAULT_ENDPOINTS[data.endpoint]?.generateQuery(data.endpointData)}`

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

  if (
    loading === RemoteDataState.NotStarted ||
    loading === RemoteDataState.Loading
  ) {
    return (
      <Context>
        <div className="panel-resizer">
          <div className="panel-resizer--header">
            <Icon glyph={IconFont.Bell} className="panel-resizer--vis-toggle" />
          </div>
          <div className="panel-resizer--body">
            <div className="panel-resizer--empty">{loadingText}</div>
          </div>
        </div>
        {warningMessage}
      </Context>
    )
  }

  if (!numericColumns.length) {
    return (
      <Context>
        <div className="panel-resizer">
          <div className="panel-resizer--header">
            <Icon glyph={IconFont.Bell} className="panel-resizer--vis-toggle" />
          </div>
          <div className="panel-resizer--body">
            <div className="panel-resizer--empty">
              This cell requires a numeric column. Check your source query
            </div>
          </div>
        </div>
        {warningMessage}
      </Context>
    )
  }

  return (
    <Context>
      <div className="notification">
        <Threshold />
        <FlexBox margin={ComponentSize.Medium}>
          <FlexBox.Child grow={1} shrink={1}>
            <Form.Element
              label="Check Every"
              required={true}
              errorMessage={intervalError}
            >
              <Input
                name="interval"
                type={InputType.Text}
                placeholder="ex: 3h30s"
                value={data.interval}
                onChange={updateInterval}
                status={
                  intervalError
                    ? ComponentStatus.Error
                    : ComponentStatus.Default
                }
                size={ComponentSize.Medium}
              />
            </Form.Element>
          </FlexBox.Child>

          <FlexBox.Child grow={1} shrink={1}>
            <Form.Element
              label="Query Offset"
              required={true}
              errorMessage={offsetError}
            >
              <Input
                name="interval"
                type={InputType.Text}
                placeholder="ex: 3h30s"
                value={data.offset}
                onChange={updateOffset}
                status={
                  offsetError ? ComponentStatus.Error : ComponentStatus.Default
                }
                size={ComponentSize.Medium}
              />
            </Form.Element>
          </FlexBox.Child>
        </FlexBox>
        <FlexBox alignItems={AlignItems.Stretch} margin={ComponentSize.Medium}>
          <Dropdown.Menu className="flows-endpoints--dropdown">
            {avail}
          </Dropdown.Menu>
          <FlexBox.Child grow={1} shrink={1}>
            {React.createElement(DEFAULT_ENDPOINTS[data.endpoint].view)}
          </FlexBox.Child>
          <FlexBox.Child grow={2} shrink={1} style={{display: 'flex'}}>
            <Form.Element label="Message Format" required={true}>
              <TextArea
                name="message"
                rows={10}
                value={data.message}
                onChange={updateMessage}
                size={ComponentSize.Medium}
                style={{height: '100%'}}
              />
            </Form.Element>
          </FlexBox.Child>
        </FlexBox>
        <Panel.Footer justifyContent={JustifyContent.FlexEnd}>
          <ExportTaskButton
            generate={generateTask}
            text="Export as Alert Task"
          />
        </Panel.Footer>
      </div>
      {warningMessage}
    </Context>
  )
}

export default Notification
