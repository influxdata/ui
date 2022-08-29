import {ResourceType} from 'src/types/resources'
import {
  getDashboardsCellsView,
  patchDashboardsCellsView,
  postDashboardsCell,
} from 'src/client/generatedRoutes'

export default function script(register) {
  register({
    type: ResourceType.Dashboards,
    init: (...args: string[]) => {
      const dashboard = args[0]
      const cell = args[2]

      if (!cell) {
        return Promise.resolve({
          type: ResourceType.Dashboards,
          flux: '',
          data: {
            name: 'Name this Cell',
            dashboardID: dashboard,
          },
          visual: {
            type: 'simple-table',
            showAll: false,
          },
        })
      }

      return getDashboardsCellsView({
        dashboardID: dashboard,
        cellID: cell,
      }).then(resp => {
        if (resp.status === 200 && resp.data.properties.type !== 'markdown') {
          return {
            type: ResourceType.Dashboards,
            flux: resp.data.properties.queries[0].text,
            data: {
              dashboardID: dashboard,
              ...resp.data,
            },
            visual: {
              ...resp.data.properties,
            },
          }
        }
      })
    },
    persist: resource => {
      const _data = JSON.parse(JSON.stringify(resource.data))
      const {dashboardID, id} = _data
      delete _data.dashboardID
      delete _data.id

      if (id) {
        _data.properties = resource.visual
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

        return patchDashboardsCellsView({
          dashboardID,
          cellID: id,
          data: _data,
        }).then(() => ({
          ...resource,
          data: {
            id,
            dashboardID,
            ..._data,
          },
          visual: _data.properties,
        }))
      }

      return postDashboardsCell({
        dashboardID,
        data: {
          w: 4,
          h: 4,
          x: 0,
          y: 0,
        },
      }).then(resp => {
        if (resp.status !== 201) {
          return
        }
        _data.id = resp.data.id

        _data.properties = resource.visual
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

        return patchDashboardsCellsView({
          dashboardID,
          cellID: _data.id,
          data: _data,
        }).then(() => ({
          ...resource,
          data: _data,
        }))
      })
    },
  })
}
