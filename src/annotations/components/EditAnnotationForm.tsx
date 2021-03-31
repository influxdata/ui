// Libraries
import React, {FC, useState, ChangeEvent} from 'react'
import {useDispatch} from 'react-redux'
import {
  Button,
  Columns,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Form,
  Grid,
  InfluxColors,
  Input,
  Overlay,
  Panel,
} from '@influxdata/clockface'

// Actions
import {deleteAnnotations} from 'src/annotations/actions/thunks'

// Types
import {Annotation} from 'src/types'

// Style
import 'src/annotations/components/editAnnotationForm.scss'

// Notifications
import {
  deleteAnnotationFailed,
  deleteAnnotationSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

export interface EditAnnotationState {
  startTime: string
  summary: string
  message: string
  id: string
}

interface EditAnnotationProps {
  handleSubmit: (editedAnnotation: EditAnnotationState) => void
  annotation: Annotation
  handleClose: () => void
}

export const EditAnnotationForm: FC<EditAnnotationProps> = ({
  handleClose,
  handleSubmit,
  annotation,
}) => {
  const [editedAnnotation, updateAnnotation] = useState<
    EditAnnotationState
  >({
    stream: annotation.stream,
    startTime: new Date(annotation.startTime).toISOString(),
    summary: annotation.summary,
    message: annotation.message ?? '',
    id: annotation.id,
  })

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = event.target

    updateAnnotation(annotationToUpdate => {
      return {
        ...annotationToUpdate,
        [name]: value,
      }
    })
  }

  const handleDelete = () => {
    try {
      dispatch(deleteAnnotations(editedAnnotation))
      dispatch(notify(deleteAnnotationSuccess(editedAnnotation.message)))
      handleClose()
    } catch (err) {
      dispatch(notify(deleteAnnotationFailed(err)))
    }
  }

  const dispatch = useDispatch()
  return (
    <Overlay.Container maxWidth={800}>
      <Overlay.Header
        title="Edit Annotation"
        onDismiss={handleClose}
        className="edit-annotation-head"
      />
      <Grid className="edit-annotation-grid">
        <Grid.Column widthSM={Columns.Twelve} widthXS={Columns.Twelve}>
          <h3 className="edit-annotation-header-text">Details</h3>
          <Panel
            backgroundColor={InfluxColors.Onyx}
            className="edit-annotation-panel"
          >
            <Form.Element
              label="Timestamp"
              className="edit-annotation-form-label"
            >
              <Input
                name="startTime"
                placeholder="2020-10-10 05:00:00 PDT"
                value={editedAnnotation.startTime}
                onChange={handleChange}
                status={ComponentStatus.Default}
                size={ComponentSize.Medium}
              />
            </Form.Element>
            <Form.Element
              label="Summary"
              className="edit-annotation-form-label"
            >
              <Input
                name="summary"
                value={editedAnnotation.summary}
                onChange={handleChange}
                status={ComponentStatus.Default}
                size={ComponentSize.Medium}
              />
            </Form.Element>
          </Panel>
        </Grid.Column>
      </Grid>
      <Overlay.Footer className="edit-annotation-form-footer">
        <Button
          text="Delete Annotation"
          onClick={handleDelete}
          color={ComponentColor.Danger}
          style={{marginRight: '15px'}}
        />
        <div className="edit-annotation-buttons">
          <Button
            text="Cancel"
            onClick={handleClose}
            color={ComponentColor.Default}
            className="edit-annotation-cancel"
          />
          <Button
            text="Save Changes"
            onClick={() => handleSubmit(editedAnnotation)}
            color={ComponentColor.Primary}
          />
        </div>
      </Overlay.Footer>
    </Overlay.Container>
  )
}
