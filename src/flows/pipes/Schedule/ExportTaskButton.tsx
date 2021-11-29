// Libraries
import React, {FC, useContext} from 'react'
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
import {PopupContext} from 'src/flows/context/popup'
import ExportTaskOverlay from 'src/flows/pipes/Schedule/ExportTaskOverlay'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getErrorMessage} from 'src/utils/api'
import {getOrg} from 'src/organizations/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

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
  const {data, range} = useContext(PipeContext)
  const {launch} = useContext(PopupContext)
  const dispatch = useDispatch()
  const org = useSelector(getOrg)

  const onClick = () => {
    const query = generate ? generate() : data.query

    if (isFlagEnabled('removeExportModal')) {
      event('Export Task Modal Skipped', {from: type})

      // we can soft delete the previously connected task by marking the old one inactive
      if (data?.task?.id) {
        patchTask({
          taskID: data.task.id,
          data: {
            status: 'inactive',
          },
        })
      } else if ((data?.task ?? []).length) {
        patchTask({
          taskID: data.task[0].id,
          data: {
            status: 'inactive',
          },
        })
      }


      postTask({data: {orgID: org.id, flux: query}})
        .then(resp => {
          if (resp.status !== 201) {
            throw new Error(resp.data.message)
          }

          dispatch(notify(taskCreatedSuccess()))
          dispatch(checkTaskLimits())

          if (onCreate) {
            onCreate(resp.data)
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

      return
    }

    event('Export Task Clicked', {from: type})
    launch(<ExportTaskOverlay text={text} type={type} />, {
      bucket: data.bucket,
      query,
      range,
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
