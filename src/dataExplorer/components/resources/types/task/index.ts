import {ResourceTypes, ResourceRegistration} from '../../'
import editor from './editor'

export default function task(register: (_: ResourceRegistration) => any) {
  register({
    type: ResourceTypes.Task,
    editor,
    init: id => {
      if (!id) {
        return Promise.resolve({
          type: ResourceTypes.Task,
          flux: '',
          data: {},
        })
      }

      return fetch(`/api/v2/tasks/${id}`)
        .then(resp => resp.json())
        .then(resp => {
          return {
            type: ResourceTypes.Task,
            flux: resp.flux,
            data: resp,
          }
        })
    },
    persist: resource => {
      if (resource.data.id) {
        return fetch(`/api/v2/tasks/${resource.data.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: resource.data.status,
            flux: resource.flux,
            name: resource.data.name,
            description: resource.data.description,

            every: resource.data.every,
            cron: resource.data.cron,
            offset: resource.data.offset,

            scriptID: resource.data.scriptID,
            scriptParameters: resource.data.scriptParameters,
          }),
        }).then(() => resource)
      }

      return fetch(`/api/v2/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'active',
          flux: resource.flux,
          name: resource.data.name,
          description: resource.data.description,

          every: resource.data.every,
          cron: resource.data.cron,
          offset: resource.data.offset,

          scriptID: resource.data.scriptID,
          scriptParameters: resource.data.scriptParameters,
        }),
      })
        .then(resp => resp.json())
        .then(resp => {
          resource.data.id = resp.id
          return resource
        })
    },
  })
}
