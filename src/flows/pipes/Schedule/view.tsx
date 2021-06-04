// Libraries
import React, {FC, useContext, useEffect, useMemo} from 'react'
import {
  ComponentStatus,
  Form,
  FlexBox,
  Input,
  InputType,
  Icon,
  IconFont,
  ComponentSize,
} from '@influxdata/clockface'
import {parse, format_from_js_file} from '@influxdata/flux'
import ExportTaskButton from 'src/flows/pipes/Schedule/ExportTaskButton'
import ExportTaskOverlay from 'src/flows/pipes/Schedule/ExportTaskOverlay'

// Types
import {PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'
import {PopupContext} from 'src/flows/context/popup'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {SidebarContext} from 'src/flows/context/sidebar'

import {remove} from 'src/flows/context/query'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const Schedule: FC<PipeProp> = ({Context}) => {
  const {id, data, queryText, update, range} = useContext(PipeContext)
  const {register} = useContext(SidebarContext)
  const {launch} = useContext(PopupContext)
  const {simplify} = useContext(FlowQueryContext)
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

  const [query, hasTaskOption] = useMemo(() => {
    // simplify takes care of all the variable nonsense in the query
    const ast = parse(simplify(queryText))

    const params = remove(
      ast,
      node =>
        node.type === 'OptionStatement' && node.assignment.id.name === 'task'
    ).reduce((acc, curr) => {
      // eslint-disable no-extra-semi
      ;(curr.assignment?.init?.properties || []).reduce((_acc, _curr) => {
        // eslint-enable no-extra-semi
        if (_curr.key?.name && _curr.value?.location?.source) {
          _acc[_curr.key.name] = _curr.value.location.source
        }

        return _acc
      }, acc)

      return acc
    }, {})
    const hasTask = Object.keys(params).length

    if (!params.name) {
      params.name = `"Notebook Task for ${id}"`
    }

    if (data.interval && !intervalError) {
      params.every = data.interval
    }

    if (data.offset && !offsetError) {
      params.offset = data.offset
    }

    const paramString = Object.entries(params)
      .map(([key, val]) => `${key}: ${val}`)
      .join(',\n')
    const header = parse(`option task = {${paramString}}\n`)
    ast.body.unshift(header.body[0])

    return [format_from_js_file(ast), hasTask]
  }, [queryText, data.interval, data.offset])

  useEffect(() => {
    if (data.query === query) {
      return
    }

    update({
      query: query,
    })
  }, [query])

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

  useEffect(() => {
    if (!id) {
      return
    }

    register(id, [
      {
        title: 'Schedule Panel',
        actions: [
          {
            title: 'Export as Task',
            action: () => {
              event('Export Task Clicked', {scope: 'schedule'})

              launch(<ExportTaskOverlay />, {
                properties: data.properties,
                range: range,
                query: data.query,
              })
            },
          },
        ],
      },
    ])
  }, [id, data.query, data.properties, range])
  const persist = isFlagEnabled('flow-sidebar') ? null : <ExportTaskButton />

  return (
    <Context persistentControls={persist}>
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child basis={168} grow={0} shrink={0}>
          <h5>Run this on a schedule</h5>
        </FlexBox.Child>
        <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
          <Form.Element
            label="Every"
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
                intervalError ? ComponentStatus.Error : ComponentStatus.Default
              }
              size={ComponentSize.Medium}
            />
          </Form.Element>
        </FlexBox.Child>

        <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
          <Form.Element
            label="Offset"
            required={false}
            errorMessage={offsetError}
          >
            <Input
              name="interval"
              type={InputType.Text}
              placeholder="ex: 20m"
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
      {warningMessage}
    </Context>
  )
}

export default Schedule
