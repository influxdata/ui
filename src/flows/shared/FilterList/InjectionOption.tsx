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
  }) => JSX.Element
  searchTerm?: string
  setToolTipPopup?: (boolean: boolean) => void
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
}) => {
  const itemRef = createRef<HTMLDListElement>()
  const handleClick = () => {
    onClick(option)
  }

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
            />
          )}
        />
      )}
      <dd
        ref={itemRef}
        data-testid={`flux--${testID}`}
        className="flux-toolbar--list-item flux-toolbar--function"
      >
        <code>{extractor(option)}</code>
        <Button
          testID={`flux--${testID}--inject`}
          text="Inject"
          onClick={handleClick}
          size={ComponentSize.ExtraSmall}
          className="flux-toolbar--injector"
          color={ComponentColor.Primary}
        />
      </dd>
    </>
  )
}

FluxInjectionOption.defaultProps = defaultProps

export default FluxInjectionOption
