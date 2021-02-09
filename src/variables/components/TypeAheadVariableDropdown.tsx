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

class TypeAheadVariableDropdown extends PureComponent<Props> {
  constructor(props) {
    super(props)
    this.state = {
      typedText: '',
      actualVal: '',
      selectIndex: -1,
      shownValues: props.values,
    }
  }

  // set the 'shownValues' after loading, and
  // resets the setMenuStatus variable
  componentDidUpdate(prevProps, prevState) {
    const prevVals = prevProps.values
    const {values, selectedValue} = this.props
    const {actualVal, loaded, selectHappened, setMenuStatus} = this.state
    const {
      actualVal: prevActualVal,
      selectHappened: prevSelectHappened,
      setMenuStatus: prevSetMenuStatus,
    } = prevState

    //this is for updating the values:
    //(only want this to run *once* when the values get loaded)
    if (!loaded && prevVals.length !== values.length) {
      this.setState({
        shownValues: values,
        typedValue: selectedValue,
        loaded: true,
      })
    }

    //unset the setMenuStatus; it should be set to closed (or open) only once; then undone
    if (setMenuStatus !== prevSetMenuStatus && setMenuStatus !== null) {
      this.setState({setMenuStatus: null})
    }

    // need to have this, as the 'onClickAwayHere' gets triggered *before*
    // the selected value is set to the actualValue (it keeps re-using the original
    // property)

    //for updating the selected value:
    if (
      selectHappened &&
      !prevSelectHappened &&
      actualVal &&
      actualVal !== prevActualVal
    ) {
      //update the 'typed val':
      this.setState({typedValue: actualVal, selectHappened: false})
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
      this.setState({
        shownValues: result,
        typedValue: needle,
        setMenuStatus: 'open',
      })
    }
  }

  maybeSelectNextItem = e => {
    const {shownValues, selectIndex} = this.state

    let newIndex = -1

    if (e.keyCode === 40) {
      //down arrow
      newIndex = selectIndex + 1
    } else if (e.keyCode === 38) {
      //up arrow
      newIndex = selectIndex - 1
    }

    const numItems = shownValues.length

    if (numItems && newIndex >= 0 && newIndex < numItems) {
      this.handleSelect(shownValues[newIndex], newIndex)
      return
    }

    if (e.keyCode === 13) {
      //return/enter key
      //lose focus, reset the selectIndex to -1, & close the menu:
      e.target.blur()
      this.setState({setMenuStatus: 'closed', selectIndex: -1})
    }
  }

  // if the entire item loses focus, then
  // the input should show the actual selected item, not what the user typed in;
  // only want to show valid values when the component is not actively being used
  onClickAwayHere = () => {
    const {actualVal} = this.state
    const {selectedValue} = this.props

    if (actualVal || selectedValue) {
      const realValue = actualVal ? actualVal : selectedValue

      this.setState({typedValue: realValue})
    }
  }

  render() {
    const {selectedValue, values, name} = this.props
    const {typedValue, shownValues, setMenuStatus} = this.state

    const dropdownStatus =
      values.length === 0 ? ComponentStatus.Disabled : ComponentStatus.Default

    const placeHolderText = this.getPlaceHolderText('Select a Value')

    const widthStyle = this.getWidth(placeHolderText)

    return (
      <Dropdown
        style={{width: '140px'}}
        className="variable-dropdown--dropdown"
        testID={this.props.testID || `variable-dropdown--${name}`}
        onClickAway={this.onClickAwayHere}
        setMenuStatus={setMenuStatus}
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
              onKeyDown={e => this.maybeSelectNextItem(e)}
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

  private getWidth(placeHolderText) {
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

  private handleSelect = (selectedValue: string, selectIndex?: number) => {
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

    const newState = {
      typedValue: selectedValue,
      actualVal: selectedValue,
      selectHappened: true,
    }

    if (selectIndex || selectIndex === 0) {
      newState.selectIndex = selectIndex
    }

    this.setState(newState)
  }

  // show the 'loading' or 'no values' as a string (no input field yet!)
  // when it is loading
  getPlaceHolderText = (defaultText: string = '') => {
    const {status} = this.props
    if (status === RemoteDataState.Loading) {
      return 'Loading...'
    }
    return defaultText
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
