// Libraries
import React, {FC, useState, ChangeEvent} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  Button,
  Columns,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Dropdown,
  Form,
  Grid,
  InfluxColors,
  Input,
  Overlay,
  Panel,
  TextArea,
} from '@influxdata/clockface'

// Selectors
import {getAnnotationStreams} from 'src/annotations/selectors'

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
  const [editAnnotationState, setEditAnnotationState] = useState<
    EditAnnotationState
  >({
    startTime: new Date(annotation.startTime).toISOString(),
    summary: annotation.summary,
    message: annotation.message ?? '',
    id: annotation.id,
  })

  const handleEditAnnotationChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = event.target

    setEditAnnotationState(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDeleteAnnotation = () => {
    try {
      dispatch(deleteAnnotations(editAnnotationState))
      dispatch(notify(deleteAnnotationSuccess()))
      handleClose()
    } catch (err) {
      dispatch(notify(deleteAnnotationFailed(err)))
    }
  }

  const annotationStreams = useSelector(getAnnotationStreams)
  const dispatch = useDispatch()
  return (
    <Overlay.Container maxWidth={800}>
      <Overlay.Header
        title="Edit Annotation"
        onDismiss={handleClose}
        className="edit-annotation-head"
      ></Overlay.Header>
      <Grid className="edit-annotation-grid">
        <Grid.Column widthSM={Columns.Six} widthXS={Columns.Twelve}>
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
                value={editAnnotationState.startTime}
                onChange={handleEditAnnotationChange}
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
                value={editAnnotationState.summary}
                onChange={handleEditAnnotationChange}
                status={ComponentStatus.Default}
                size={ComponentSize.Medium}
              />
            </Form.Element>
            <Form.Element
              label="Message"
              className="edit-annotation-form-label"
            >
              <TextArea
                name="message"
                placeholder="Try writing markdown here..."
                value={editAnnotationState.message}
                onChange={handleEditAnnotationChange}
                status={ComponentStatus.Default}
                className="edit-annotation-form-textarea"
              />
            </Form.Element>
          </Panel>
        </Grid.Column>
        <Grid.Column widthSM={Columns.Six} widthXS={Columns.Twelve}>
          <h3 className="edit-annotation-header-text">Store Annotation</h3>
          <Panel
            backgroundColor={InfluxColors.Onyx}
            className="edit-annotation-panel"
          >
            <Form.Element
              label="Annotation Stream"
              className="edit-annotation-form-label"
            >
              <Dropdown
                button={(active, onClick) => (
                  <Dropdown.Button
                    active={active}
                    onClick={onClick}
                    testID="stream-selector--dropdown"
                  >
                    {annotationStreams[0].stream}
                  </Dropdown.Button>
                )}
                menu={onCollapse => (
                  <Dropdown.Menu
                    onCollapse={onCollapse}
                    testID="stream-selector--dropdown-menu"
                  >
                    {annotationStreams.map(stream => stream.stream)}
                  </Dropdown.Menu>
                )}
              />
            </Form.Element>
          </Panel>
        </Grid.Column>
      </Grid>
      <Overlay.Footer className="edit-annotation-form-footer">
        <Button
          text="Delete Annotation"
          onClick={handleDeleteAnnotation}
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
            onClick={() => handleSubmit(editAnnotationState)}
            color={ComponentColor.Primary}
          />
        </div>
      </Overlay.Footer>
    </Overlay.Container>
  )
}
