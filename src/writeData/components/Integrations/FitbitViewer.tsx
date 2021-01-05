// Libraries
import React, {useEffect, FC, useState} from 'react'

// Components
import {Page} from '@influxdata/clockface'
import {get} from 'lodash'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {Plot, newTable} from '@influxdata/giraffe'
import {AppState} from 'src/types'
import {connect} from 'react-redux'

const resources = [
  {path: 'activities/calories', key: 'activities-calories'},
  {path: 'activities/caloriesBMR', key: 'activities-caloriesBMR'},
  {path: 'activities/steps', key: 'activities-steps'},
  {path: 'activities/distance', key: 'activities-distance'},
  {path: 'activities/minutesSedentary', key: 'activities-minutesSedentary'},
]

const getData = async (resourceInfo, accessToken: string) => {
  const URL = `https://api.fitbit.com/1/user/-/${resourceInfo.path}/date/today/1m.json`

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Bearer ${accessToken}`,
  }
  const resp = await fetch(URL, {method: 'GET', headers})
  const respBody = await resp.json()
  console.log(respBody)
  return get(respBody, resourceInfo.key, [])
}

interface StateProps {
  accessToken: string
}

interface StepLog {
  dateTime: string
  value: number
}

interface State {
  stepsData: StepLog[]
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

const FitbitViewer: FC<StateProps> = ({accessToken}) => {
  const [caloriesData, setCaloriesData] = useState([])
  const [caloriesBMRData, setCaloriesBMRData] = useState([])
  const [stepsData, setStepsData] = useState([])
  const [distanceData, setDistanceData] = useState([])
  const [sedentaryData, setSedentaryData] = useState([])

  const lineLayer = {
    type: 'line',
    x: '_time',
    y: '_value',
  }

  const stepsConfig = {
    table: buildTable(stepsData),
    layers: [lineLayer],
  }

  const distanceConfig = {
    table: buildTable(distanceData),
    layers: [lineLayer],
  }

  const caloriesConfig = {
    table: buildTable(caloriesData),
    layers: [lineLayer],
  }

  const caloriesBMRConfig = {
    table: buildTable(caloriesBMRData),
    layers: [lineLayer],
  }

  const sedentaryConfig = {
    table: buildTable(sedentaryData),
    layers: [lineLayer],
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await Promise.all(
        resources.map(r => getData(r, accessToken))
      )
      const [calories, caloriesBMR, steps, distance, sedentary] = data
      setCaloriesData(calories)
      setCaloriesBMRData(caloriesBMR)
      setStepsData(steps)
      setDistanceData(distance)
      setSedentaryData(sedentary)
    }
    fetchData()
  }, [])

  const style = {height: '300px', width: '500px', paddingBottom: '32px'}

  return (
    <Page titleTag={pageTitleSuffixer(['Fitbit', 'Load Data'])}>
      <Page.Header fullWidth={false}>
        <Page.Title title="Fitbit" />
      </Page.Header>
      <Page.Contents fullWidth={false} scrollable={true}>
        <div style={style}>
          <h2>Daily Steps past 30 days</h2>
          <Plot config={stepsConfig} style={style} />
        </div>
        <div style={style}>
          <h2>Daily Distance past 30 days</h2>
          <Plot config={distanceConfig} style={style} />
        </div>
        <div style={style}>
          <h2>Daily Calories past 30 days</h2>
          <Plot config={caloriesConfig} style={style} />
        </div>
        <div style={style}>
          <h2>Daily Calories BMR past 30 days</h2>
          <Plot config={caloriesBMRConfig} style={style} />
        </div>
        <div style={style}>
          <h2>Daily Sedentary past 30 days</h2>
          <Plot config={sedentaryConfig} style={style} />
        </div>
      </Page.Contents>
    </Page>
  )
}
const mstp = (state: AppState) => {
  const accessToken = get(state, 'integrations.fitbit', '')

  return {accessToken}
}

export default connect<StateProps>(mstp)(FitbitViewer)
