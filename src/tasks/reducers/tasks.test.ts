import tasksReducer from 'src/tasks/reducers'
import {setTaskOption, addTask} from 'src/tasks/actions/creators'

// Helpers
import {initialState, defaultOptions} from 'src/tasks/reducers/helpers'

// Types
import {TaskSchedule} from 'src/types'
import {normalize} from 'normalizr'

describe('tasksReducer', () => {
  describe('setTaskOption', () => {
    it('should not clear the cron property from the task options when interval is selected', () => {
      const state = initialState()

      const cron = '0 2 * * *'
      state.taskOptions = {...defaultOptions, cron}

      const actual = tasksReducer(
        state,
        setTaskOption({key: 'taskScheduleType', value: TaskSchedule.interval})
      )

      const expected = {
        ...state,
        taskOptions: {
          ...defaultOptions,
          taskScheduleType: TaskSchedule.interval,
          cron,
        },
      }

      expect(actual).toEqual(expected)
    })

    it('should not clear the interval property from the task options when cron is selected', () => {
      const state = initialState()
      const interval = '24h'
      state.taskOptions = {...defaultOptions, interval} // todo(docmerlin): allow for time units larger than 1d, right now h is the longest unit our s

      const actual = tasksReducer(
        state,
        setTaskOption({key: 'taskScheduleType', value: TaskSchedule.cron})
      )

      const expected = {
        ...state,
        taskOptions: {
          ...defaultOptions,
          taskScheduleType: TaskSchedule.cron,
          interval,
        },
      }

      expect(actual).toEqual(expected)
    })
  })

  describe('sample test', () => {
    it('should work', () => {
      const state = initialState()

      console.log(`DEBUG state.taskOptions ${JSON.stringify(state.taskOptions)}`);

      console.log(`DEBUG state ${JSON.stringify(state)}`)

      const actual = tasksReducer(state, addTask({
        result: 'task01', entities: { tasks:
            {
                 '01': { name: 'testTask',
                  orgID: '',
                  id: '',
                  flux: '' },
            },
          }}))

      const actual2 = tasksReducer(actual, addTask({
        result: 'task02', entities: { tasks:
            {
              '02': { name: 'testTask',
                orgID: '',
                id: '',
                flux: '' },
            },
        }}))

      console.log(`DEBUG actual2 ${JSON.stringify(actual2)}`)

      expect(actual2.allIDs).toContain('task01')
      expect(actual2.allIDs).toContain('task02')

    })
  })
})
