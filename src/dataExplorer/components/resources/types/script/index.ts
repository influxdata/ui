import {ResourceType} from 'src/types/resources'
import editor from './editor'
import * as api from 'src/client/scriptsRoutes'

export default function script(register) {
  register({
    type: ResourceType.Scripts,
    editor,
    init: id => {
      if (!id) {
        return Promise.resolve({
          type: ResourceType.Scripts,
          flux: '',
          data: {
            name: `Untitled Script: ${new Date().toISOString()}`,
            description: 'default description',
          },
        })
      }

      return api
        .getScript({
          scriptID: id,
        })
        .then(resp => {
          if (resp.status === 200) {
            return {
              type: ResourceType.Scripts,
              flux: resp.data.script,
              data: resp.data,
            }
          }

          return {
            type: ResourceType.Scripts,
            flux: '',
            data: {
              name: `Untitled Script: ${new Date().toISOString()}`,
              description: 'default description',
            },
          }
        })
    },
    persist: resource => {
      const data = JSON.parse(JSON.stringify(resource.data))
      data.script = resource.flux

      if (data.id) {
        return api
          .patchScript({
            scriptID: data.id,
            data: {
              name: data.name,
              description: data.description,
              script: data.script,
            },
          })
          .then(() => {
            return resource
          })
      }

      return api
        .postScript({
          data: {
            name: data.name,
            description: data.description,
            script: data.script,
            language: 'flux',
          },
        })
        .then(resp => {
          if (resp.status === 201) {
            return {
              ...resource,
              data: {
                ...data,
                id: resp.data.id,
              },
            }
          }

          return resource
        })
    },
  })
}
