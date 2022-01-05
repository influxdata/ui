import {pageTitleSuffixer} from '../../shared/utils/pageTitles'
import {Page} from '@influxdata/clockface'
import React from 'react'
import {useSelector} from 'react-redux'
import {getOrg} from '../../organizations/selectors'
import HealthTabbedPage from '../HealthTabbedPage'
import TasksHealthTab from './TasksHealthTab'

const TasksHealthIndex = () => {
  const org = useSelector(getOrg)

  return (
    <Page titleTag={pageTitleSuffixer(['Tasks Health'])}>
      <Page.Header fullWidth={true} testID="health-check-page--header">
        <Page.Title title="Dependency checks" />
      </Page.Header>
      <HealthTabbedPage activeTab="tasks" orgID={org.id}>
        <TasksHealthTab />
      </HealthTabbedPage>
    </Page>
  )
}

export default TasksHealthIndex
