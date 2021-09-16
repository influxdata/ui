// Libraries
import React, {FC, useContext, useCallback, useMemo} from 'react'
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
import {parse, format_from_js_file} from '@influxdata/flux-lsp-browser'
import ExportTaskButton from 'src/flows/pipes/Schedule/ExportTaskButton'

// Types
import {PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'

import {remove} from 'src/shared/contexts/query'

import './style.scss'

const Schedule: FC<PipeProp> = ({Context}) => {
  const {id, data, update} = useContext(PipeContext)
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

  const queryText = getPanelQueries(id, true)?.source ?? ''
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

  const generateTask = useCallback(() => {
    // simplify takes care of all the variable nonsense in the query
    const ast = parse(simplify(queryText))

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

    return format_from_js_file(ast)
  }, [queryText, data.interval, data.offset])

  const persist = (
    <ExportTaskButton
      generate={generateTask}
      text="Export as Task"
      type="task"
    />
  )

  return (
    <Context persistentControls={persist}>
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child
          basis={168}
          grow={0}
          shrink={0}
          className="flow-panel-schedule--header"
        >
          <h5>Run this on a schedule</h5>
          <p>Must be exported as a task</p>
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
