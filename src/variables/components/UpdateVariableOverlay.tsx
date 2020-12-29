// Libraries
import React, {PureComponent, FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {
  Form,
  Input,
  Button,
  Grid,
  Dropdown,
  Columns,
  Overlay,
} from '@influxdata/clockface'
import VariableArgumentsEditor from 'src/variables/components/VariableArgumentsEditor'

// Actions
import {updateVariable} from 'src/variables/actions/thunks'

// Utils
import {getVariables} from 'src/variables/selectors'

// Constants
import {variableItemTypes} from 'src/variables/constants'

// Types
import {
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import {VariableArguments, AppState, Variable} from 'src/types'

// Context
import {OverlayContext} from 'src/overlays/components/OverlayController'

interface State {
  workingVariable: Variable
  isNameValid: boolean
  hasValidArgs: boolean
}

type RouterProps = RouteComponentProps<{orgID: string; id: string}>
type ReduxProps = ConnectedProps<typeof connector>
type Props = RouterProps & ReduxProps

class UpdateVariableOverlay extends PureComponent<Props, State> {
  public state: State = {
    workingVariable: this.props.startVariable,
    isNameValid: true,
    hasValidArgs: true,
  }

  public render() {
    const {workingVariable, hasValidArgs} = this.state

    return (
      <OverlayContext.Consumer>
        {({onClose}) => (
          <Overlay.Container maxWidth={1000} testID="edit-variable--overlay">
            <Overlay.Header title="Edit Variable" onDismiss={onClose} />
            <Overlay.Body>
              <Form
                onSubmit={(e: FormEvent) => {
                  this.handleSubmit(e)
                  onClose()
                }}
              >
                <Grid>
                  <Grid.Row>
                    <Grid.Column widthXS={Columns.Six}>
                      <div className="overlay-flux-editor--spacing">
                        <Form.Element
                          label="Name"
                          helpText="To rename your variable use the rename button. Renaming is not allowed here."
                        >
                          <Input
                            placeholder="Give your variable a name"
                            name="name"
                            autoFocus={true}
                            value={workingVariable.name}
                            status={ComponentStatus.Disabled}
                          />
                        </Form.Element>
                      </div>
                    </Grid.Column>
                    <Grid.Column widthXS={Columns.Six}>
                      <Form.Element label="Type" required={true}>
                        <Dropdown
                          button={(active, onClick) => (
                            <Dropdown.Button
                              active={active}
                              onClick={onClick}
                              testID="variable-type-dropdown--button"
                            >
                              {this.typeDropdownLabel}
                            </Dropdown.Button>
                          )}
                          menu={onCollapse => (
                            <Dropdown.Menu onCollapse={onCollapse}>
                              {variableItemTypes.map(v => (
                                <Dropdown.Item
                                  key={v.type}
                                  id={v.type}
                                  value={v.type}
                                  onClick={this.handleChangeType}
                                  selected={
                                    v.type === workingVariable.arguments.type
                                  }
                                  testID={`variable-type-dropdown-${v.type}`}
                                >
                                  {v.label}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          )}
                        />
                      </Form.Element>
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <VariableArgumentsEditor
                        onChange={this.handleChangeArgs}
                        onSelectMapDefault={this.handleSelectMapDefault}
                        selected={workingVariable.selected}
                        args={workingVariable.arguments}
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <Form.Footer>
                        <Button
                          text="Cancel"
                          color={ComponentColor.Danger}
                          onClick={onClose}
                        />
                        <Button
                          text="Submit"
                          type={ButtonType.Submit}
                          color={ComponentColor.Primary}
                          status={
                            hasValidArgs
                              ? ComponentStatus.Default
                              : ComponentStatus.Disabled
                          }
                        />
                      </Form.Footer>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Form>
            </Overlay.Body>
          </Overlay.Container>
        )}
      </OverlayContext.Consumer>
    )
  }

  private get typeDropdownLabel(): string {
    const {workingVariable} = this.state

    return variableItemTypes.find(
      variable => variable.type === workingVariable.arguments.type
    ).label
  }

  private handleChangeType = (selectedType: string) => {
    const {isNameValid, workingVariable} = this.state
    const defaults = {hasValidArgs: false, isNameValid}

    switch (selectedType) {
      case 'query':
        return this.setState({
          ...defaults,
          workingVariable: {
            ...workingVariable,
            arguments: {
              type: 'query',
              values: {
                query: '',
                language: 'flux',
              },
            },
            selected: null,
          },
        })
      case 'map':
        return this.setState({
          ...defaults,
          workingVariable: {
            ...workingVariable,
            selected: null,
            arguments: {
              type: 'map',
              values: {},
            },
          },
        })
      case 'constant':
        return this.setState({
          ...defaults,
          workingVariable: {
            ...workingVariable,
            selected: null,
            arguments: {
              type: 'constant',
              values: [],
            },
          },
        })
    }
  }

  private handleSelectMapDefault = (selected: string) => {
    const {workingVariable} = this.state

    this.setState({
      workingVariable: {
        ...workingVariable,
        selected: [selected],
      },
    })
  }

  private handleChangeArgs = ({
    args,
    isValid,
  }: {
    args: VariableArguments
    isValid: boolean
  }) => {
    const {workingVariable} = this.state

    this.setState({
      workingVariable: {
        ...workingVariable,
        arguments: args,
      },
      hasValidArgs: isValid,
    })
  }

  private handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    const {workingVariable} = this.state

    this.props.onUpdateVariable(workingVariable.id, workingVariable)
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

export default withRouter(connector(UpdateVariableOverlay))
