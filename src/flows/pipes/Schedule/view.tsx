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

// Types
import {PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'

const _pop = (node, test, acc = []) => {
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
        _pop(val[ni], test, acc)
        ni++
      }
    } else if (typeof val === 'object') {
      if (val && test(val)) {
        delete node[key]
      } else {
        _pop(val, test, acc)
      }
    }
  })

  return acc
}

const Schedule: FC<PipeProp> = ({Context}) => {
  const {id, data, queryText, update} = useContext(PipeContext)
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
    const ast = parse(queryText)

    const opts = _pop(
      ast,
      node =>
        node.type === 'OptionStatement' && node.assignment.id.name === 'task'
    )

    const fixed = format_from_js_file(ast)

    const params: any = {
      name: `"Notebook Task for ${id}"`,
    }

    if (data.interval && !intervalError) {
      params.every = data.interval
    }

    if (data.offset && !offsetError) {
      params.offset = data.offset
    }
    const header = `option task = {${Object.entries(params)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ')}}\n\n`

    return [header + fixed, !!opts.length]
  }, [queryText])

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

  return (
    <Context>
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child basis={168} grow={0} shrink={0}>
          <h5>Run this on a schedule</h5>
        </FlexBox.Child>
        <FlexBox.Child grow={1} shrink={1}>
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

        <FlexBox.Child grow={1} shrink={1}>
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
