// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Dropdown,
  DropdownMenuTheme,
  ComponentStatus,
  Input,
} from '@influxdata/clockface'

// Actions
import {selectValue} from 'src/variables/actions/thunks'

// Utils
import {getVariable, normalizeValues} from 'src/variables/selectors'

// Types
import {AppState, RemoteDataState} from 'src/types'

interface OwnProps {
  variableID: string
  testID?: string
  onSelect?: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const placeHolderText = 'select a value'
//todo:  play with focus....if the entire item loses focus, then
//the input should show the actual selected item, not what the user typed in
//think on this.....
class VariableDropdown extends PureComponent<Props> {
  constructor(props) {
    super(props)
    this.state = {
      typedText: '',
      shownValues: props.values,
    }
  }

  //only want this to run *once* when the values get loaded
  componentDidUpdate(prevProps) {
    const prevVals = prevProps.values
    const {values, selectedValue} = this.props
    const {loaded} = this.state

    if (!loaded && prevVals.length !== values.length) {
      this.setState({
        shownValues: values,
        typedValue: selectedValue,
        loaded: true,
      })
    }
  }

  filterVals = needle => {
    const {values} = this.props

    if (!needle) {
      this.setState({shownValues: values, typedValue: needle})
    } else {
      const result = values.filter(
        val => val.toLowerCase().indexOf(needle.toLowerCase()) !== -1
      )
      this.setState({shownValues: result, typedValue: needle})
    }
  }

  render() {
    const {selectedValue, values, name} = this.props
    const {typedValue, shownValues} = this.state

    const dropdownStatus =
      values.length === 0 ? ComponentStatus.Disabled : ComponentStatus.Default

    const widthStyle = this.getWidth()

    return (
      <Dropdown
        style={{width: '140px'}}
        className="variable-dropdown--dropdown"
        testID={this.props.testID || `variable-dropdown--${name}`}
        button={(active, onClick) => (
          <Dropdown.Button
            active={active}
            onClick={onClick}
            testID="variable-dropdown--button"
            status={dropdownStatus}
          >
            <Input
              style={widthStyle}
              placeholder={placeHolderText}
              onChange={e => this.filterVals(e.target.value)}
              value={typedValue}
            />
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu
            style={widthStyle}
            onCollapse={onCollapse}
            theme={DropdownMenuTheme.Amethyst}
          >
            {shownValues.map(val => {
              return (
                <Dropdown.Item
                  key={val}
                  id={val}
                  value={val}
                  onClick={this.handleSelect}
                  selected={val === selectedValue}
                  testID="variable-dropdown--item"
                  className="variable-dropdown--item"
                >
                  {val}
                </Dropdown.Item>
              )
            })}
          </Dropdown.Menu>
        )}
      />
    )
  }

  private getWidth() {
    const {values} = this.props
    const allVals = [placeHolderText, ...values]
    const longestItemWidth = Math.floor(
      allVals.reduce(function(a, b) {
        return a.length > b.length ? a : b
      }, '').length * 10
    )

    const widthLength = Math.max(140, longestItemWidth)
    const widthStyle = {width: `${widthLength}px`}
    return widthStyle
  }

  private handleSelect = (selectedValue: string) => {
    const {
      variableID,
      onSelectValue,
      onSelect,
      selectedValue: prevSelectedValue,
    } = this.props

    if (prevSelectedValue !== selectedValue) {
      onSelectValue(variableID, selectedValue)
    }

    if (onSelect) {
      onSelect()
    }
    this.setState({typedValue: selectedValue})
  }

  // todo:  show the 'loading' or 'no values' as a string (no input field yet!)
  // when it is loading
  private get selectedText() {
    const {selectedValue, status} = this.props
    if (status === RemoteDataState.Loading) {
      return 'Loading'
    }

    if (selectedValue) {
      return selectedValue
    }

    return 'No Values'
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

export default connector(VariableDropdown)
