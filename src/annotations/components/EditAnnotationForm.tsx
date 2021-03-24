// Libraries
import React, {FC, useState, ChangeEvent, FormEvent} from 'react'
import {useSelector} from 'react-redux'
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

// Types
import {Annotation} from 'src/types'

// Style
import 'src/annotations/components/editAnnotationForm.scss'

type AnnotationPartial = Annotation & {
  startValue?: string
}
interface EditAnnotationProps {
  handleSubmit: (e: FormEvent, editedAnnotation: Partial<Annotation>) => void
  annotation: AnnotationPartial
  handleClose: () => void
}
interface EditAnnotationState {
  timestamp: string
  summary: string
  message: string
}
export const EditAnnotationForm: FC<EditAnnotationProps> = ({
  handleClose,
  handleSubmit,
  annotation,
}) => {
  const [editAnnotationState, setEditAnnotationState] = useState<
    EditAnnotationState
  >({
    timestamp: new Date(annotation.startValue).toISOString(),
    summary: annotation.summary,
    message: annotation.message ?? '',
  })

  const handleEditAnnotationChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = event.target
    event.preventDefault()
    setEditAnnotationState(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const annotationStreams = useSelector(getAnnotationStreams)

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
                name="timestamp"
                placeholder="2020-10-10 05:00:00 PDT"
                value={editAnnotationState.timestamp}
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
          onClick={() => {}}
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
            onClick={(e: FormEvent) =>
              handleSubmit(e, editAnnotationState as Partial<Annotation>)
            }
            color={ComponentColor.Primary}
          />
        </div>
      </Overlay.Footer>
    </Overlay.Container>
  )
}
