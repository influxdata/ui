import {ResourceTypes} from '../..'
import editor from './editor'
import {getStore} from 'src/store/configureStore'
import {getOrg} from 'src/organizations/selectors'

export default function variable(register) {
  register({
    type: ResourceTypes.Variable,
    editor,
    init: id => {
      if (!id) {
        return Promise.resolve({
          type: ResourceTypes.Variable,
          flux: '',
          data: {
            name: 'Name this Variable',
            arguments: {
              type: 'query',
              values: {
                language: 'flux',
                query: '',
              },
            },
          },
        })
      }

      return fetch(`/api/v2/variables/${id}`)
        .then(resp => resp.json())
        .then(resp => {
          if (resp.arguments.type === 'map') {
            throw new Error('map variables arent implemented yet')
          }
          if (resp.arguments.type === 'constant') {
            return {
              type: ResourceTypes.Variable,
              flux:
                'import "array"\n\narray.from(rows: [\n' +
                resp.arguments.values
                  .map(
                    v => `\t{_value: ${isNaN(parseFloat(v)) ? `"${v}"` : v}}`
                  )
                  .join(',\n') +
                '\n])',
              data: resp,
            }
          }
          return {
            type: ResourceTypes.Variable,
            flux: resp.arguments.values.query,
            data: resp,
          }
        })
    },
    persist: resource => {
      const data = JSON.parse(JSON.stringify(resource.data))

      const org = getOrg(getStore().getState())
      data.orgID = org.id

      data.arguments = {
        type: 'query',
        values: {
          language: 'flux',
          query: resource.flux,
        },
      }

      if (!data.id) {
        return fetch(`/api/v2/variables`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
          .then(resp => resp.json())
          .then(resp => {
            resource.data.id = resp.id
            return resource
          })
      }

      return fetch(`/api/v2/variables/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(() => resource)
    },
  })
}
