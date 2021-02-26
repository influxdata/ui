// Libraries
import React, {FunctionComponent, useEffect, useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  SelectGroup,
  ButtonShape,
  FlexBox,
  FlexDirection,
  ComponentSize,
  AlignItems,
} from '@influxdata/clockface'
import BuilderCard from 'src/timeMachine/components//builderCard/BuilderCard'
import SelectorList from 'src/timeMachine/components/SelectorList'

// Utils
import {
  multiSelectBuilderFunction,
  singleSelectBuilderFunction,
} from 'src/timeMachine/actions/queryBuilderThunks'

import {setFunctions} from 'src/timeMachine/actions/queryBuilder'
import {setIsAutoFunction} from 'src/shared/actions/currentExplorer'
import {
  getActiveGraphType,
  getActiveQuery,
  getIsInCheckOverlay,
} from 'src/timeMachine/selectors'

// Constants
import {
  FUNCTIONS,
  getDefaultAutoFunctions,
} from 'src/timeMachine/constants/queryBuilder'

// Types
import {AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const FunctionSelector: FunctionComponent<Props> = ({
  activeGraphType,
  isInCheckOverlay,
  onMultiSelectBuilderFunction,
  onSetFunctions,
  onSetIsAutoFunction,
  onSingleSelectBuilderFunction,
  savedFunctions,
}) => {
  const autoFunctions = getDefaultAutoFunctions(activeGraphType).map(
    f => f.name
  )

  const [isAutoFunction, setIsAutoFunction] = useState(
    !isInCheckOverlay &&
      savedFunctions.length === 1 &&
      autoFunctions.includes(savedFunctions[0])
  )

  useEffect(() => {
    if (isAutoFunction && autoFunctions.includes(savedFunctions[0]) === false) {
      onSingleSelectBuilderFunction(autoFunctions[0])
    }
  }, [
    autoFunctions,
    isAutoFunction,
    onSingleSelectBuilderFunction,
    savedFunctions,
  ])

  const functionList = isAutoFunction
    ? autoFunctions
    : FUNCTIONS.map(f => f.name)

  const handleSetAutoFunction = (bool: boolean): void => {
    setIsAutoFunction(bool)
    onSetIsAutoFunction(bool)
  }

  const setFunctionSelectionMode = (mode: 'custom' | 'auto') => {
    if (mode === 'custom') {
      handleSetAutoFunction(false)
      return
    }
    const newFunctions = savedFunctions.filter(f => autoFunctions.includes(f))
    if (newFunctions.length === 0) {
      onSetFunctions([autoFunctions[0]])
    } else if (newFunctions.length > 1) {
      onSetFunctions([newFunctions[0]])
    } else {
      onSetFunctions(newFunctions)
    }
    handleSetAutoFunction(true)
  }

  const onSelectFunction = isAutoFunction
    ? onSingleSelectBuilderFunction
    : onMultiSelectBuilderFunction

  if (isInCheckOverlay) {
    return (
      <>
        <BuilderCard.Header
          title="Aggregate Function"
          className="aggregation-selector-header"
        />
        <SelectorList
          items={functionList}
          selectedItems={savedFunctions}
          onSelectItem={onSingleSelectBuilderFunction}
          multiSelect={false}
        />
      </>
    )
  }

  const validSavedFunctions = savedFunctions.filter(func =>
    functionList.includes(func)
  )
  let selectedFunctions = savedFunctions
  if (isAutoFunction) {
    selectedFunctions = validSavedFunctions.length
      ? validSavedFunctions
      : autoFunctions
  }

  return (
    <>
      <BuilderCard.Header
        title="Aggregate Function"
        className="aggregation-selector-header"
      />
      <BuilderCard.Menu className="aggregation-selector-menu">
        <FlexBox
          direction={FlexDirection.Column}
          margin={ComponentSize.ExtraSmall}
          alignItems={AlignItems.Stretch}
        >
          <SelectGroup
            shape={ButtonShape.StretchToFit}
            size={ComponentSize.ExtraSmall}
          >
            <SelectGroup.Option
              name="custom"
              id="custom-function"
              testID="custom-function"
              active={!isAutoFunction}
              value="custom"
              onClick={setFunctionSelectionMode}
              titleText="Custom"
            >
              Custom
            </SelectGroup.Option>
            <SelectGroup.Option
              name="auto"
              id="auto-function"
              testID="auto-function"
              active={isAutoFunction}
              value="auto"
              onClick={setFunctionSelectionMode}
              titleText="Auto"
            >
              Auto
            </SelectGroup.Option>
          </SelectGroup>
        </FlexBox>
      </BuilderCard.Menu>
      <SelectorList
        items={functionList}
        selectedItems={selectedFunctions}
        onSelectItem={onSelectFunction}
        multiSelect={!isAutoFunction}
      />
    </>
  )
}

const mstp = (state: AppState) => {
  const activeGraphType = getActiveGraphType(state)
  const {builderConfig} = getActiveQuery(state)
  const {functions} = builderConfig
  return {
    activeGraphType,
    isInCheckOverlay: getIsInCheckOverlay(state),
    savedFunctions: functions.map(f => f.name),
  }
}

const mdtp = {
  onMultiSelectBuilderFunction: multiSelectBuilderFunction,
  onSingleSelectBuilderFunction: singleSelectBuilderFunction,
  onSetFunctions: setFunctions,
  onSetIsAutoFunction: setIsAutoFunction,
}

const connector = connect(mstp, mdtp)

export default connector(FunctionSelector)
