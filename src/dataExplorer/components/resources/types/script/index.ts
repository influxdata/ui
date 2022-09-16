import {ResourceType} from 'src/types/resources'
import editor from './editor'
import {CLOUD} from 'src/shared/constants'
import {DEFAULT_EDITOR_TEXT} from 'src/dataExplorer/context/persistance'

const {getScript, patchScript, postScript} = CLOUD
  ? require('src/client/scriptsRoutes')
  : {
      getScript: false,
      patchScript: false,
      postScript: false,
    }

export default function script(register) {
  register({
    type: ResourceType.Scripts,
    editor,
    init: id => {
      if (!id || !CLOUD) {
        return Promise.resolve({
          type: ResourceType.Scripts,
          flux: DEFAULT_EDITOR_TEXT,
          data: {},
        })
      }

      return getScript({
        scriptID: id,
      }).then(resp => {
        if (resp.status === 200) {
          return {
            type: ResourceType.Scripts,
            flux: resp.data.script,
            data: resp.data,
          }
        }

        return {
          type: ResourceType.Scripts,
          flux: DEFAULT_EDITOR_TEXT,
          data: {},
        }
      })
    },
    persist: resource => {
      const data = JSON.parse(JSON.stringify(resource.data))
      data.script = resource.flux

      if (!CLOUD) {
        return resource
      }

      if (data.id) {
        return patchScript({
          scriptID: data.id,
          data: {
            name: data.name,
            description: data.description,
            script: data.script,
          },
        }).then(() => {
          return resource
        })
      }

      return postScript({
        data: {
          name: data.name,
          description: data.description,
          script: data.script,
          language: 'flux',
        },
      }).then(resp => {
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
