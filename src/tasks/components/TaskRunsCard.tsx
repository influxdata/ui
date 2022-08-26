// Libraries
import React, {FC, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  SlideToggle,
  ComponentSize,
  ResourceCard,
  InputLabel,
  FlexBox,
  AlignItems,
  FlexDirection,
  JustifyContent,
} from '@influxdata/clockface'

// Actions
import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'
import {runTask, getRuns, updateTaskStatus} from 'src/tasks/actions/thunks'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getMembers} from 'src/members/actions/thunks'
import {getOrg} from 'src/organizations/selectors'
import {TaskPage, setCurrentTasksPage} from 'src/tasks/actions/creators'

// Types
import {ComponentColor, Button} from '@influxdata/clockface'
import {Task, AppState} from 'src/types'
import {DEFAULT_PROJECT_NAME} from 'src/flows'

// DateTime
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'

interface Props {
  task: Task
  isTaskEditable: boolean
}

const TaskRunsCard: FC<Props> = ({task, isTaskEditable}) => {
  const dispatch = useDispatch()
  const members = useSelector((state: AppState) => state.resources.members.byID)
  const org = useSelector(getOrg)
  const history = useHistory()
  const [route, setRoute] = useState(`/orgs/${org?.id}/tasks/${task?.id}/edit`)
  const changeToggle = () => {
    dispatch(
      updateTaskStatus({
        ...task,
        status: task.status === 'active' ? 'inactive' : 'active',
      })
    )
  }
  const ownerName = members[task?.ownerID]?.name
    ? members[task.ownerID].name
    : ''
  const handleRunTask = async () => {
    try {
      await dispatch(runTask(task.id))
      await dispatch(getRuns(task.id))
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditTask = () => {
    if (!isFlagEnabled('createWithFlows')) {
      dispatch(setCurrentTasksPage(TaskPage.TaskRunsPage))
    }

    history.push(route)
  }

  useEffect(() => {
    dispatch(getMembers())
  }, [])

  useEffect(() => {
    if (isFlagEnabled('createWithDE')) {
      setRoute(`/orgs/${org.id}/data-explorer/from/task/${task.id}`)
      return
    }

    if (!isFlagEnabled('createWithFlows')) {
      return
    }

    if (!task) {
      return
    }

    fetch(`/api/v2private/notebooks/resources?type=tasks&resource=${task.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
      },
    })
      .then(resp => {
        return resp.json()
      })
      .then(resp => {
        if (resp.length) {
          setRoute(
            `/orgs/${org.id}/${DEFAULT_PROJECT_NAME.toLowerCase()}/${
              resp[0].notebookID
            }`
          )
        } else {
          setRoute(`/notebook/from/task/${task.id}`)
        }
      })
      .catch(() => {
        setRoute(`/notebook/from/task/${task.id}`)
      })
  }, [isFlagEnabled('createWithFlows'), org.id, task])

  if (!task) {
    return null
  }

  return (
    <ResourceCard
      testID="task-runs-task-card"
      disabled={task.status !== 'active'}
      alignItems={AlignItems.Center}
      margin={ComponentSize.Large}
      direction={FlexDirection.Row}
      justifyContent={JustifyContent.SpaceBetween}
    >
      <FlexBox
        alignItems={AlignItems.FlexStart}
        direction={FlexDirection.Column}
        margin={ComponentSize.Large}
      >
        <ResourceCard.Name name={task.name} testID="task-card--name" />
        <ResourceCard.Meta>
          <FlexBox margin={ComponentSize.Small}>
            <SlideToggle
              active={task.status === 'active'}
              size={ComponentSize.ExtraSmall}
              onChange={changeToggle}
              testID="task-card--slide-toggle"
              disabled={!isTaskEditable}
            />
            <InputLabel active={task.status === 'active'}>
              {task.status === 'active' ? 'Active' : 'Inactive'}
            </InputLabel>
          </FlexBox>
          <>
            Created at:{' '}
            <FormattedDateTime
              format={DEFAULT_TIME_FORMAT}
              date={new Date(task.createdAt)}
            />
          </>
          <>Created by: {ownerName}</>
          <>Last Used: {relativeTimestampFormatter(task.latestCompleted)}</>
          <>{task.org}</>
        </ResourceCard.Meta>
      </FlexBox>

      {isTaskEditable && (
        <FlexBox margin={ComponentSize.Medium} direction={FlexDirection.Row}>
          <Button onClick={handleRunTask} text="Run Task" />
          <Button
            onClick={handleEditTask}
            text="Edit Task"
            color={ComponentColor.Primary}
          />
        </FlexBox>
      )}
    </ResourceCard>
  )
}

export {TaskRunsCard}
