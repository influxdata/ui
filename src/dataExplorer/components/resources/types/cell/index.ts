import {ResourceTypes} from '../..'
import editor from './editor'

export default function script(register) {
  register({
    type: ResourceTypes.Dashboard,
    editor,
    init: (...args: string[]) => {
      const dashboard = args[0]
      const cell = args[2]

      if (!cell) {
        return Promise.resolve({
          type: ResourceTypes.Dashboard,
          flux: '',
          data: {
            name: 'Name this Cell',
            dashboardID: dashboard,
          },
        })
      }

      return fetch(`/api/v2/dashboards/${dashboard}/cells/${cell}/view`)
        .then(resp => resp.json())
        .then(resp => {
          return {
            type: ResourceTypes.Dashboard,
            flux: resp.properties.queries[0].text,
            data: {
              dashboardID: dashboard,
              ...resp,
            },
          }
        })
    },
    persist: resource => {
      const _data = JSON.parse(JSON.stringify(resource.data))
      const {dashboardID, id} = _data
      delete _data.dashboardID
      delete _data.id

      if (id) {
        _data.properties.queries = [
          {
            text: resource.flux,
            editMode: 'advanced',
            name: '',
            builderConfig: {
              buckets: [],
              functions: [],
              tags: [],
              aggregateWindow: {
                period: '',
                fillValues: false,
              },
            },
          },
        ]
        return fetch(`/api/v2/dashboards/${dashboardID}/cells/${id}/view`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(_data),
        }).then(() => ({
          ...resource,
          data: _data,
        }))
      }

      return fetch(`/api/v2/dashboards/${dashboardID}/cells`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          w: 4,
          h: 4,
          x: 0,
          y: 0,
        }),
      })
        .then(resp => resp.json())
        .then(resp => {
          _data.id = resp.id

          // TODO: pass the view in here somehow
          _data.properties = {
            type: 'simple-table',
            showAll: false,
            shape: 'chronograf-v2',
          }
          _data.properties.queries = [
            {
              text: resource.flux,
              editMode: 'advanced',
              name: '',
              builderConfig: {
                buckets: [],
                functions: [],
                tags: [],
                aggregateWindow: {
                  period: '',
                  fillValues: false,
                },
              },
            },
          ]

          return fetch(
            `/api/v2/dashboards/${dashboardID}/cells/${resp.id}/view`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(_data),
            }
          ).then(() => ({
            ...resource,
            data: _data,
          }))
        })
    },
  })
}
