import {ResourceType} from 'src/types/resources'
import editor from './editor'
import {getScript, patchScript, postScript} from 'src/client/scriptsRoutes.ts'

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

      return getScript({
        scriptID: id,
      }).then(resp => {
        return {
          type: ResourceType.Scripts,
          flux: resp.script,
          data: resp,
        }
      })
    },
    persist: resource => {
      const data = JSON.parse(JSON.stringify(resource.data))
      data.script = resource.flux

      if (data.id) {
        return patchScript({
          scriptID: data.id,
          description: data.description,
          script: data.script,
        }).then(() => {
          return resource
        })
      }

      return postScript({
        name: data.name,
        description: data.description,
        script: data.script,
        language: 'flux',
      }).then(resp => {
        return {
          ...resource,
          data: {
            ...data,
            id: resp.id,
          },
        }
      })
    },
  })
}
