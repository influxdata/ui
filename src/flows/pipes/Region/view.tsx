import {FC, useContext, useEffect, useState} from 'react'

import {PipeProp} from 'src/types/flows'
import {PipeContext} from 'src/flows/context/pipe'

const REGIONS = [
  { label: 'US West (Oregon)', group: 'Amazon Web Services', value: 'https://us-west-2-1.aws.cloud2.influxdata.com' },
  { label: 'US East (Virginia)', group: 'Amazon Web Services', value: 'https://us-east-1-1.aws.cloud2.influxdata.com' },
  { label: 'Europe West (Frankfurt)', group: 'Amazon Web Services', value: 'https://eu-central-1-1.aws.cloud2.influxdata.com' },
  { label: 'US Central (Iowa)', group: 'Google Cloud Platform', value: 'https://us-central1-1.gcp.cloud2.influxdata.com' },
  { label: 'Europe West (Belgium)', group: 'Google Cloud Platform', value: 'https://europe-west1-1.gcp.cloud2.influxdata.com' },
  { label: 'US East (Virginia)', group: 'Microsoft Azure', value: 'https://eastus-1.azure.cloud2.influxdata.com' },
  { label: 'Europe West (Amsterdam)', group: 'Microsoft Azure', value: 'https://westeurope-1.azure.cloud2.influxdata.com' },
  { label: 'Tools Cluster', group: 'development', flag: 'local-dev', value: 'https://influxdb.aws.influxdata.io'},
  { label: 'Local Kind Cluster', group: 'development', flag: 'local-dev', value: 'https://twodotoh.a.influxcloud.dev.local'},
  { label: 'Self Hosted', value: 'self-hosted' }
]

const Source: FC<PipeProp> = ({Context}) => {
  const { data, update } = useContext(PipeContext)
  const [ error, setError ] = useState<boolean>(false)
  const flags = useSelector(activeFlags)

  const updater = (option) => {
    if (option.value === 'self-hosted') {
      update({
        source: 'custom',
        region: 'https://localhost:8086'
      })
    } else {
      update({
        source: 'static',
        region: option.value
      })
    }
  }

  const [options, selected] = useMemo(() => {
    const hashed = JSON.parse(JSON.stringify(REGIONS)).reduce((acc, curr) => {
      if (curr.flag && !flags[curr.flag]) {
        return acc
      }

      if (curr.value === data.region) {
        acc.selected = curr
      }

      if (!curr.group) {
        acc['no-group'].push(curr)
        return acc
      }

      if (!acc[curr.group]) {
        acc[curr.group] = {
          label: curr.group,
          options: []
        }
      }

      acc[curr.group].options.push(curr)
      delete curr.group
      return acc
    }, { 'no-group': [] })

    const options = Object.entries(hashed)
    .reduce((acc, [k, v]) => {
      if (k === 'selected') {
        return acc
      }

      if (k === 'no-group') {
        return acc.concat(v)
      }

      acc.push(v)
      return acc
    }, [])

    if (data.source === 'custom') {
      return [options, REGIONS[REGIONS.length - 1]]
    }

    if (hashed.selected) {
      return [options, hashed.selected]
    }

    update({
      source: 'static',
      region: REGIONS[2].value
    })

    selected = REGIONS[2]
    data.source = 'static'
    data.region = REGIONS[2].value

    return [options, REGIONS[2]]
  }, [data.source, data.region, flags])

  useEffect(() => {
    if (!data.region || !data.token) {
      return
    }

    fetch(`${data.region}/api/v2/orgs`, {
      'headers': {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'Authorization': `Token ${data.token}`
      },
      'body': null,
      'method': 'GET',
      'mode': 'cors',
    }).then((resp) => {
      if (resp.status !== 200) {
        setError(true)
        return
      }

      if (error) {
        setError(false)
      }

      resp.json().then((json) => {
        if (!(json.orgs || []).length) {
          return
        }

        update({
          org: json.orgs[0].id
        })
      })
    })
  }, [data.region, data.token])

  return (
    <Context>
      <div className={style.main}>
        <div className={style.region}>
          <Select
            value={selected}
            options={options}
            onChange={updater}
            theme={theme => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: '#b342da',
                primary25: '#eed4f7',
                primary50: '#e6bef3',
              }
            })}
          />
          <label className={style.label}>region</label>
        </div>
        <div className={style.url}>
          <input placeholder="data source url"
            value={data.region}
            onChange={ evt => update({ region: evt.target.value }) }
            disabled={data.source === 'static'} />
          <label>url</label>
        </div>
        <div className={style.token}>
          <input placeholder="authorization token"
            value={data.token}
            onChange={ evt => update({ token: evt.target.value }) } />
          <label>token</label>
        </div>
      </div>
      { !!error && (
        <div className={style.error}>could not validate token against region</div>
      )}
    </Context>
  )
}

export default Source
