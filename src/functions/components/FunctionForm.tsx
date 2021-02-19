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
  ButtonGroup,
  SquareButton,
  IconFont,
  Panel,
  Gradients,
  AlignItems,
  ButtonShape,
} from '@influxdata/clockface'

// Types
import {FunctionRun} from 'src/client/managedFunctionsRoutes'

interface Props {
  name: string
  setName: (name: string) => void
  params: string
  setParams: (name: string) => void
  triggerFunction: () => void
  runResult: FunctionRun
}

const FunctionForm: FC<Props> = ({
  name,
  setName,
  params,
  setParams,
  triggerFunction,
  runResult,
}) => {
  const stutusText = runResult.status === 'ok' ? 'success!' : 'error'
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
            <ButtonGroup>
              <SquareButton
                active={false}
                onClick={triggerFunction}
                icon={IconFont.CaretRight}
                color={ComponentColor.Success}
                size={ComponentSize.Large}
              />
              <Button
                text="trigger function"
                testID="function-form-trigger-button"
                color={ComponentColor.Success}
                size={ComponentSize.Large}
                onClick={triggerFunction}
                shape={ButtonShape.StretchToFit}
              />
            </ButtonGroup>
          </Grid.Column>
        </Grid.Row>
        {runResult.status && (
          <Grid.Row>
            <Grid.Column widthXS={Columns.Twelve}>
              <Panel
                gradient={
                  runResult.status == 'ok'
                    ? Gradients.TropicalTourist
                    : Gradients.DangerLight
                }
                border={true}
              >
                <Panel.Header>
                  <h5>{stutusText}</h5>
                </Panel.Header>
                <Panel.Body alignItems={AlignItems.FlexStart}>
                  {runResult.status == 'ok' ? (
                    <p>
                      <div>{JSON.stringify(runResult.logs)}</div>
                      <div>{JSON.stringify(runResult.result)}</div>
                    </p>
                  ) : (
                    <p>
                      <div>{JSON.stringify(runResult.error)}</div>
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
