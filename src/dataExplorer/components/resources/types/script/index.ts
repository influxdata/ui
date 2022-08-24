import {ResourceTypes} from '../..'
import editor from './editor'

export default function script(register) {
  register({
    type: ResourceTypes.Script,
    editor,
    init: id => {
      if (!id) {
        return Promise.resolve({
          type: ResourceTypes.Script,
          flux: '',
          data: {
            name: `Untitled Script: ${new Date().toISOString()}`,
            description: 'awaiting modal from design',
          },
        })
      }
    },
    persist: resource => {
      const data = JSON.parse(JSON.stringify(resource.data))
      data.script = resource.flux

      if (data.id) {
        return fetch(`/api/v2/scripts/${data.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            script: data.script,
          }),
        }).then(() => {
          return resource
        })
      }

      return fetch(`/api/v2/scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          script: data.script,
          language: 'flux',
        }),
      })
        .then(resp => resp.json())
        .then(resp => {
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
