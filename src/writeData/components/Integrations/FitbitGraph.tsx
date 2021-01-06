// Libraries
import React, {useEffect, FC, useState} from 'react'

// Components
import {get} from 'lodash'
import {Plot, newTable} from '@influxdata/giraffe'
import {AppState} from 'src/types'
import {connect} from 'react-redux'
import {Columns, Grid} from '@influxdata/clockface'

const getData = async (resourceInfo, accessToken: string) => {
  const URL = `https://api.fitbit.com/1/user/-/${resourceInfo.path}/date/today/1m.json`

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Bearer ${accessToken}`,
  }
  const resp = await fetch(URL, {method: 'GET', headers})
  const respBody = await resp.json()
  return get(respBody, resourceInfo.key, [])
}

interface StateProps {
  accessToken: string
}

interface Resource {
  path: string
  key: string
  title: string
}

interface Props extends StateProps {
  resource: Resource
}

const toDate = stringDate => {
  return Date.parse(stringDate)
}

const buildTable = data => {
  const timeValues = data.map(({dateTime}) => toDate(dateTime))
  const values = data.map(({value}) => parseInt(value))
  const table = newTable(data.length)
    .addColumn('_time', 'dateTime:RFC3339', 'time', timeValues)
    .addColumn('_value', 'double', 'number', values)

  return table
}

const FitbitGraph: FC<Props> = ({accessToken, resource}) => {
  const [data, setData] = useState([])

  const lineLayer = {
    type: 'line',
    x: '_time',
    y: '_value',
  }

  const config = {
    table: buildTable(data),
    layers: [lineLayer],
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData(resource, accessToken)
      setData(data)
    }
    fetchData()
  }, [accessToken])

  const style = {height: '300px', padding: '32px 0'}

  return (
    <Grid.Column widthMD={Columns.Four}>
      <div style={style}>
        <h2>{resource.title}</h2>
        <Plot config={config} style={style} />
      </div>
    </Grid.Column>
  )
}
const mstp = (state: AppState) => {
  const accessToken = get(state, 'integrations.fitbit', '')

  return {accessToken}
}

export default connect<StateProps>(mstp)(FitbitGraph)
