import {ResourceType} from 'src/types/resources'
import {ResourceRegistration} from '../../'
import {
  getTask,
  postTask,
  patchTask,
  TaskStatusType,
} from 'src/client/generatedRoutes'
import editor from './editor'

export default function task(register: (_: ResourceRegistration) => any) {
  register({
    type: ResourceType.Tasks,
    editor,
    init: id => {
      if (!id) {
        return Promise.resolve({
          type: ResourceType.Tasks,
          flux: '',
          data: {
            name: 'Untitled Task',
            every: '1h',
          },
        })
      }

      return getTask({
        taskID: id,
      }).then(resp => {
        if (resp.status === 200) {
          return {
            type: ResourceType.Tasks,
            flux: resp.data.flux,
            data: resp.data,
          }
        }
      })
    },
    persist: resource => {
      if (resource.data.id) {
        return patchTask({
          taskID: resource.data.id,
          data: {
            status: resource.data.status,
            flux: resource.flux,
            name: resource.data.name,
            description: resource.data.description,

            every: resource.data.every,
            cron: resource.data.cron,
            offset: resource.data.offset,
          },
        }).then(() => resource)
      }

      const createData = {
        status: 'active' as TaskStatusType,
        flux: resource.flux,
        name: resource.data.name,
        description: resource.data.description,

        every: resource.data.every,
        cron: resource.data.cron,
        offset: resource.data.offset,
      }

      return postTask({
        data: createData,
      }).then(resp => {
        if (resp.status !== 201) {
          return resource
        }

        resource.data.id = resp.data.id
        return resource
      })
    },
  })
}
