// Libraries
import React, {FC} from 'react'

// Components
import {
  Form,
  Columns,
  Grid,
  Input,
  TextArea,
  Button,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'

interface Props {
  name: string
  setName: (name: string) => void
  description: string
  setDescription: (name: string) => void
  params: string
  setParams: (name: string) => void
}

const FunctionForm: FC<Props> = ({
  name,
  setName,
  description,
  setDescription,
  params,
  setParams,
}) => {
  return (
    <Form>
      <Grid>
        <Grid.Row>
          <Grid.Column widthXS={Columns.Twelve}>
            <Form.Element label="Name">
              <Input
                onChange={e => {
                  setName(e.target.value)
                }}
                value={name}
                testID="function-form-name"
              />
            </Form.Element>
            <Form.Element label="Description">
              <Input
                onChange={e => {
                  setDescription(e.target.value)
                }}
                value={description}
                testID="function-form-description"
              />
            </Form.Element>
            <Form.Element label="Parameters">
              <TextArea
                onChange={e => {
                  setParams(e.target.value)
                }}
                value={params}
                testID="function-form-parameters"
                rows={5}
              />
            </Form.Element>
            <Button
              text="trigger function"
              testID="function-form-trigger-button"
              color={ComponentColor.Danger}
              size={ComponentSize.Large}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form>
  )
}

export default FunctionForm
