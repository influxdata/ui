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

// Types
import {FluxToolbarFunction} from 'src/types/shared'
import {Secret} from 'src/types'

type OptionType = FluxToolbarFunction | Secret

interface Props {
  option: OptionType
  onClick: (func: OptionType) => void
  testID: string
  ToolTipContent?: (props: {item: any}) => JSX.Element
}

const defaultProps = {
  testID: 'flux-injection-option',
}

const FluxInjectionOption: FC<Props> = ({
  option,
  onClick,
  testID,
  ToolTipContent,
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
          contents={() => <ToolTipContent item={option} />}
        />
      )}
      <dd
        ref={itemRef}
        data-testid={`flux--${testID}`}
        className="flux-toolbar--list-item flux-toolbar--function"
      >
        <code>{option.name || (option as Secret).id}</code>
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
