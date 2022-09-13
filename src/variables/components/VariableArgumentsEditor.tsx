import React, {lazy, PureComponent, Suspense} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Components
import MapVariableBuilder from 'src/variables/components/MapVariableBuilder'
import CSVVariableBuilder from 'src/variables/components/CSVVariableBuilder'
import {Form} from '@influxdata/clockface'

// Types
import {KeyValueMap, VariableProperties, Variable} from 'src/types'

const FluxMonacoEditor = lazy(
  () => import('src/shared/components/FluxMonacoEditor')
)

interface Props {
  args: VariableProperties
  onChange: (update: {args: VariableProperties; isValid: boolean}) => void
  onSelectMapDefault: (selectedKey: string) => void
  selected: string[]
  variables: Variable[]
}

class VariableArgumentsEditor extends PureComponent<Props> {
  render() {
    const {args, onSelectMapDefault, selected, variables} = this.props
    switch (args.type) {
      case 'query':
        return (
          <Form.Element label="Script">
            <div className="overlay-flux-editor">
              <Suspense
                fallback={
                  <SpinnerContainer
                    loading={RemoteDataState.Loading}
                    spinnerComponent={<TechnoSpinner />}
                  />
                }
              >
                <FluxMonacoEditor
                  script={args.values.query}
                  variables={variables}
                  onChangeScript={this.handleChangeQuery}
                  autofocus
                />
              </Suspense>
            </div>
          </Form.Element>
        )
      case 'map':
        return (
          <MapVariableBuilder
            onChange={this.handleChangeMap}
            values={args.values}
            onSelectDefault={onSelectMapDefault}
            selected={selected}
          />
        )
      case 'constant':
        return (
          <CSVVariableBuilder
            onChange={this.handleChangeCSV}
            values={args.values}
            onSelectDefault={onSelectMapDefault}
            selected={selected}
          />
        )
    }
  }

  private handleChangeCSV = (values: string[]) => {
    const {onChange} = this.props

    const updatedArgs = {type: 'constant' as 'constant', values}
    const isValid = values.length > 0

    onChange({args: updatedArgs, isValid})
  }

  private handleChangeQuery = (query: string) => {
    const {onChange} = this.props

    const values = {language: 'flux' as 'flux', query}
    const updatedArgs = {type: 'query' as 'query', values}

    const isValid = !query.match(/^\s*$/)

    onChange({args: updatedArgs, isValid})
  }

  private handleChangeMap = (update: {
    values: KeyValueMap
    errors: string[]
  }) => {
    const {onChange} = this.props

    const updatedArgs = {type: 'map' as 'map', values: update.values}

    const isValid =
      update.errors.length === 0 && Object.keys(update.values).length > 0

    onChange({args: updatedArgs, isValid})
  }
}

export default VariableArgumentsEditor
