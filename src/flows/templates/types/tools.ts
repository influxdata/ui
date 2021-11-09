export default register =>
  register({
    type: 'tools',
    init: (id, token) => {
      const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
        Authorization: `Token ${token}`,
      }

      return fetch(
        `https://influxdb.aws.influxdata.io/api/v2private/notebooks/${id}`,
        {
          method: 'GET',
          headers,
        }
      )
        .then(res => res.json())
        .then(res => {
          delete res.id
          delete res.orgID
          res.spec.pipes.unshift({
            type: 'region',
            region: 'https://influxdb.aws.influxdata.io',
            token,
            source: 'custom',
            visible: true,
            title: 'Tools Cluster',
          })

          return res
        })
    },
  })
