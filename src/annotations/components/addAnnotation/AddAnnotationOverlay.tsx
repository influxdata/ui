// Libraries
import React, {FC, FormEvent, useContext} from 'react'

// Components
import AnnotationOverlay from 'src/annotations/components/addAnnotation/AnnotationOverlay'
import {
  Overlay,
  Button,
  ComponentColor,
  Form,
  Grid,
  Columns,
  Input,
  TextArea,
  ButtonType,
  SelectGroup,
  ButtonShape,
} from '@influxdata/clockface'

// Hooks
import useAnnotationState from 'src/annotations/reducers/useAnnotationState'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

const AddAnnotationOverlay: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const {values, errors, statuses, set, validate} = useAnnotationState('point')

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()

    const formState = validate()

    if (formState === 'valid') {
      // Submit form using values
    }
  }

  return (
    <AnnotationOverlay title="Add Annotation">
      <Form onSubmit={handleSubmit}>
        <Overlay.Body>
          <Grid>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Seven}>
                <Form.Element
                  label="Summary"
                  required={true}
                  errorMessage={errors.summary}
                >
                  <Input
                    placeholder="ex: Deployed update"
                    value={values.summary}
                    onChange={set('summary')}
                    status={statuses.summary}
                  />
                </Form.Element>
              </Grid.Column>
              <Grid.Column widthXS={Columns.Five}>
                <Form.Element label="Type">
                  <SelectGroup shape={ButtonShape.StretchToFit}>
                    <SelectGroup.Option
                      id="point"
                      value="point"
                      active={values.type === 'point'}
                      onClick={set('type')}
                    >
                      Point
                    </SelectGroup.Option>
                    <SelectGroup.Option
                      id="range"
                      value="range"
                      active={values.type === 'range'}
                      onClick={set('type')}
                    >
                      Range
                    </SelectGroup.Option>
                  </SelectGroup>
                </Form.Element>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column
                widthXS={values.type === 'range' ? Columns.Six : Columns.Twelve}
              >
                <Form.Element
                  label={values.type === 'range' ? 'Start' : 'Timestamp'}
                  required={true}
                  errorMessage={errors.startTime}
                >
                  <Input
                    value={values.startTime}
                    onChange={set('startTime')}
                    status={statuses.startTime}
                  />
                </Form.Element>
              </Grid.Column>
              {values.type === 'range' && (
                <Grid.Column widthXS={Columns.Six}>
                  <Form.Element
                    label="Stop"
                    required={true}
                    errorMessage={errors.stopTime}
                  >
                    <Input
                      value={values.stopTime}
                      onChange={set('stopTime')}
                      status={statuses.stopTime}
                    />
                  </Form.Element>
                </Grid.Column>
              )}
            </Grid.Row>
            <Grid.Row>
              <Grid.Column widthXS={Columns.Twelve}>
                <Form.Element label="Message">
                  <TextArea
                    value={values.message}
                    onChange={set('message')}
                    style={{height: '80px', minHeight: '80px'}}
                  />
                </Form.Element>
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <p>Add annotation!!1</p>
          {/* TODO: wrap children in GetResources with ResourceType.AnnotationStreams */}
        </Overlay.Body>
        <Overlay.Footer>
          <Button text="Cancel" onClick={onClose} />
          <Button
            text="Add Annotation"
            color={ComponentColor.Primary}
            type={ButtonType.Submit}
          />
        </Overlay.Footer>
      </Form>
    </AnnotationOverlay>
  )
}

export default AddAnnotationOverlay
