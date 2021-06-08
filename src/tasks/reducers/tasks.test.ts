import tasksReducer from 'src/tasks/reducers'
import {setTaskOption, addTask} from 'src/tasks/actions/creators'

// Helpers
import {initialState, defaultOptions} from 'src/tasks/reducers/helpers'

// Types
import {TaskSchedule} from 'src/types'

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

  // N.B. Started as learning exercise.  low value?
  // Seems ADD_TASK simply wraps resource/reducers/helpers
  // Which are already covered
  describe('work with tasks', () => {
    it('should add a task', () => {
      const state = initialState()

      const actual = tasksReducer(
        state,
        addTask({
          result: 'task01',
          entities: {
            tasks: {
              '01': {name: 'testTask', orgID: 'MYORG', id: '0001', flux: ''},
            },
          },
        })
      )

      const actual2 = tasksReducer(
        actual,
        addTask({
          result: 'task02',
          entities: {
            tasks: {
              '02': {name: 'testTask', orgID: 'MYORG', id: '0002', flux: ''},
            },
          },
        })
      )

      expect(actual2.allIDs).toContain('task01')
      expect(actual2.allIDs).toContain('task02')
    })
  })
})
