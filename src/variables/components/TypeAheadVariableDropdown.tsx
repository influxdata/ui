// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Dropdown,
  DropdownMenuTheme,
  ComponentStatus,
  Input,
  MenuStatus,
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

// actualVal keeps track of the actual, selected variable
// it allows the component to return to that if something was typed that is not in the selected list

// the typed val is what the user types in
interface MyState {
  typedValue: string
  actualVal: string
  selectIndex: number
  shownValues: string[]
  selectHappened: boolean
  menuOpen: MenuStatus
  loaded: boolean
}

class TypeAheadVariableDropdown extends PureComponent<Props, MyState> {
  constructor(props) {
    super(props)

    const defaultState = {
      typedValue: '',
      actualVal: '',
      selectIndex: -1,
      shownValues: props.values,
      selectHappened: false,
      menuOpen: null,
      loaded: false,
    }

    // if it's a csv var, loading is instantaneous, so if it is done just set it:
    if (props.status === RemoteDataState.Done) {
      defaultState.typedValue = props.selectedValue
      defaultState.actualVal = props.selectedValue
      defaultState.loaded = true
    }

    this.state = defaultState
  }

  // set the 'shownValues' after loading, and
  // resets the menuOpen variable
  componentDidUpdate(prevProps, prevState) {
    const prevVals = prevProps.values
    const {values, selectedValue, status} = this.props
    const {status: prevStatus} = prevProps
    const {actualVal, loaded, selectHappened, menuOpen} = this.state
    const {
      actualVal: prevActualVal,
      selectHappened: prevSelectHappened,
      menuOpen: prevMenuOpen,
    } = prevState

    let newState = {}

    const justLoaded = () =>
      status === RemoteDataState.Done && prevStatus !== RemoteDataState.Done

    const justSelected = () =>
      selectHappened &&
      !prevSelectHappened &&
      actualVal &&
      actualVal !== prevActualVal

    // this is for updating the values:
    // (only want this to run *once* when the values get loaded)
    if (justLoaded()) {
      newState = this.getInitialValuesAfterLoading()
    } else if (
      !loaded &&
      status === RemoteDataState.Done &&
      prevVals.length !== values.length
    ) {
      newState = {
        shownValues: values,
        typedValue: selectedValue,
        loaded: true,
      }
    }

    // unset the menuOpen; it should be set to closed (or open) only once; then undone
    if (menuOpen !== prevMenuOpen && menuOpen !== null) {
      newState['menuOpen'] = null
    }

    // need to have this, as the 'onClickAwayHere' gets triggered *before*
    // the selected value is set to the actualValue (it keeps re-using the original
    // property)

    // for updating the selected value:
    if (justSelected()) {
      newState = {...newState, typedValue: actualVal, selectHappened: false}
    }

    this.setState(newState)
  }

  getInitialValuesAfterLoading() {
    const {values, selectedValue} = this.props
    // it reloaded; maybe because a dependent var
    // want to re-init

    // if selectedValue is present in the values, set it; else zero it out (TODO)
    let newSelectedValue = ''
    if (values.includes(selectedValue)) {
      newSelectedValue = selectedValue
    }

    return {
      shownValues: values,
      typedValue: newSelectedValue,
      loaded: true,
      actualVal: newSelectedValue,
    }
  }

  filterVals = needle => {
    const {values} = this.props

    // if there is no value, set the shownValues to everything
    // and set the typedValue to nothing (zero it out)
    // reset the selectIndex too
    if (!needle) {
      this.setState({shownValues: values, typedValue: needle, selectIndex: -1})
    } else {
      const result = values.filter(val =>
        val.toLowerCase().includes(needle.toLowerCase())
      )

      // always reset the selectIndex when doing filtering;  because
      // if it had a value, and then they type, the shownValues changes
      // so need to reset
      this.setState({
        shownValues: result,
        typedValue: needle,
        menuOpen: MenuStatus.Open,
        selectIndex: -1,
      })
    }
  }

