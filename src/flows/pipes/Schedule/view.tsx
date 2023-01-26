// Libraries
import React, {FC, useContext, useCallback, useEffect, useMemo} from 'react'
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
import {
  parse,
  format_from_js_file,
} from 'src/languageSupport/languages/flux/lspUtils'
import ExportTaskButton from 'src/flows/pipes/Schedule/ExportTaskButton'
import {patchTask, TaskUpdateRequest} from 'src/client'

// Types
import {PipeProp} from 'src/types/flows'

import {PipeContext} from 'src/flows/context/pipe'
import {FlowQueryContext} from 'src/flows/context/flow.query'
import {SidebarContext} from 'src/flows/context/sidebar'
import History from 'src/flows/pipes/Schedule/History'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

import {remove} from 'src/shared/contexts/query'

import './style.scss'

const validCron = (text: string): boolean => {
  const isNumber = (str: string, min: number, max: number) => {
    if (str.search(/[^\d-,\/*]/) !== -1) {
      return false
    }

    return str.split(',').every(item => {
      if (item.trim().endsWith('/')) {
        return false
      }
      const splits = item.split('/')

      if (splits.length > 2) {
        return false
      }

      const [left, right] = splits
      const sides = left.split('-')

      if (
        right !== undefined &&
        (!/^\d+$/.test(right) || parseInt(right) <= 0)
      ) {
        return false
      }

      if (sides.length > 2) {
        return false
      }

      if (sides.length === 1) {
        return (
          sides[0] === '*' ||
          (/^\d+$/.test(sides[0]) &&
            min <= parseInt(sides[0]) &&
            parseInt(sides[0]) <= max)
        )
      }

      if (!/^\d+$/.test(sides[0]) || !/^\d+$/.test(sides[1])) {
        return false
      }

      const small = parseInt(sides[0])
      const big = parseInt(sides[1])

      return (
        !isNaN(small) &&
        !isNaN(big) &&
        small <= big &&
        min <= small &&
        small <= max &&
        min <= big &&
        big <= max
      )
    })
  }

  const mapMonth = (str: string): string =>
    str.toLowerCase().replace(
      /[a-z]{3}/g,
      _str =>
        ({
          jan: '1',
          feb: '2',
          mar: '3',
          apr: '4',
          may: '5',
          jun: '6',
          jul: '7',
          aug: '8',
          sep: '9',
          oct: '10',
          nov: '11',
          dec: '12',
        }[_str] || _str)
    )
  const mapDay = (str: string): string =>
    str.toLowerCase().replace(
      /[a-z]{3}/g,
      _str =>
        ({
          sun: '0',
          mon: '1',
          tue: '2',
          wed: '3',
          thu: '4',
          fri: '5',
          sat: '6',
        }[_str] || _str)
    )
  const split = text.trim().split(/\s+/)
  if (split.length < 5 || split.length > 6) {
    return false
  }

  if (split.length === 5) {
    split.unshift('*')
  }

  return [
    isNumber(split[0], 0, 59),
    isNumber(split[1], 0, 59),
    isNumber(split[2], 0, 23),
    isNumber(split[3], 1, 31),
    isNumber(mapMonth(split[4]), 1, 12),
    isNumber(mapDay(split[5]), 0, 7),
  ].reduce((acc, curr) => acc && curr, true)
}

const Schedule: FC<PipeProp> = ({Context}) => {
  const {id, data, update} = useContext(PipeContext)
  const {simplify, getPanelQueries} = useContext(FlowQueryContext)
  const {register} = useContext(SidebarContext)
  let intervalError = ''
  let offsetError = ''

  if (data?.interval === '') {
    intervalError = 'Required'
  } else if (
    data.interval !==
      data.interval
        ?.match(/(?:(\d+(ns|us|µs|ms|s|m|h|d|w|mo|y){1}))/g)
        ?.join('') &&
    !validCron(data.interval)
  ) {
    intervalError = 'Invalid Time'
  }

  if (
    data.offset &&
    data.offset !==
      data.offset.match(/(?:(\d+(ns|us|µs|ms|s|m|h|d|w|mo|y){1}))/g)?.join('')
  ) {
    offsetError = 'Invalid Time'
  }
  let latestTask
  if (data.task?.id) {
    latestTask = data.task
  } else if (data.task?.length) {
    latestTask = data.task[0]
  }

  const queryText = getPanelQueries(id)?.source ?? ''
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
  const taskText = useMemo(() => {
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
      if (validCron(data.interval)) {
        params.cron = `"${data.interval}"`
      } else {
        params.every = data.interval
      }
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
  const hasChanges = taskText !== latestTask?.flux ?? ''

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
    return taskText
  }, [taskText])

  const storeTask = (task: any) => {
    const list = ((data.task?.id ? [data.task] : data.task) || []).slice(0)
    list.unshift({
      id: task.id,
      name: task.name,
      flux: task.flux,
    })
    update({
      task: list,
    })
  }

  useEffect(() => {
    if (!id || !data.task) {
      return
    }

    register(id, [
      {
        title: 'Task',
        actions: [
          {
            title: 'View Run History',
            menu: <History tasks={data.task.id ? [data.task] : data.task} />,
          },
          {
            title: 'Overwrite Existing Task',
            disable: () => !latestTask || !hasChanges,
            action: () => {
              const _data: TaskUpdateRequest = {
                flux: generateTask(),
              }
              if (
                data.interval?.match(/(?:(\d+(y|mo|s|m|w|h){1}))/g)?.join('')
              ) {
                _data.every = data.interval
              } else {
                _data.cron = data.interval
              }

              if (data.offset) {
                _data.offset = data.offset
              }

              patchTask({
                taskID: latestTask.id,
                data: _data,
              }).then(() => {
                data.task.find(t => t.id === latestTask.id).flux =
                  generateTask()
                update({task: [...data.task]})
              })
            },
          },
        ],
      },
    ])
  }, [id, data.task, hasChanges])

  const persist = (
    <ExportTaskButton
      generate={generateTask}
      onCreate={storeTask}
      text="Save to Tasks"
      disabled={
        !hasChanges || !!intervalError || !!offsetError || !data?.interval
      }
      type="task"
    />
  )

  return (
    <Context persistentControls={persist}>
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child
          basis={200}
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
            helpText={
              (
                <>
                  Supports{' '}
                  <SafeBlankLink href="https://docs.influxdata.com/flux/v0.x/data-types/basic/duration/#duration-syntax">
                    flux durations
                  </SafeBlankLink>{' '}
                  and{' '}
                  <SafeBlankLink href="https://crontab.guru">
                    cron intervals
                  </SafeBlankLink>
                </>
              ) as unknown as string
            }
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
            helpText={
              (
                <>
                  Supports{' '}
                  <SafeBlankLink href="https://docs.influxdata.com/flux/v0.x/data-types/basic/duration/#duration-syntax">
                    flux durations
                  </SafeBlankLink>
                </>
              ) as unknown as string
            }
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
