import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

export default register =>
  register({
    type: 'dashboard',
    init: id =>
      fetch(`/api/v2/dashboards/${id}`)
        .then(res => res.json())
        .then(res => {
          return Promise.all(
            res.cells.map(c => {
              return fetch(c.links.view)
                .then(res => res.json())
                .then(res => {
                  const queries = res.properties.queries
                  delete res.properties.queries

                  return [
                    {
                      activeQuery: 0,
                      queries,
                      type: 'rawFluxEditor',
                      title: `${res.name} - Query`,
                      visible: true,
                    },
                    {
                      title: res.name,
                      visible: true,
                      type: 'visualization',
                      properties: res.properties,
                      layout: {
                        x: c.x,
                        y: c.y,
                        w: c.w,
                        h: c.h,
                      },
                    },
                  ]
                })
            })
          ).then(pipes => {
            const out = {
              name: res.name,
              spec: {
                readOnly: true,
                range: DEFAULT_TIME_RANGE,
                refresh: AUTOREFRESH_DEFAULT,
                pipes: pipes.reduce((acc, curr) => {
                  return acc.concat(curr)
                }, []),
              },
            }

            return out
          })

          return res
        }),
  })
