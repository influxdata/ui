// Libraries
import React, {FC} from 'react'

// Components
import {Grid, Page} from '@influxdata/clockface'
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import FitbitGraph from './FitbitGraph'

const resources = [
  {
    path: 'activities/calories',
    key: 'activities-calories',
    title: 'Daily Calories Past 30 days',
  },
  {
    path: 'activities/caloriesBMR',
    key: 'activities-caloriesBMR',
    title: 'Daily Calories BMR Past 30 days',
  },
  {
    path: 'activities/steps',
    key: 'activities-steps',
    title: 'Daily Steps Past 30 days',
  },
  {
    path: 'activities/distance',
    key: 'activities-distance',
    title: 'Daily Distance Past 30 days',
  },
  {
    path: 'activities/minutesSedentary',
    key: 'activities-minutesSedentary',
    title: 'Daily Minutes Past 30 days',
  },
]

interface StateProps {
  accessToken: string
}

const FitbitViewer: FC<StateProps> = () => {
  return (
    <Page titleTag={pageTitleSuffixer(['Fitbit', 'Load Data'])}>
      <Page.Header fullWidth={false}>
        <Page.Title title="Fitbit" />
      </Page.Header>
      <Page.Contents fullWidth={false} scrollable={true}>
        <Grid>
          {resources.map(resource => (
            <FitbitGraph resource={resource} key={resource.key} />
          ))}
        </Grid>
      </Page.Contents>
    </Page>
  )
}

export default FitbitViewer
