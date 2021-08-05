import React, {FC, useContext, useEffect, useState, useMemo} from 'react'
import {useSelector} from 'react-redux'

import {activeFlags} from 'src/shared/selectors/flags'
import {PipeProp} from 'src/types/flows'
import {PipeContext} from 'src/flows/context/pipe'

import {
  Dropdown,
  ComponentColor,
  ComponentSize,
  Form,
  FlexBox,
  Input,
  InputType,
  ComponentStatus,
} from '@influxdata/clockface'

import './style.scss'

const REGIONS = [
  {
    label: 'US West (Oregon)',
    group: 'Amazon Web Services',
    value: 'https://us-west-2-1.aws.cloud2.influxdata.com',
  },
  {
    label: 'US East (Virginia)',
    group: 'Amazon Web Services',
    value: 'https://us-east-1-1.aws.cloud2.influxdata.com',
  },
  {
    label: 'Europe West (Frankfurt)',
    group: 'Amazon Web Services',
    value: 'https://eu-central-1-1.aws.cloud2.influxdata.com',
  },
  {
    label: 'US Central (Iowa)',
    group: 'Google Cloud Platform',
    value: 'https://us-central1-1.gcp.cloud2.influxdata.com',
  },
  {
    label: 'Europe West (Belgium)',
    group: 'Google Cloud Platform',
    value: 'https://europe-west1-1.gcp.cloud2.influxdata.com',
  },
  {
    label: 'US East (Virginia)',
    group: 'Microsoft Azure',
    value: 'https://eastus-1.azure.cloud2.influxdata.com',
  },
  {
    label: 'Europe West (Amsterdam)',
    group: 'Microsoft Azure',
    value: 'https://westeurope-1.azure.cloud2.influxdata.com',
  },
  {
    label: 'Tools Cluster',
    group: 'Development',
    flag: 'local-dev',
    value: 'https://influxdb.aws.influxdata.io',
  },
  {
    label: 'Local Kind Cluster',
    group: 'Development',
    flag: 'local-dev',
    value: 'https://twodotoh.a.influxcloud.dev.local',
  },
  {label: 'Self Hosted', value: 'self-hosted'},
]

const Source: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const [error, setError] = useState<boolean>(false)
  const flags = useSelector(activeFlags)

  const updater = option => {
    if (option.value === 'self-hosted') {
      update({
        source: 'custom',
        region: 'https://localhost:8086',
      })
    } else {
      update({
        source: 'static',
        region: option.value,
      })
    }
  }

  const [options, selected] = useMemo(() => {
    const hashed = JSON.parse(JSON.stringify(REGIONS)).reduce(
      (acc, curr) => {
        if (curr.flag && !flags[curr.flag]) {
          return acc
        }

        if (curr.value === window.location.origin) {
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
            options: [],
          }
        }

        acc[curr.group].options.push(curr)
        delete curr.group
        return acc
      },
      {'no-group': []}
    )

    const options = Object.entries(hashed).reduce((acc, [k, v]) => {
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
      region: REGIONS[2].value,
    })

    data.source = 'static'
    data.region = REGIONS[2].value

    return [options, REGIONS[2]]
  }, [data.source, data.region, flags])

  useEffect(() => {
    if (!data.region || !data.token) {
      return
    }

    fetch(`${data.region}/api/v2/orgs`, {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        Authorization: `Token ${data.token}`,
      },
      body: null,
      method: 'GET',
      mode: 'cors',
    }).then(resp => {
      if (resp.status !== 200) {
        setError(true)
        return
      }

      if (error) {
        setError(false)
      }

      resp.json().then(json => {
        if (!(json.orgs || []).length) {
          return
        }

        update({
          org: json.orgs[0].id,
        })
      })
    })
  }, [data.region, data.token])

  return (
    <Context>
      <FlexBox margin={ComponentSize.Medium}>
        <FlexBox.Child
          basis={234}
          grow={0}
          shrink={0}
          className="flow-panel-region--header"
        >
          <h5>Query another InfluxDB instance</h5>
          <p>All following panels will use this source</p>
        </FlexBox.Child>
        <FlexBox.Child
          grow={0}
          shrink={0}
          basis={250}
          style={{alignSelf: 'start'}}
        >
          <Form.Element label="Region" required={true}>
            <Dropdown
              testID="region-panel--dropdown"
              button={(active, onClick) => (
                <Dropdown.Button
                  active={active}
                  onClick={onClick}
                  color={ComponentColor.Primary}
                  testID="region-panel--dropdown-button"
                >
                  {selected.label}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  {options.reduce((acc, curr) => {
                    if (!curr.options) {
                      acc.push(
                        <Dropdown.Item
                          value={curr.value}
                          key={curr.value}
                          onClick={() => updater(curr)}
                          selected={data.region === curr.value}
                        >
                          {curr.label}
                        </Dropdown.Item>
                      )

                      return acc
                    }

                    acc.push(
                      <Dropdown.Divider key={curr.label} text={curr.label} />
                    )

                    return acc.concat(
                      curr.options.map(_curr => (
                        <Dropdown.Item
                          value={_curr.value}
                          key={curr.value}
                          onClick={() => updater(_curr)}
                          selected={data.region === _curr.value}
                        >
                          {_curr.label}
                        </Dropdown.Item>
                      ))
                    )
                  }, [])}
                </Dropdown.Menu>
              )}
            />
          </Form.Element>
        </FlexBox.Child>
        <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
          <Form.Element label="URL" required={true}>
            <Input
              placeholder="data source url"
              type={InputType.Text}
              value={data.region}
              onChange={evt => update({region: evt.target.value})}
              size={ComponentSize.Medium}
              status={
                data.source === 'static'
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            />
          </Form.Element>
        </FlexBox.Child>
        <FlexBox.Child grow={1} shrink={1} style={{alignSelf: 'start'}}>
          <Form.Element label="Token" required={true}>
            <Input
              placeholder="authorization token"
              type={InputType.Text}
              value={data.token}
              size={ComponentSize.Medium}
              onChange={evt => update({token: evt.target.value})}
            />
          </Form.Element>
        </FlexBox.Child>
      </FlexBox>
      {!!error && (
        <div className="region-panel--eror">
          could not validate token against region
        </div>
      )}
    </Context>
  )
}

export default Source
