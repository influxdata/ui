// Libraries
import React, {FC, createRef} from 'react'

// Component
import {
  Popover,
  PopoverPosition,
  PopoverInteraction,
  Appearance,
  Button,
  ComponentSize,
  ComponentColor,
} from '@influxdata/clockface'

import {isFlagEnabled} from 'src/shared/utils/featureFlag'

type OptionType = Record<string, any>

interface Props {
  option: OptionType
  extractor: (func: OptionType) => string
  onClick: (func: OptionType) => void
  testID: string
  ToolTipContent?: (props: {
    item: any
    searchTerm?: string
    setToolTipPopup?: (boolean: boolean) => void
    setHoverdFunction?: any
  }) => JSX.Element
  searchTerm?: string
  setToolTipPopup?: (boolean: boolean) => void
  setHoverdFunction?: (string: string) => void
}

const defaultProps = {
  testID: 'flux-injection-option',
}

const FluxInjectionOption: FC<Props> = ({
  option,
  extractor,
  onClick,
  testID,
  ToolTipContent,
  searchTerm,
  setToolTipPopup,
  setHoverdFunction,
}) => {
  const itemRef = createRef<HTMLDListElement>()
  const handleClick = () => {
    onClick(option)
  }
  const fullClick = () => {
    if (!isFlagEnabled('fluxEditorButtonStyling')) {
      return
    }
    onClick(option)
  }

  const classer = [
    ['flux-toolbar--list-item', true],
    ['flux-toolbar--function', true],
    ['flux-toolbar--new-style', isFlagEnabled('fluxEditorButtonStyling')],
  ]
    .filter(c => c[1])
    .map(c => c[0])
    .join(' ')

  return (
    <>
      {!!ToolTipContent && (
        <Popover
          appearance={Appearance.Outline}
          enableDefaultStyles={false}
          position={PopoverPosition.ToTheLeft}
          triggerRef={itemRef}
          showEvent={PopoverInteraction.Hover}
          hideEvent={PopoverInteraction.Hover}
          distanceFromTrigger={8}
          testID="toolbar-popover"
          contents={() => (
            <ToolTipContent
              item={option}
              searchTerm={searchTerm}
              setToolTipPopup={setToolTipPopup}
              setHoverdFunction={setHoverdFunction}
            />
          )}
        />
      )}
      <dd
        ref={itemRef}
        data-testid={`flux--${testID}`}
        className={classer}
        onClick={fullClick}
      >
        <code>{extractor(option)}</code>
        {!isFlagEnabled('fluxEditorButtonStyling') && (
          <Button
            testID={`flux--${testID}--inject`}
            text="Inject"
            onClick={handleClick}
            size={ComponentSize.ExtraSmall}
            className="flux-toolbar--injector"
            color={ComponentColor.Primary}
          />
        )}
      </dd>
    </>
  )
}

FluxInjectionOption.defaultProps = defaultProps

export default FluxInjectionOption
