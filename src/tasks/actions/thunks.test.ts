import {jest} from '@jest/globals'

import * as thunks from './thunks'
import * as api from 'src/client'
import {getMockAppState} from 'src/mockAppState'
import {RemoteDataState} from '../../types'
import {taskUpdateSuccess} from 'src/shared/copy/notifications'

const sampleTask = {id: '01', orgID: '01', name: 'Test Task', flux: ''}

jest.mock('src/client', () => ({
  patchTask: jest.fn(),
  getTasks: jest.fn(),
}))

jest.mock('./thunks', () => ({
  ...(jest as any).requireActual('./thunks.ts'),
  testTask: jest.fn(),
}))

jest.mock('src/resources/selectors', () => ({
  ...(jest as any).requireActual('src/resources/selectors'),
  getStatus: jest.fn(() => {
    return RemoteDataState.Loading
  }),
}))

const getMockAppStateWTask = () => {
  const result = getMockAppState()

  return {
    ...result,
  }
}

const mockGetTasks = (succeed = true) => {
  const headers: any = {}
  const mock: typeof api.getTasks = () => {
    const res: ReturnType<typeof api.getTasks> = Promise.resolve(
      succeed
        ? {
            data: {
              tasks: [sampleTask],
            },
            headers,
            status: 200,
          }
        : {
            data: {message: 'mocked error', code: 'internal error'},
            headers,
            status: 500,
          }
    )
    return res
  }

  jest.mocked(api.getTasks).mockImplementationOnce(mock)
}

const mockPatchTasks = (succeed = true) => {
  const headers: any = {}

  const mock: typeof api.patchTask = () => {
    const res: ReturnType<typeof api.patchTask> = Promise.resolve(
      succeed
        ? {
            data: {...sampleTask, status: 'active'},
            headers,
            status: 200,
          }
        : {
            data: {message: 'mocked error', code: 'internal error'},
            headers,
            status: 500,
          }
    )
    return res
  }
  jest.mocked(api.patchTask).mockImplementationOnce(mock)
}

describe('Tasks.Actions.Thunks', () => {
  it('calls getTasks', async () => {
    await mockGetTasks()

    const dispatch: any = jest.fn()

    const getState: any = jest.fn(getMockAppStateWTask)

    await thunks.getTasks()(dispatch, getState)

    expect(dispatch.mock.calls.length).toBe(1)

    expect(
      dispatch.mock.calls[0][0].schema.entities.tasks[sampleTask.id]
    ).toEqual(sampleTask)
  })

  it('calls updateTaskStatus', async () => {
    mockPatchTasks()

    const dispatch: any = jest.fn()

    await thunks.updateTaskStatus({...sampleTask, status: 'active'})(dispatch)

    expect(dispatch.mock.calls.length).toEqual(3)
    expect(dispatch.mock.calls[0][0].type).toBe('EDIT_TASK')
    expect(
      dispatch.mock.calls[0][0].schema.entities.tasks[sampleTask.id]
    ).toEqual({...sampleTask, status: 'active'})

    expect(dispatch.mock.calls[1][0].type).toBe('SET_CURRENT_TASK')
    expect(
      dispatch.mock.calls[1][0].schema.entities.tasks[sampleTask.id]
    ).toEqual({...sampleTask, status: 'active'})

    expect(dispatch.mock.calls[2][0].type).toBe('PUBLISH_NOTIFICATION')
    expect(dispatch.mock.calls[2][0].payload.notification).toEqual(
      taskUpdateSuccess(sampleTask.name)
    )
  })
})
