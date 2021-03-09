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
  Panel,
  Gradients,
  AlignItems,
  ButtonShape,
} from '@influxdata/clockface'
import {FunctionListContext} from 'src/functions/context/function.list'

// Types
import {FunctionTriggerResponse} from 'src/client/managedFunctionsRoutes'

const FunctionForm: FC = () => {
  const {
    draftFunction: {name, script, params},
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

  const statusText = triggerResponse.status === 'ok' ? 'success!' : 'error'

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
          <Grid.Row>
            <Grid.Column widthXS={Columns.Twelve}>
              <Panel
                gradient={
                  triggerResponse.status == 'ok'
                    ? Gradients.TropicalTourist
                    : Gradients.DangerLight
                }
                border={true}
              >
                <Panel.Header>
                  <h5>{statusText}</h5>
                </Panel.Header>
                <Panel.Body alignItems={AlignItems.FlexStart}>
                  {triggerResponse.status == 'ok' && triggerResponse.logs ? (
                    triggerResponse.logs.map(l => {
                      return (
                        <div key={l.timestamp}>
                          <div>severity: {JSON.stringify(l.severity)}</div>
                          <div>timestamp: {JSON.stringify(l.timestamp)}</div>
                          <div>message: {JSON.stringify(l.message)}</div>
                        </div>
                      )
                    })
                  ) : (
                    <p>
                      <div>{JSON.stringify(triggerResponse.error)}</div>
                    </p>
                  )}
                </Panel.Body>
              </Panel>
            </Grid.Column>
          </Grid.Row>
        )}
      </Grid>
    </Form>
  )
}

export default FunctionForm
