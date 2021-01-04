// Libraries
import React, {FC, useContext} from 'react'

// Components
import {
  Grid,
  Columns,
  SelectGroup,
  Form,
  ButtonShape,
} from '@influxdata/clockface'

// Types
import {AnnotationType} from 'src/annotations/reducers/annotationFormReducer'

// Actions
import {updateAnnotationDraft} from 'src/annotations/actions/annotationFormActions'

// Contexts
import {AnnotationFormContext} from 'src/annotations/components/annotationForm/AnnotationForm'

export const AnnotationTypeToggle: FC = () => {
  const {type, dispatch} = useContext(AnnotationFormContext)

  const handleChange = (type: AnnotationType): void => {
    dispatch(updateAnnotationDraft({type}))
  }

  return (
    <Grid.Column widthXS={Columns.Five}>
      <Form.Element label="Type" required={false}>
        <SelectGroup shape={ButtonShape.StretchToFit}>
          <SelectGroup.Option
            id="point"
            value="point"
            active={type === 'point'}
            onClick={handleChange}
          >
            Point
          </SelectGroup.Option>
          <SelectGroup.Option
            id="range"
            value="range"
            active={type === 'range'}
            onClick={handleChange}
          >
            Range
          </SelectGroup.Option>
        </SelectGroup>
      </Form.Element>
    </Grid.Column>
  )
}
