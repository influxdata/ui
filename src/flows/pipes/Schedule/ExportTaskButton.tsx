// Libraries
import React, {FC, useContext} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import {
  ButtonType,
  ComponentColor,
  ComponentStatus,
  IconFont,
} from '@influxdata/clockface'

import {
  resourceLimitReached,
  taskCreatedSuccess,
  taskNotCreated,
} from 'src/shared/copy/notifications'
import {ASSET_LIMIT_ERROR_STATUS} from 'src/cloud/constants/index'
import {postTask, patchTask} from 'src/client'
import {notify} from 'src/shared/actions/notifications'
import {checkTaskLimits} from 'src/cloud/actions/limits'

// Components
import {Button} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowListContext} from 'src/flows/context/flow.list'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getErrorMessage} from 'src/utils/api'
import {getOrg} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {PROJECT_NAME_PLURAL} from 'src/flows'

interface Props {
  text: string
  type: string
  generate?: () => string
  onCreate?: (task: any) => void
  disabled?: boolean
}

const ExportTaskButton: FC<Props> = ({
  text,
  type,
  generate,
  onCreate,
  disabled,
}) => {
  const {flow} = useContext(FlowContext)
  const {add} = useContext(FlowListContext)
  const {data} = useContext(PipeContext)
  const dispatch = useDispatch()
  const history = useHistory()
  const org = useSelector(getOrg)

  const onClick = () => {
    const query = generate ? generate() : data.query

    event('Export Task Modal Skipped', {from: type})
    let taskid

    // we can soft delete the previously connected task by marking the old one inactive
    if (data?.task?.id) {
      taskid = data.task.id
    } else if ((data?.task ?? []).length) {
      taskid = data.task[0].id
    }

    if (taskid) {
      patchTask({
        taskID: taskid,
        data: {
          status: 'inactive',
        },
      })

      if (isFlagEnabled('createWithFlows')) {
        fetch(
          `/api/v2private/notebooks/${flow.id}/resources?type=tasks&resource=${taskid}`,
          {
            method: 'GET',
          }
        )
          .then(resp => resp.json())
          .then(resp => {
            if (!resp.length) {
              return
            }

            fetch(
              `/api/v2private/notebooks/${flow.id}/resources/${resp[0].id}`,
              {
                method: 'DELETE',
              }
            )
          })
      }
    }

    postTask({data: {orgID: org.id, flux: query}})
      .then(resp => {
        if (resp.status !== 201) {
          throw new Error(resp.data.message)
        }

        if (isFlagEnabled('createWithFlows')) {
          new Promise(resolve => {
            if (flow.id) {
              resolve(flow.id)
              return
            }

            add(flow).then(id => resolve(id))
          })
            .then(id => {
              return fetch(`/api/v2private/notebooks/${id}/resources`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  panel: data.id,
                  resource: resp.data.id,
                  type: 'tasks',
                }),
              }).then(() => {
                return id
              })
            })
            .then(id => {
              dispatch(notify(taskCreatedSuccess()))
              dispatch(checkTaskLimits())

              if (onCreate) {
                onCreate(resp.data)
              }

              if (id !== flow.id) {
                history.replace(
                  `/orgs/${org.id}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`
                )
              }
            })
        }
      })
      .catch(error => {
        if (error?.response?.status === ASSET_LIMIT_ERROR_STATUS) {
          dispatch(notify(resourceLimitReached('tasks')))
        } else {
          const message = getErrorMessage(error)
          dispatch(notify(taskNotCreated(message)))
        }
      })
  }

  return (
    <Button
      text={text}
      color={ComponentColor.Success}
      type={ButtonType.Submit}
      onClick={onClick}
      status={disabled ? ComponentStatus.Disabled : ComponentStatus.Default}
      testID="task-form-save"
      icon={IconFont.Export_New}
      titleText={text}
    />
  )
}

export default ExportTaskButton
