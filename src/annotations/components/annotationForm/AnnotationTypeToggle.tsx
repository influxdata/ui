// Libraries
import React, {FC} from 'react'

// Components
import {SelectGroup, Form, ButtonShape} from '@influxdata/clockface'

// Types
import {AnnotationType} from 'src/annotations/reducers/annotationFormReducer'

interface Props {
  type: AnnotationType
  onChange: (type: AnnotationType) => void
}

const AnnotationTypeToggle: FC<Props> = ({type, onChange}) => {
  return (
    <Form.Element label="Type" required={false}>
      <SelectGroup shape={ButtonShape.StretchToFit}>
        <SelectGroup.Option
          id="point"
          value="point"
          active={type === 'point'}
          onClick={onChange}
        >
          Point
        </SelectGroup.Option>
        <SelectGroup.Option
          id="range"
          value="range"
          active={type === 'range'}
          onClick={onChange}
        >
          Range
        </SelectGroup.Option>
      </SelectGroup>
    </Form.Element>
  )
}

export default AnnotationTypeToggle
