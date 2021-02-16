// Libraries
import React, {FC, useState, useCallback, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'

// Components
import {Page, IconFont, Sort} from '@influxdata/clockface'
import TaskRunsList from 'src/tasks/components/TaskRunsList'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'

// Types
import {AppState, Run} from 'src/types'
import {
  SpinnerContainer,
  TechnoSpinner,
  Button,
  ComponentColor,
} from '@influxdata/clockface'

// Actions
import {getRuns, runTask} from 'src/tasks/actions/thunks'
import {getOrg} from 'src/organizations/selectors'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Types
import {SortTypes} from 'src/shared/utils/sort'

type SortKey = keyof Run

const TaskRunsPage: FC = () => {
  const [sortKey, setSortKey] = useState('scheduledFor')
  const [sortDirection, setSortDirection] = useState(Sort.Descending)
  const [sortType, setSortType] = useState(SortTypes.Date)

  const {id} = useParams()
  const history = useHistory()

  const dispatch = useDispatch()
  const {runs, runStatus, currentTask} = useSelector(
    (state: AppState) => state.resources.tasks
  )
  const org = useSelector(getOrg)

  const title = currentTask ? `${currentTask.name} - Runs` : 'Runs'

  useEffect(() => {
    dispatch(getRuns(id))
  }, [id, dispatch])

  const handleClickColumn = useCallback(
    (nextSort: Sort, sortKey: SortKey) => {
      setSortKey(sortKey)
      setSortDirection(nextSort)

      if (sortKey !== 'status') {
        setSortType(SortTypes.Date)
      } else {
        setSortType(SortTypes.String)
      }
    },
    [setSortKey, setSortDirection, setSortType]
  )

  const handleEditTask = useCallback(() => {
    history.push(`/orgs/${org.id}/tasks/${currentTask.id}/edit`)
  }, [history, org?.id, currentTask?.id])

  const handleRunTask = useCallback(() => {
    dispatch(runTask(id))
    dispatch(getRuns(id))
  }, [dispatch, id])

  return (
    <SpinnerContainer loading={runStatus} spinnerComponent={<TechnoSpinner />}>
      <Page titleTag={pageTitleSuffixer(['Task Runs'])}>
        <Page.Header fullWidth={false}>
          <Page.Title title={title} />
          <RateLimitAlert />
        </Page.Header>
        <Page.ControlBar fullWidth={false}>
          <Page.ControlBarLeft>
            <Button
              onClick={handleEditTask}
              text="Edit Task"
              color={ComponentColor.Primary}
            />
          </Page.ControlBarLeft>
          <Page.ControlBarRight>
            <Button
              onClick={handleRunTask}
              text="Run Task"
              icon={IconFont.Play}
            />
          </Page.ControlBarRight>
        </Page.ControlBar>
        <Page.Contents fullWidth={false} scrollable={true}>
          <TaskRunsList
            taskID={id}
            runs={runs}
            sortKey={sortKey}
            sortDirection={sortDirection}
            sortType={sortType}
            onClickColumn={handleClickColumn}
          />
        </Page.Contents>
      </Page>
    </SpinnerContainer>
  )
}

export default TaskRunsPage
