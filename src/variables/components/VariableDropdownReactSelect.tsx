// Libraries
import React, {PureComponent, ChangeEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import Select from 'react-select'

// Components
import {
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
      actualVal: '',
      selectIndex: -1,
      shownValues: props.values,
      selectHappened: false,
      menuOpen: null,
      loaded: false,
    }

    // if it's a csv var, loading is instantaneous, so if it is done just set it:
    if (props.status === RemoteDataState.Done) {
      defaultState.actualVal = props.selectedValue
      defaultState.loaded = true
    }

    this.state = defaultState
  }

  // set the 'shownValues' after loading, and
  // resets the menuOpen variable
  componentDidUpdate(prevProps, prevState) {
    const {values, selectedValue, status} = this.props
    const {values: prevVals, status: prevStatus} = prevProps
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

    /**
     * unset the menuOpen; it should be set to closed (or open) only once; then undone
     * this is needed because: (from clockface Dropdown.tsx documentation):
     * if the string is set to 'open', and then the user closes it, and the code sets it to open again,
     * unless the code sets it to something else in between (like null or 'close'),
     * then nothing will happen- the menu will not open)
     */

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
    // it reloaded; maybe because of a dependent var
    // want to re-init

    return {
      shownValues: values,
      loaded: true,
    }
  }

  render() {
    const {selectedValue, name, status} = this.props
    const {shownValues} = this.state

    //const shownValues = ['ab', 'c', 'd', 'ernie', 'rosita', 'bert']
    const isDisabled = !shownValues || shownValues.length === 0

    //const placeHolderText = this.getPlaceHolderText('Select a Value')

    console.log(`trying to render ${name}.....`, shownValues)
    let realVals = []
    //   { value: 'vanilla', label: 'Vanilla' }
    if (shownValues && shownValues.length) {
      realVals = shownValues.map(val => ({value: val, label: val}))
    }
    const placeHolderText = this.getPlaceHolderText('Select a Value')

    console.log(`arghh; for ${name}`, realVals)
    const foreground = 'white'
    const background='#2c2d35'
    const focusColor = '#46454e'
        const selectColor = '#ce58eb'

    // const genericColors = (provided) => ({
    //   ...provided,
    //   color:foreground,
    //   backgroundColor:background,
    // })


    const customStyles = {
      option: (provided, state) => {
        let backgroundColor = state.isSelected? selectColor : background
        console.log("state??", state)
        if (state.isFocused) {
          backgroundColor = focusColor
        }
        return {
        ...provided,
        color: foreground,
        backgroundColor,
        padding: 10,
      }},
      control: () => ({
        width: 225,
        height:30,
        color: foreground,
        backgroundColor: background,
        display: 'flex',
      }),
      valueContainer: (provided) => ({
        ...provided,
        color:foreground,
        backgroundColor:background,
      }),
      placeHolder:(provided) => ({
        ...provided,
        color:foreground,
        backgroundColor:background,
      }),
      indicatorSeparator: () => ({
        display: 'none',
      }),
      dropdownIndicator: (provided) => ({
        ...provided,
        color:foreground,
      }),
      singleValue: (provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1
        const transition = 'opacity 300ms'

        return {...provided, opacity, transition,
          color:foreground,
          backgroundColor:background,
        }
      },
      menu: (provided)=> ({
        ...provided,
        zIndex:15,
        backgroundColor: background,
      })
    }

    const onChange=(selection) => {
      // console.log("made a change:", selection)
      if (selection && selection.value) {
        this.handleSelect(selection.value)
      }
    }
    //    const style={width:200}
    const selectedObjectValue = {value:selectedValue, label:selectedValue}
    return (
      <Select
        classNamePrefix="select"
        onChange={onChange}
        defaultValue={selectedObjectValue}
        isDisabled={isDisabled}
        isLoading={status === RemoteDataState.Loading || isDisabled}
        isClearable={true}
        isRtl={false}
        isSearchable={true}
        styles={customStyles}
        name={name}
        options={realVals}
        placeholder={placeHolderText}
      />
    )
    //
  }

  private getWidth(placeHolderText) {
    const {values} = this.props
    const allVals = [placeHolderText, ...values]
    const longestItemWidth = Math.floor(
      allVals.reduce(function(a, b) {
        return a.length > b.length ? a : b
      }, '').length * 10
    )

    const widthLength = Math.max(192, longestItemWidth)
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
    if (this.noFilteredValuesPresent()) {
      return 'No Values'
    }

    return defaultText
  }

  noFilteredValuesPresent = () => {
    const {shownValues} = this.state
    return this.internalNoValuesPresent(shownValues)
  }

  noValuesPresent = () => {
    const {values} = this.props
    return this.internalNoValuesPresent(values)
  }

  internalNoValuesPresent = valsToUse => {
    const {status} = this.props

    return (
      status === RemoteDataState.Done && (!valsToUse || valsToUse.length === 0)
    )
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
