// Libraries
import React, {FC, useState} from 'react'
import {useDispatch} from 'react-redux'
import {
  Button,
  Columns,
  ComponentColor,
  ComponentStatus,
  Grid,
  Overlay,
} from '@influxdata/clockface'

import {AnnotationMessageInput} from 'src/annotations/components/annotationForm/AnnotationMessageInput'
import {AnnotationTimeInput} from 'src/annotations/components/annotationForm/AnnotationTimeInput'

// Constants
import {ANNOTATION_FORM_WIDTH} from 'src/annotations/constants'

// Actions
import {deleteAnnotations} from 'src/annotations/actions/thunks'

// Types
import {Annotation} from 'src/types'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isValidAnnotation} from 'src/annotations/components/annotationForm/AnnotationForm'

// Style
import 'src/annotations/components/editAnnotationForm.scss'

// Notifications
import {
  deleteAnnotationFailed,
  deleteAnnotationSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

interface Props {
  handleSubmit: (editedAnnotation: Annotation) => void
  annotation: Annotation
  handleClose: () => void
}

export const EditAnnotationForm: FC<Props> = (props: Props) => {
  const [editedAnnotation, updateAnnotation] = useState<Annotation>({
    id: props.annotation.id,
    message: props.annotation.message ?? '',
    startTime: new Date(props.annotation.startTime).toISOString(),
    endTime: new Date(props.annotation.endTime).toISOString(),
    stream: props.annotation.stream,
    summary: props.annotation.summary,
    type:
      props.annotation.startTime === props.annotation.endTime
        ? 'point'
        : 'range',
  })

  const dispatch = useDispatch()

  const isValidAnnotationForm = (): boolean => {
    return isValidAnnotation(
      editedAnnotation.type,
      editedAnnotation.summary,
      editedAnnotation.startTime,
      editedAnnotation.endTime
    )
  }

  const updateOneAnnotationField = (newAnnotationField: any) => {
    updateAnnotation(annotation => {
      return {
        ...annotation,
        ...newAnnotationField,
      }
    })
  }

  const updateStartTime = (newStartTime: string) => {
    updateOneAnnotationField({startTime: newStartTime})
  }

  const updateEndTime = (newTime: string) => {
    updateOneAnnotationField({endTime: newTime})
  }

  const updateMessage = (newMessage: string) => {
    updateOneAnnotationField({summary: newMessage})
  }

  const handleSubmit = () => {
    props.handleSubmit(editedAnnotation)
  }

  const handleKeyboardSubmit = () => {
    props.handleSubmit(editedAnnotation)
  }

  const handleCancel = () => {
    event('dashboards.annotations.edit_annotation.cancel')
    props.handleClose()
  }

  // TODO:  get the correct prefix in there, multiple plot types have annotations now
  const handleDelete = () => {
    try {
      dispatch(deleteAnnotations(editedAnnotation))
      event('xyplot.annotations.delete_annotation.success')
      dispatch(notify(deleteAnnotationSuccess(editedAnnotation.message)))
      props.handleClose()
    } catch (err) {
      event('xyplot.annotations.delete_annotation.failure')
      dispatch(notify(deleteAnnotationFailed(err)))
    }
  }

  return (
    <Overlay.Container maxWidth={ANNOTATION_FORM_WIDTH}>
      <Overlay.Header
        title="Edit Annotation"
        onDismiss={handleCancel}
        className="edit-annotation-head"
      />
      <Grid className="edit-annotation-grid">
        <Grid.Column widthSM={Columns.Twelve} widthXS={Columns.Twelve}>
          <AnnotationTimeInput
            onChange={updateStartTime}
            onSubmit={handleKeyboardSubmit}
            time={editedAnnotation.startTime}
            name="startTime"
          />
          {editedAnnotation.type === 'range' && (
            <AnnotationTimeInput
              onChange={updateEndTime}
              onSubmit={handleKeyboardSubmit}
              time={editedAnnotation.endTime}
              name="endTime"
              titleText="Stop Time"
            />
          )}
          <AnnotationMessageInput
            message={editedAnnotation.summary}
            onChange={updateMessage}
            onSubmit={handleKeyboardSubmit}
          />
        </Grid.Column>
      </Grid>
      <Overlay.Footer className="edit-annotation-form-footer">
        <Button
          text="Delete Annotation"
          onClick={handleDelete}
          color={ComponentColor.Danger}
          style={{marginRight: '15px'}}
          testID="delete-annotation-button"
        />
        <div className="edit-annotation-buttons">
          <Button
            text="Cancel"
            onClick={handleCancel}
            color={ComponentColor.Default}
            className="edit-annotation-cancel"
            testID="edit-annotation-cancel-button"
          />
          <Button
            text="Save Changes"
            onClick={handleSubmit}
            color={ComponentColor.Primary}
            status={
              isValidAnnotationForm()
                ? ComponentStatus.Default
                : ComponentStatus.Disabled
            }
            testID="edit-annotation-submit-button"
          />
        </div>
      </Overlay.Footer>
    </Overlay.Container>
  )
}
