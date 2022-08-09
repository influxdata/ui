// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {TypeAheadDropDown, SelectableItem} from '@influxdata/clockface'

// Actions
import {selectValue} from 'src/variables/actions/thunks'

// Utils
import {getVariable, normalizeValues} from 'src/variables/selectors'

// Types
import {AppState} from 'src/types'

interface OwnProps {
  variableID: string
  testID?: string
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class TypeAheadVariableDropdown extends PureComponent<Props> {
  constructor(props) {
    super(props)
  }

  render() {
    const {selectedValue, values, name} = this.props
    const typeAheadItems = values.map(val => ({
      id: val,
      name: val,
    })) as SelectableItem[]
    const selectedVariableValue = {
      id: selectedValue,
      name: selectedValue,
    } as SelectableItem

    const calculatedWidth = selectedVariableValue.name.length > 0 ? selectedVariableValue.name.length * 8 + 95 : 150
    const typeAheadStyle = {
      width: `${calculatedWidth}px`,
    }
    return (
      <TypeAheadDropDown
        style={typeAheadStyle}
        testID={this.props.testID || `variable-dropdown--${name}`}
        items={typeAheadItems}
        selectedOption={selectedVariableValue}
        onSelect={this.setVariableValue}
      />
    )
  }

  private setVariableValue = (selectedValue: SelectableItem) => {
    if (selectedValue === null) {
      return
    }

    const selectedVariableValue = selectedValue.name
    const {
      variableID,
      onSelectValue,
      selectedValue: prevSelectedValue,
    } = this.props

    if (prevSelectedValue !== selectedVariableValue) {
      onSelectValue(variableID, selectedVariableValue)
    }
  }
}

const mstp = (state: AppState, props: OwnProps) => {
  const {variableID} = props
  const variable = getVariable(state, variableID)
  const selected =
    variable.selected && variable.selected.length ? variable.selected[0] : null

  return {
    status: variable.status,
    values: normalizeValues(variable),
    selectedValue: selected,
    name: variable.name,
  }
}

const mdtp = {
  onSelectValue: selectValue,
}

const connector = connect(mstp, mdtp)

export default connector(TypeAheadVariableDropdown)
