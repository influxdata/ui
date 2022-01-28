// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import Select from 'react-select'

import {InfluxColors} from '@influxdata/clockface'

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

interface MyState {
  shownValues: string[]
  loaded: boolean
}

class VariableDropdownReactSelect extends PureComponent<Props, MyState> {
  constructor(props) {
    super(props)

    const defaultState = {
      shownValues: props.values,
      loaded: false,
    }

    // if it's a csv var, loading is instantaneous, so if it is done just set it:
    if (props.status === RemoteDataState.Done) {
      defaultState.loaded = true
    }

    this.state = defaultState
  }

  // set the 'shownValues' after loading, and
  componentDidUpdate(prevProps) {
    const {values, status} = this.props
    const {values: prevVals, status: prevStatus} = prevProps
    const {loaded} = this.state

    let newState = {}

    const justLoaded =
      status === RemoteDataState.Done && prevStatus !== RemoteDataState.Done

    // this is for updating the values:
    // (only want this to run *once* when the values get loaded)
    if (justLoaded) {
      newState = this.getInitialValuesAfterLoading()
    } else if (
      !loaded &&
      status === RemoteDataState.Done &&
      prevVals.length !== values.length
    ) {
      newState = {
        shownValues: values,
        loaded: true,
      }
    }

    this.setState(newState)
  }

  getInitialValuesAfterLoading() {
    const {values} = this.props
    // it reloaded; maybe because of a dependent var
    // want to re-init

    return {
      shownValues: values,
      loaded: true,
    }
  }

  makeCustomStyles = () => {
    const foreground = InfluxColors.White
    const inputBackground = 'black'
    const background = '#2c2d35'
    const focusColor = '#46454e'
    const selectColor = InfluxColors.Comet // '#ce58eb'
    const dropdownBackgroundFocused = '#5d5f6f'
    const dropdownBackgroundNotFocused = InfluxColors.Wolf // '#828294'  was '#828497'
    const clearIndicatorHoverColor = InfluxColors.White

    return {
      selectColor,
      styles: {
        option: (provided, state) => {
          let backgroundColor = state.isFocused ? focusColor : background

          if (state.isSelected) {
            backgroundColor = selectColor
          }

          return {
            ...provided,
            color: foreground,
            backgroundColor,
            padding: 10,
          }
        },
        clearIndicator: provided => {
          return {
            ...provided,
            '&:hover': {
              color: clearIndicatorHoverColor,
            },
          }
        },
        control: () => ({
          width: 225,
          height: 40,
          color: foreground,
          padding: 3,
          backgroundColor: background,
          display: 'flex',
        }),
        valueContainer: provided => ({
          ...provided,
          color: foreground,
          backgroundColor: inputBackground,
        }),
        placeHolder: provided => ({
          ...provided,
          color: foreground,
          backgroundColor: inputBackground,
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
        dropdownIndicator: (provided, state) => {
          const hoverBackground = state.isFocused
            ? dropdownBackgroundFocused
            : dropdownBackgroundNotFocused

          return {
            ...provided,
            color: foreground,
            '&:hover': {
              background: hoverBackground,
              color: foreground,
            },
          }
        },
        singleValue: (provided, state) => {
          const opacity = state.isDisabled ? 0.5 : 1
          const transition = 'opacity 300ms'

          return {
            ...provided,
            opacity,
            transition,
            color: foreground,
            backgroundColor: inputBackground,
          }
        },
        menu: provided => ({
          ...provided,
          zIndex: 15,
          backgroundColor: background,
        }),
      },
    }
  }

  customStyles = this.makeCustomStyles()

  render() {
    const {selectedValue, name, status} = this.props
    const {shownValues} = this.state

    const isDisabled = !Array.isArray(shownValues) || shownValues.length === 0

    let realVals = []

    //  make them all look like: { value: 'vanilla', label: 'vanilla' }
    if (!isDisabled) {
      realVals = shownValues.map(val => ({value: val, label: val}))
    }
    const placeHolderText = this.getPlaceHolderText('Select a Value')

    const onChange = selection => {
      if (selection && selection.value) {
        this.handleSelect(selection.value)
      }
    }

    // primary50 is the color that is used when an item is clicked on to change the selection
    // have not found an alternative way (via the customStyles) to change that color)
    const selectedObjectValue = {value: selectedValue, label: selectedValue}
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
        styles={this.customStyles.styles}
        name={name}
        options={realVals}
        placeholder={placeHolderText}
        theme={theme => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary50: this.customStyles.selectColor,
          },
        })}
      />
    )
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
      status === RemoteDataState.Done &&
      (!Array.isArray(valsToUse) || valsToUse.length === 0)
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

export default connector(VariableDropdownReactSelect)