  maybeSelectNextItem = event => {
    const {shownValues, selectIndex, typedValue} = this.state
    const {values} = this.props

    let newIndex = -1

    if (event.keyCode === 40) {
      // down arrow
      newIndex = selectIndex + 1
    } else if (event.keyCode === 38) {
      // up arrow
      newIndex = selectIndex - 1
    }

    const numItems = shownValues.length
    const newValueWaHighlighted =
      numItems && newIndex >= 0 && newIndex < numItems
    if (newValueWaHighlighted) {
      this.setState({selectIndex: newIndex})
      return
    }

    if (event.keyCode === 13) {
      // return/enter key
      // lose focus, reset the selectIndex to -1, & close the menu:
      event.target.blur()

      if (numItems && selectIndex >= 0 && selectIndex < numItems) {
        // they used the arrows; just pressed return
        this.handleSelect(shownValues[selectIndex], true)
      } else {
        // the person could have been typing and pressed return, need to
        // make sure the value in the input field is real/legal:

        // but:  if the value they typed is LEGAL (in the list/dropdown values), set it;
        // else: reset to the previous real/legal value:
        if (values.includes(typedValue)) {
          // is is a real legal value
          this.handleSelect(typedValue, true)
        } else {
          const newState = {
            menuOpen: MenuStatus.Closed,
            selectIndex: -1,
            ...this.getRealValue(),
          }
          this.setState(newState)
        }
      }
    }
  }

  // want on click away to set it? no
  // if the entire item loses focus, then
  // the input should show the actual selected item, not what the user typed in;
  // only want to show valid values when the component is not actively being used
  onClickAwayHere = () => {
    //  reset:
    this.setState(this.getRealValue())
  }

  getRealValue = () => {
    const {actualVal, typedValue} = this.state
    const {selectedValue} = this.props

    if (actualVal || selectedValue) {
      const realValue = selectedValue ?? actualVal

      if (typedValue !== realValue) {
        return {typedValue: realValue}
      }
    }
  }

  render() {
    const {selectedValue, values, name, status} = this.props
    const {typedValue, shownValues, menuOpen, selectIndex} = this.state
    const dropdownStatus =
      values.length === 0 ? ComponentStatus.Disabled : ComponentStatus.Default

    const placeHolderText = this.getPlaceHolderText('Select a Value')

    const widthStyle = this.getWidth(placeHolderText)

    const getInnerComponent = () => {
      if (status === RemoteDataState.Loading || this.noValuesPresent(true)) {
        return placeHolderText
      } else {
        return (
          <Input
            style={widthStyle}
            placeholder={placeHolderText}
            onChange={e => this.filterVals(e.target.value)}
            value={typedValue}
            onKeyDown={this.maybeSelectNextItem}
            testID={`variable-dropdown-input-typeAhead--${name}`}
          />
        )
      }
    }

    const thisHandleSelect = this.handleSelect.bind(this)
    return (
      <Dropdown
        style={{width: '140px'}}
        className="variable-dropdown--dropdown"
        testID={this.props.testID || `variable-dropdown--${name}`}
        onClickAway={this.onClickAwayHere}
        menuOpen={menuOpen}
        button={(active, onClick) => (
          <Dropdown.Button
            active={active}
            onClick={onClick}
            testID="variable-dropdown--button"
            status={dropdownStatus}
          >
            {getInnerComponent()}
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu
            style={widthStyle}
            onCollapse={onCollapse}
            theme={DropdownMenuTheme.Amethyst}
          >
            {shownValues.map(function(value, index) {
              let classN = 'variable-dropdown--item'
              // highlight when arrowing; like a hover
              if (index === selectIndex) {
                classN += ' active'
              }
              return (
                <Dropdown.Item
                  key={value}
                  id={value}
                  value={value}
                  onClick={thisHandleSelect}
                  selected={value === selectedValue}
                  testID="variable-dropdown--item"
                  className={classN}
                >
                  {value}
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

  private handleSelect = (selectedValue: string, closeMenuNow?: boolean) => {
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
      selectIndex: -1,
    }

    if (closeMenuNow) {
      newState['menuOpen'] = MenuStatus.Closed
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
    if (this.noValuesPresent(false)) {
      return 'No Values'
    }

    return defaultText
  }

  noValuesPresent = useAllValues => {
    const {status, values} = this.props
    const {shownValues} = this.state
    const valsToUse = useAllValues ? values : shownValues

    const result =
      status === RemoteDataState.Done && (!valsToUse || valsToUse.length === 0)

    return result
  }
}

const mstp = (state: AppState, props: OwnProps) => {
  const {variableID} = props
  const variable = getVariable(state, variableID)
  const selected =
    variable.selected && variable.selected.length ? variable.selected[0] : null

  // the values are the options for the dropdown
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
