// Libraries
import React, {FC, useContext, useState} from 'react'

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
  ButtonGroup,
  SquareButton,
  IconFont,
  ButtonShape,
} from '@influxdata/clockface'
import {FunctionListContext} from 'src/functions/context/function.list'
import FunctionResponse from 'src/functions/components/FunctionResponse'

// Types
import {FunctionTriggerResponse} from 'src/client/managedFunctionsRoutes'

const FunctionForm: FC = () => {
  const {
    draftFunction: {name, script, params, description},
    updateDraftFunction,
    trigger,
  } = useContext(FunctionListContext)

  const [triggerResponse, setTriggerResponse] = useState<
    FunctionTriggerResponse
  >({})

  const triggerFunction = async () => {
    const response = await trigger({script, params})
    setTriggerResponse(response)
  }

  return (
    <Form>
      <Grid>
        <Grid.Row>
          <Grid.Column widthXS={Columns.Twelve}>
            <Form.Element label="Name">
              <Input
                onChange={e => {
                  updateDraftFunction({name: e.target.value})
                }}
                value={name}
                testID="function-form-name"
              />
            </Form.Element>
            <Form.Element label="Description">
              <Input
                onChange={e => {
                  updateDraftFunction({description: e.target.value})
                }}
                value={description}
                testID="function-form-name"
              />
            </Form.Element>
            <Form.Element label="Parameters">
              <TextArea
                onChange={e => {
                  updateDraftFunction({params: e.target.value})
                }}
                value={params}
                testID="function-form-parameters"
                rows={5}
              />
            </Form.Element>
            <ButtonGroup>
              <SquareButton
                active={false}
                onClick={triggerFunction}
                icon={IconFont.CaretRight}
                color={ComponentColor.Success}
                size={ComponentSize.Large}
              />
              <Button
                text="run function"
                testID="function-form-trigger-button"
                color={ComponentColor.Success}
                size={ComponentSize.Large}
                onClick={triggerFunction}
                shape={ButtonShape.StretchToFit}
              />
            </ButtonGroup>
          </Grid.Column>
        </Grid.Row>
        {triggerResponse.status && (
          <FunctionResponse triggerResponse={triggerResponse} />
        )}
      </Grid>
    </Form>
  )
}

export default FunctionForm
