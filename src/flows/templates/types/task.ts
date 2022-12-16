import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {
  parse,
  format_from_js_file,
} from 'src/languageSupport/languages/flux/parser'
import {remove} from 'src/shared/contexts/query'

export default register =>
  register({
    type: 'task',
    init: id => {
      if (!id) {
        return Promise.resolve({
          spec: {
            readOnly: false,
            range: DEFAULT_TIME_RANGE,
            refresh: AUTOREFRESH_DEFAULT,
            pipes: [
              {
                buckets: [],
                tags: [
                  {
                    key: '_measurement',
                    values: [],
                    aggregateFunctionType: 'filter',
                  },
                ],
                type: 'queryBuilder',
                title: 'Query to Run',
                visible: true,
              },
              {
                title: 'Validate the Data',
                visible: true,
                type: 'table',
              },
              {
                type: 'schedule',
                title: 'Schedule as a Task',
                visible: true,
              },
            ],
          },
        })
      }

      return fetch(`/api/v2/tasks/${id}`)
        .then(resp => resp.json())
        .then(resp => {
          const ast = parse(resp.flux)
          const taskParams = remove(
            ast,
            node =>
              node.type === 'OptionStatement' &&
              node.assignment.id.name === 'task'
          )
            .reverse()
            .reduce((acc, curr) => {
              // eslint-disable-next-line no-extra-semi
              ;(curr.assignment?.init?.properties || []).reduce(
                (_acc, _curr) => {
                  if (_curr.key?.name && _curr.value?.location?.source) {
                    _acc[_curr.key.name] = _curr.value.location.source
                  }

                  return _acc
                },
                acc
              )

              return acc
            }, {})

          return {
            name: resp.name,
            spec: {
              readOnly: false,
              range: DEFAULT_TIME_RANGE,
              refresh: AUTOREFRESH_DEFAULT,
              pipes: [
                {
                  activeQuery: 0,
                  queries: [
                    {
                      text: format_from_js_file(ast),
                      editMode: 'advanced',
                      builderConfig: {
                        buckets: [],
                        tags: [],
                        functions: [],
                      },
                    },
                  ],
                  type: 'rawFluxEditor',
                  title: 'Query to Run',
                  visible: true,
                },
                {
                  title: 'Validate the Data',
                  visible: true,
                  type: 'table',
                },
                {
                  type: 'schedule',
                  title: 'Schedule as a Task',
                  visible: true,
                  interval:
                    taskParams.every ||
                    taskParams.cron.replace(/(^")|("$)/g, ''),
                  offset: taskParams.offset,
                  task: {
                    id,
                    name: resp.name,
                    flux: resp.flux,
                  },
                },
              ],
            },
          }
        })
    },
  })
