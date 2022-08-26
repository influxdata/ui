import {ResourceType} from 'src/types/resources'
import {
  getDashboardsCellsView,
  patchDashboardsCellsView,
  postDashboardsCell,
} from 'src/client/generatedRoutes'
import editor from './editor'

export default function script(register) {
  register({
    type: ResourceType.Dashboards,
    editor,
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
          data: _data,
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
