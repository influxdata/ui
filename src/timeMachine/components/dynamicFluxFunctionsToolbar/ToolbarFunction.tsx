// Libraries
import React, {FC, createRef} from 'react'

// Component
import FunctionTooltipContents from 'src/timeMachine/components/dynamicFluxFunctionsToolbar/FunctionTooltipContents'
import {
  Appearance,
  Button,
  ComponentColor,
  ComponentSize,
  Popover,
  PopoverInteraction,
  PopoverPosition,
} from '@influxdata/clockface'

// Types
import {Fluxdocs} from 'src/client/fluxdocsdRoutes'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface Props {
  func: Fluxdocs
  onClickFunction: (func: Fluxdocs) => void
  testID: string
  searchTerm: string
}

const defaultProps = {
  testID: 'flux-function',
}

const ToolbarFunction: FC<Props> = ({
  func,
  onClickFunction,
  testID,
  searchTerm,
}) => {
  const functionRef = createRef<HTMLDListElement>()
  const handleClickFunction = () => {
    onClickFunction(func)
    if (searchTerm) {
      event('flux.function.searched', {searchTerm: searchTerm})
    }
    event('flux.function.injected', {name: `${func.package}.${func.name}`})
  }
  return (
    <>
      <Popover
        appearance={Appearance.Outline}
        enableDefaultStyles={false}
        position={PopoverPosition.ToTheLeft}
        triggerRef={functionRef}
        showEvent={PopoverInteraction.Hover}
        hideEvent={PopoverInteraction.Hover}
        distanceFromTrigger={8}
        testID="toolbar-popover"
        contents={() => <FunctionTooltipContents func={func} />}
      />
      <dd
        ref={functionRef}
        data-testid={`flux--${testID}`}
        className="flux-toolbar--list-item flux-toolbar--function"
      >
        <code>{`${func.package}.${func.name}`}</code>
        <Button
          testID={`flux--${testID}--inject`}
          text="Inject"
          onClick={handleClickFunction}
          size={ComponentSize.ExtraSmall}
          className="flux-toolbar--injector"
          color={ComponentColor.Primary}
        />
      </dd>
    </>
  )
}
ToolbarFunction.defaultProps = defaultProps
export default ToolbarFunction
