// Libraries
import React, {PureComponent, ChangeEvent, FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Form, Input, Button, Overlay} from '@influxdata/clockface'

// Utils
import {validateVariableName} from 'src/variables/utils/validation'
import {getVariables} from 'src/variables/selectors'

// Actions
import {updateVariable} from 'src/variables/actions/thunks'

// Types
import {AppState, Variable} from 'src/types'
import {
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'

interface OwnProps {
  onClose: () => void
}

interface State {
  workingVariable: Variable
  isNameValid: boolean
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class RenameVariableOverlayForm extends PureComponent<Props, State> {
  public state: State = {
    workingVariable: this.props.startVariable,
    isNameValid: true,
  }

  public render() {
    const {onClose} = this.props
    const {workingVariable, isNameValid} = this.state

    return (
      <Form onSubmit={this.handleSubmit}>
        <Overlay.Body>
          <div className="overlay-flux-editor--spacing">
            <Form.ValidationElement
              label="Name"
              value={workingVariable.name}
              required={true}
              prevalidate={true}
              validationFunc={this.handleNameValidation}
            >
              {status => (
                <Input
                  placeholder="Rename your variable"
                  name="name"
                  autoFocus={true}
                  value={workingVariable.name}
                  onChange={this.handleChangeInput}
                  status={status}
                  testID="rename-variable-input"
                />
              )}
            </Form.ValidationElement>
          </div>
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            text="Cancel"
            color={ComponentColor.Tertiary}
            onClick={onClose}
          />
          <Button
            text="Submit"
            type={ButtonType.Submit}
            color={ComponentColor.Primary}
            status={
              isNameValid ? ComponentStatus.Default : ComponentStatus.Disabled
            }
            testID="rename-variable-submit"
          />
        </Overlay.Footer>
      </Form>
    )
  }

  private handleSubmit = (e: FormEvent): void => {
    const {workingVariable} = this.state

    e.preventDefault()

    this.props.onUpdateVariable(workingVariable.id, workingVariable)
    this.props.onClose()
  }

  private handleNameValidation = (name: string) => {
    const {variables} = this.props
    const {workingVariable} = this.state
    const {error} = validateVariableName(variables, name, workingVariable.id)

    this.setState({isNameValid: !error})

    return error
  }

  private handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value

    const workingVariable = {...this.state.workingVariable, name}

    this.setState({
      workingVariable,
    })
  }
}

const mstp = (state: AppState) => {
  const variables = getVariables(state)
  const startVariable = variables.find(v => v.id === state.overlays.params.id)

  return {variables, startVariable}
}

const mdtp = {
  onUpdateVariable: updateVariable,
}

const connector = connect(mstp, mdtp)

export default connector(RenameVariableOverlayForm)
